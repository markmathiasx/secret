import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'store.dart';
import 'commerce_ui.dart';

const apiBase = String.fromEnvironment('API_BASE_URL');
const firebaseKey = String.fromEnvironment('FIREBASE_API_KEY');
const firebaseAppId = String.fromEnvironment('FIREBASE_APP_ID');
const firebaseProject = String.fromEnvironment('FIREBASE_PROJECT_ID');
const firebaseSender = String.fromEnvironment('FIREBASE_SENDER_ID');
const googleEnabled = bool.fromEnvironment('ENABLE_GOOGLE_AUTH');
const appleEnabled = bool.fromEnvironment('ENABLE_APPLE_AUTH');
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  bool authReady = false;
  if ([
    firebaseKey,
    firebaseAppId,
    firebaseProject,
    firebaseSender,
  ].every((v) => v.isNotEmpty)) {
    try {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: firebaseKey,
          appId: firebaseAppId,
          messagingSenderId: firebaseSender,
          projectId: firebaseProject,
        ),
      );
      authReady = true;
    } catch (_) {
      authReady = false;
    }
  }
  runApp(MdhApp(authReady: authReady));
}

class MdhApp extends StatelessWidget {
  const MdhApp({super.key, required this.authReady});
  final bool authReady;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'MDH 3D',
    debugShowCheckedModeBanner: false,
    locale: const Locale('pt', 'BR'),
    supportedLocales: const [Locale('pt', 'BR')],
    localizationsDelegates: GlobalMaterialLocalizations.delegates,
    theme: commerceTheme(Brightness.light),
    darkTheme: commerceTheme(Brightness.dark),
    home: apiOrigin(apiBase) == null
        ? const SetupScreen()
        : StoreScreen(origin: apiOrigin(apiBase)!, authReady: authReady),
  );
}

class SetupScreen extends StatelessWidget {
  const SetupScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('MDH 3D')),
    body: const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text(
          'A loja mobile está aguardando configuração.\nDefina uma origem HTTPS válida para API_BASE_URL antes de distribuir este aplicativo.',
          textAlign: TextAlign.center,
        ),
      ),
    ),
  );
}

class StoreScreen extends StatefulWidget {
  const StoreScreen({super.key, required this.origin, required this.authReady});
  final Uri origin;
  final bool authReady;
  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> {
  late final StoreApi api = StoreApi(widget.origin);
  final search = TextEditingController();
  List<Product> products = [];
  List<Map<String, dynamic>> categories = [];
  Map<String, Product> saved = {};
  Map<String, int> cart = {};
  Set<String> favorites = {};
  String? category, cursor, error, categoriesError;
  String appliedSearch = '';
  bool loading = false;
  int tab = 0, generation = 0;
  StreamSubscription<User?>? authSubscription;
  late String observedUid;
  String get uid => widget.authReady
      ? FirebaseAuth.instance.currentUser?.uid ?? 'guest'
      : 'guest';
  String get storageKey => 'mdh:${widget.origin}:$observedUid';
  @override
  void initState() {
    super.initState();
    observedUid = uid;
    if (widget.authReady) {
      authSubscription = FirebaseAuth.instance.userChanges().listen((user) {
        if (!mounted) return;
        final nextUid = user?.uid ?? 'guest';
        if (nextUid != observedUid) {
          observedUid = nextUid;
          setState(() {
            cart = {};
            saved = {};
            favorites = {};
          });
          restore();
        } else {
          setState(() {});
        }
      });
    }
    restore();
    loadCategories();
    load();
  }

  @override
  void dispose() {
    authSubscription?.cancel();
    search.dispose();
    api.close();
    super.dispose();
  }

  Future<void> restore() async {
    final key = storageKey;
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(key);
      final data = raw == null
          ? <String, dynamic>{}
          : jsonDecode(raw) as Map<String, dynamic>;
      if (!mounted || key != storageKey) return;
      setState(() {
        cart = Map<String, int>.from(data['cart'] ?? {});
        favorites = Set<String>.from(data['favorites'] ?? []);
        saved = {
          for (final j in data['products'] ?? [])
            (j['id'] as String): Product.fromJson(Map<String, dynamic>.from(j)),
        };
      });
    } catch (_) {
      if (mounted) {
        setState(() => error = 'O carrinho salvo não pôde ser restaurado.');
      }
    }
  }

  Future<void> persist() async {
    final key = storageKey;
    final payload = jsonEncode({
      'cart': cart,
      'favorites': favorites.toList(),
      'products': saved.values.map((p) => p.toJson()).toList(),
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = await prefs.setString(key, payload);
      if (!stored) throw StateError('Armazenamento indisponível');
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Não foi possível salvar neste aparelho. Suas alterações podem se perder ao fechar.',
            ),
          ),
        );
      }
    }
  }

  Future<void> loadCategories() async {
    try {
      final result = await api.get('/api/categories');
      if (mounted) {
        setState(() {
          categories = (result['items'] as List)
              .map((c) => Map<String, dynamic>.from(c))
              .toList();
          categoriesError = null;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(
          () => categoriesError = 'Categorias indisponíveis. Tente novamente.',
        );
      }
    }
  }

  Future<void> load({bool more = false}) async {
    if (more && (loading || cursor == null)) return;
    final requestedSearch = more ? appliedSearch : search.text.trim();
    final ticket = ++generation;
    setState(() {
      loading = true;
      error = null;
      if (!more) {
        products = [];
        cursor = null;
        appliedSearch = requestedSearch;
      }
    });
    try {
      final result = await api.get(
        '/api/products',
        query: {
          'limit': '24',
          'categoryId': ?category,
          if (requestedSearch.isNotEmpty) 'q': requestedSearch,
          if (more && cursor != null) 'cursor': cursor!,
        },
      );
      if (!mounted || ticket != generation) return;
      final items = (result['items'] as List)
          .map((j) => Product.fromJson(Map<String, dynamic>.from(j)))
          .toList();
      setState(() {
        products = more ? [...products, ...items] : items;
        for (final item in items) {
          if (saved.containsKey(item.id)) saved[item.id] = item;
        }
        cursor = result['nextCursor'] as String?;
        loading = false;
      });
    } catch (_) {
      if (mounted && ticket == generation) {
        setState(() {
          loading = false;
          error =
              'Sem conexão com o catálogo. Verifique sua internet e tente novamente.';
        });
      }
    }
  }

  void add(Product p) {
    if (p.stock <= 0) return;
    final quantity = (cart[p.id] ?? 0) + 1;
    if (quantity > p.stock) return;
    setState(() {
      saved[p.id] = p;
      cart[p.id] = quantity;
    });
    persist();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Adicionado à sua sacola local.')),
    );
  }

  void favorite(Product p) {
    setState(() {
      saved[p.id] = p;
      if (!favorites.add(p.id)) favorites.remove(p.id);
    });
    persist();
  }

  Future<void> openProduct(Product p) async {
    Product current;
    try {
      current = Product.fromJson(
        Map<String, dynamic>.from(await api.get('/api/products/${p.id}')),
      );
      if (saved.containsKey(current.id)) {
        setState(() => saved[current.id] = current);
        persist();
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Não foi possível atualizar esta peça. Tente novamente.',
          ),
        ),
      );
      return;
    }
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            ProductScreen(product: current, onAdd: () => add(current)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'MDH 3D',
        style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 2),
      ),
      actions: [
        IconButton(
          tooltip: 'Seus favoritos',
          onPressed: showFavorites,
          icon: const Icon(Icons.favorite_border_rounded),
        ),
        IconButton(
          tooltip: 'Atualizar catálogo',
          onPressed: () {
            loadCategories();
            load();
          },
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    bottomNavigationBar: NavigationBar(
      selectedIndex: tab,
      onDestinationSelected: (i) => setState(() => tab = i),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          label: 'Início',
        ),
        NavigationDestination(
          icon: Icon(Icons.grid_view_rounded),
          label: 'Categorias',
        ),
        NavigationDestination(
          icon: Icon(Icons.shopping_bag_outlined),
          label: 'Carrinho',
        ),
        NavigationDestination(icon: Icon(Icons.person_outline), label: 'Conta'),
      ],
    ),
    body: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1200),
        child: switch (tab) {
          0 => catalog(),
          1 => categoryDirectory(),
          2 => bag(),
          _ => AccountScreen(
            api: api,
            authReady: widget.authReady,
            onIdentityChanged: () async {
              if (!mounted) return;
              observedUid = uid;
              setState(() {
                cart = {};
                saved = {};
                favorites = {};
              });
              await restore();
            },
          ),
        },
      ),
    ),
  );
  void selectCategory(String? id) {
    search.clear();
    setState(() {
      category = id;
      tab = 0;
    });
    load();
  }

  Future<void> showFavorites() async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => FractionallySizedBox(
        heightFactor: 0.9,
        child: StatefulBuilder(
          builder: (context, updateSheet) => Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(child: Text('Seus favoritos', style: Theme.of(context).textTheme.titleLarge)),
                    IconButton(
                      tooltip: 'Fechar favoritos',
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: productGrid(
                  saved.values.where((p) => favorites.contains(p.id)).toList(),
                  empty: 'Salve as peças que você quer encontrar depois.',
                  onFavorite: (p) {
                    favorite(p);
                    updateSheet(() {});
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget categoryDirectory() => RefreshIndicator(
    onRefresh: loadCategories,
    child: ListView(
      key: const PageStorageKey('category-directory'),
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(20),
      children: [
        Text('Encontre seu universo', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Explore por coleção. Cada seleção abre o catálogo filtrado.'),
        const SizedBox(height: 24),
        CollectionTile(name: 'Todas as peças', selected: category == null, onTap: () => selectCategory(null)),
        for (final c in categories) ...[
          const SizedBox(height: 12),
          CollectionTile(
            name: c['name'] as String,
            selected: category == c['id'],
            onTap: () => selectCategory(c['id'] as String),
          ),
        ],
        if (categoriesError != null) CommerceEmptyState(message: categoriesError!),
        if (categoriesError == null && categories.isEmpty)
          const CommerceEmptyState(message: 'As coleções ainda estão sendo carregadas ou não foram cadastradas.'),
      ],
    ),
  );

  Widget catalog() => RefreshIndicator(
    onRefresh: () async {
      await Future.wait([loadCategories(), load()]);
    },
    child: CustomScrollView(
      key: const PageStorageKey('store-catalog'),
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: search,
                  textInputAction: TextInputAction.search,
                  onSubmitted: (_) => load(),
                  decoration: InputDecoration(
                    hintText: 'O que você quer encontrar?',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: IconButton(
                      tooltip: 'Buscar peças',
                      onPressed: () => load(),
                      icon: const Icon(Icons.arrow_forward_rounded),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                if (category == null && appliedSearch.isEmpty) ...[
                  CollectionIntro(onCollections: () => setState(() => tab = 1)),
                  const SizedBox(height: 24),
                ],
                Row(
                  children: [
                    Expanded(child: Text('Explore as coleções', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800))),
                    TextButton(onPressed: () => setState(() => tab = 1), child: const Text('Ver todas')),
                  ],
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(label: const Text('Todas'), selected: category == null, onSelected: (_) => selectCategory(null)),
                      for (final c in categories)
                        Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: ChoiceChip(
                            avatar: Icon(categoryIcon(c['name'] as String), size: 18),
                            label: Text(c['name'] as String),
                            selected: category == c['id'],
                            onSelected: (_) {
                              setState(() => category = c['id'] as String);
                              load();
                            },
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  appliedSearch.isNotEmpty ? 'Resultados para “$appliedSearch”' : category != null ? 'Peças desta coleção' : 'Descubra sua próxima peça',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                const Text('Veja os detalhes e a disponibilidade de cada produto.'),
                if (error != null) ...[
                  CommerceEmptyState(message: error!),
                  Center(child: OutlinedButton(onPressed: () => load(), child: const Text('Tentar novamente'))),
                ],
                if (categoriesError != null)
                  TextButton.icon(onPressed: loadCategories, icon: const Icon(Icons.refresh), label: const Text('Recarregar categorias')),
                if (!loading && error == null && products.isEmpty)
                  CommerceEmptyState(message: 'Nenhuma peça encontrada nesta seleção.', onReset: () => selectCategory(null)),
              ],
            ),
          ),
        ),
        SliverLayoutBuilder(
          builder: (context, constraints) => SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverGrid(
              delegate: SliverChildBuilderDelegate((context, index) => productCard(products[index]), childCount: products.length),
              gridDelegate: commerceGrid(context, constraints.crossAxisExtent - 40),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : cursor != null
                ? OutlinedButton(onPressed: () => load(more: true), child: const Text('Carregar mais peças'))
                : const SizedBox.shrink(),
          ),
        ),
      ],
    ),
  );
  Widget productGrid(List<Product> items, {required String empty, void Function(Product)? onFavorite}) =>
      items.isEmpty
      ? Center(child: CommerceEmptyState(message: empty))
      : LayoutBuilder(
          builder: (context, constraints) => GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: commerceGrid(context, constraints.maxWidth - 40),
            itemCount: items.length,
            itemBuilder: (_, i) => productCard(items[i], onFavorite: onFavorite),
          ),
        );
  Widget productCard(Product p, {void Function(Product)? onFavorite}) => Card(
    clipBehavior: Clip.antiAlias,
    child: InkWell(
      onTap: () => openProduct(p),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                Positioned.fill(
                  child: ColoredBox(
                    color: Theme.of(context).colorScheme.surface,
                    child: Padding(padding: const EdgeInsets.all(12), child: productImage(p)),
                  ),
                ),
                Positioned(
                  right: 4,
                  top: 4,
                  child: IconButton.filledTonal(
                    tooltip: favorites.contains(p.id)
                        ? 'Remover dos favoritos'
                        : 'Favoritar',
                    onPressed: () => (onFavorite ?? favorite)(p),
                    icon: Icon(
                      favorites.contains(p.id)
                          ? Icons.favorite
                          : Icons.favorite_border,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Text(
                  money(p.priceCents),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  p.stock > 0
                      ? 'Disponível'
                      : 'Indisponível',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
  Widget bag() {
    final entries = cart.entries
        .where((e) => saved.containsKey(e.key))
        .toList();
    final total = entries.fold<int>(
      0,
      (sum, e) => sum + saved[e.key]!.priceCents * e.value,
    );
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Sua sacola', style: Theme.of(context).textTheme.headlineMedium),
        const Text(
          'Salva somente neste aparelho e nesta conta. Preços e estoque precisam ser revalidados pelo servidor na compra.',
        ),
        const SizedBox(height: 16),
        if (entries.isEmpty) const Text('Sua sacola está vazia.'),
        for (final e in entries)
          Card(
            child: ListTile(
              title: Text(saved[e.key]!.title),
              subtitle: Text('${e.value} × ${money(saved[e.key]!.priceCents)}'),
              trailing: IconButton(
                tooltip: 'Remover produto',
                icon: const Icon(Icons.delete_outline),
                onPressed: () {
                  setState(() => cart.remove(e.key));
                  persist();
                },
              ),
            ),
          ),
        const SizedBox(height: 16),
        Text(
          'Subtotal estimado: ${money(total)}',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 12),
        const FilledButton(
          onPressed: null,
          child: Text('Pagamento ainda não habilitado'),
        ),
        const Text(
          'Frete, cupons e pagamento não estão disponíveis nesta versão. Nenhum pedido é criado aqui.',
        ),
      ],
    );
  }
}

Widget productImage(Product p) => p.imageUrl == null
    ? const Center(child: Text('Foto original indisponível'))
    : Image.network(
        p.imageUrl!,
        fit: BoxFit.contain,
        semanticLabel: 'Foto de ${p.title}',
        errorBuilder: (_, error, stack) =>
            const Center(child: Text('Não foi possível carregar a foto.')),
      );

class ProductScreen extends StatelessWidget {
  const ProductScreen({super.key, required this.product, required this.onAdd});
  final Product product;
  final VoidCallback onAdd;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(product.title)),
    body: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 900),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            AspectRatio(aspectRatio: 1.4, child: productImage(product)),
            if (product.modelUrl != null)
              SizedBox(
                height: 320,
                child: ModelViewer(
                  src: product.modelUrl!,
                  alt: 'Modelo 3D de ${product.title}',
                  cameraControls: true,
                  ar: false,
                ),
              ),
            const SizedBox(height: 20),
            Text(
              product.title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(
              money(product.priceCents),
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            Text(product.description),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: product.stock > 0 ? onAdd : null,
              icon: const Icon(Icons.shopping_bag_outlined),
              label: Text(
                product.stock > 0 ? 'Adicionar à sacola' : 'Indisponível',
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'As fotos e os modelos exibidos são os arquivos informados pelo catálogo. Consulte dimensões, material e prazo do produto antes da compra.',
            ),
          ],
        ),
      ),
    ),
  );
}

class AccountScreen extends StatefulWidget {
  const AccountScreen({
    super.key,
    required this.api,
    required this.authReady,
    required this.onIdentityChanged,
  });
  final StoreApi api;
  final bool authReady;
  final Future<void> Function() onIdentityChanged;
  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final email = TextEditingController(), password = TextEditingController();
  bool busy = false, register = false;
  String? message;
  Map<String, dynamic>? profile;
  List<Map<String, dynamic>>? addresses, orders;
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> act(
    Future<void> Function() operation, {
    bool identityChanged = false,
  }) async {
    setState(() {
      busy = true;
      message = null;
    });
    try {
      await operation();
      if (identityChanged) {
        await widget.onIdentityChanged();
        if (mounted) {
          setState(() {
            profile = null;
            addresses = null;
            orders = null;
          });
        }
      }
    } on StoreApiException catch (e) {
      if (mounted) setState(() => message = e.message);
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        setState(
          () => message =
              'Não foi possível autenticar (${e.code}). Verifique os dados ou tente novamente.',
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => message = 'Serviço indisponível. Tente novamente.');
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> fetchProfile() async {
    await act(() async {
      final token = await FirebaseAuth.instance.currentUser?.getIdToken();
      if (token == null) throw StateError('Login necessário');
      final data = await widget.api.get('/api/me', token: token);
      if (mounted) {
        setState(() {
          profile = data;
          message = 'Conta autenticada no servidor.';
        });
      }
    });
  }

  Future<void> loadAccount() => act(() async {
    final user = FirebaseAuth.instance.currentUser;
    final token = await user?.getIdToken(true);
    if (user == null || token == null) throw const StoreApiException(401);
    final addressData = await widget.api.get('/api/addresses', token: token);
    final orderData = await widget.api.get('/api/orders', token: token);
    List<Map<String, dynamic>> rows(dynamic value) {
      if (value is! List) throw const FormatException('Resposta inválida.');
      return value.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }

    final nextAddresses = rows(addressData['items']);
    final nextOrders = rows(orderData['items']);
    for (final address in nextAddresses) {
      for (final field in [
        'id',
        'recipient',
        'street',
        'number',
        'city',
        'state',
        'postalCode',
      ]) {
        if (address[field] is! String) {
          throw const FormatException('Endereço inválido.');
        }
      }
    }
    for (final order in nextOrders) {
      boundedInteger(order['totalCents'], 'totalCents');
      for (final field in ['id', 'status', 'createdAt']) {
        if (order[field] is! String) {
          throw const FormatException('Pedido inválido.');
        }
      }
    }
    if (mounted && FirebaseAuth.instance.currentUser?.uid == user.uid) {
      setState(() {
        addresses = nextAddresses;
        orders = nextOrders;
      });
    }
  });

  Future<void> deleteAddress(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Excluir endereço?'),
        content: const Text('Este endereço será removido da sua conta.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Excluir'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    var succeeded = false;
    await act(() async {
      final token = await FirebaseAuth.instance.currentUser?.getIdToken(true);
      if (token == null) throw const StoreApiException(401);
      await widget.api.send(
        'DELETE',
        '/api/addresses/${Uri.encodeComponent(id)}',
        token: token,
      );
      succeeded = true;
    });
    if (mounted && succeeded) await loadAccount();
  }

  Future<void> createAddress() async {
    final fields = <String, String>{
      'recipient': 'Destinatário',
      'postalCode': 'CEP (8 números)',
      'street': 'Rua',
      'number': 'Número',
      'complement': 'Complemento (opcional)',
      'district': 'Bairro (opcional)',
      'city': 'Cidade',
      'state': 'UF (2 letras)',
    };
    final controllers = {
      for (final key in fields.keys) key: TextEditingController(),
    };
    final form = GlobalKey<FormState>();
    Map<String, dynamic>? data;
    try {
      data = await showDialog<Map<String, dynamic>>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Novo endereço'),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Form(
                key: form,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (final entry in fields.entries)
                      TextFormField(
                        controller: controllers[entry.key],
                        maxLength: entry.key == 'state'
                            ? 2
                            : entry.key == 'postalCode'
                            ? 8
                            : entry.key == 'number'
                            ? 30
                            : entry.key == 'street'
                            ? 200
                            : 150,
                        keyboardType: entry.key == 'postalCode'
                            ? TextInputType.number
                            : TextInputType.text,
                        textCapitalization: entry.key == 'state'
                            ? TextCapitalization.characters
                            : TextCapitalization.words,
                        decoration: InputDecoration(labelText: entry.value),
                        validator: (value) {
                          final text = (value ?? '').trim();
                          if (entry.key == 'complement' ||
                              entry.key == 'district') {
                            return null;
                          }
                          if (entry.key == 'postalCode') {
                            return RegExp(r'^\d{8}$').hasMatch(text)
                                ? null
                                : 'Informe 8 números';
                          }
                          if (entry.key == 'state') {
                            return RegExp(r'^[A-Za-z]{2}$').hasMatch(text)
                                ? null
                                : 'Informe a UF';
                          }
                          return text.length >= (entry.key == 'number' ? 1 : 2)
                              ? null
                              : 'Campo obrigatório';
                        },
                      ),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () {
                if (form.currentState!.validate()) {
                  Navigator.pop(context, {
                    for (final entry in controllers.entries)
                      entry.key: entry.key == 'state'
                          ? entry.value.text.trim().toUpperCase()
                          : entry.value.text.trim(),
                  });
                }
              },
              child: const Text('Salvar'),
            ),
          ],
        ),
      );
    } finally {
      for (final controller in controllers.values) {
        controller.dispose();
      }
    }
    if (data == null || !mounted) return;
    var succeeded = false;
    await act(() async {
      final token = await FirebaseAuth.instance.currentUser?.getIdToken(true);
      if (token == null) throw const StoreApiException(401);
      await widget.api.send('POST', '/api/addresses', token: token, body: data);
      succeeded = true;
    });
    if (mounted && succeeded) await loadAccount();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.authReady) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Login indisponível até a configuração segura do Firebase. Sua sacola local continua disponível.',
          ),
        ),
      );
    }
    final user = FirebaseAuth.instance.currentUser;
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text('Sua conta', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 16),
        if (user != null) ...[
          Text(user.email ?? 'Conta conectada'),
          Text(
            user.emailVerified
                ? 'E-mail verificado'
                : 'E-mail ainda não verificado',
          ),
          if (!user.emailVerified)
            Wrap(
              spacing: 8,
              children: [
                TextButton(
                  onPressed: busy
                      ? null
                      : () => act(() => user.sendEmailVerification()),
                  child: const Text('Enviar verificação por e-mail'),
                ),
                TextButton(
                  onPressed: busy
                      ? null
                      : () => act(() async {
                          await user.reload();
                          await FirebaseAuth.instance.currentUser?.getIdToken(
                            true,
                          );
                          if (mounted) {
                            setState(
                              () => message =
                                  FirebaseAuth
                                          .instance
                                          .currentUser
                                          ?.emailVerified ==
                                      true
                                  ? 'E-mail verificado com sucesso.'
                                  : 'A verificação ainda não foi confirmada.',
                            );
                          }
                        }, identityChanged: true),
                  child: const Text('Já verifiquei'),
                ),
              ],
            ),
          OutlinedButton(
            onPressed: busy ? null : fetchProfile,
            child: const Text('Verificar acesso à API'),
          ),
          if (profile != null) Text('Perfil: ${profile!['role'] ?? 'cliente'}'),
          FilledButton.tonal(
            onPressed: busy ? null : loadAccount,
            child: const Text('Atualizar pedidos e endereços'),
          ),
          if (addresses != null) ...[
            Text(
              'Seus endereços',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (addresses!.isEmpty)
              const Text('Você ainda não cadastrou endereços.'),
            for (final address in addresses!)
              ListTile(
                title: Text('${address['recipient']}'),
                subtitle: Text(
                  '${address['street']}, ${address['number']}'
                  '${(address['complement'] as String? ?? '').isEmpty ? '' : ' • ${address['complement']}'}\n'
                  '${(address['district'] as String? ?? '').isEmpty ? '' : '${address['district']} • '}'
                  '${address['city']} — ${address['state']} • CEP ${address['postalCode']}',
                ),
                trailing: IconButton(
                  tooltip: 'Excluir endereço',
                  onPressed: busy
                      ? null
                      : () => deleteAddress(address['id'] as String),
                  icon: const Icon(Icons.delete_outline),
                ),
              ),
          ],
          OutlinedButton.icon(
            onPressed: busy ? null : createAddress,
            icon: const Icon(Icons.add_location_alt_outlined),
            label: const Text('Cadastrar endereço'),
          ),
          if (orders != null) ...[
            Text('Seus pedidos', style: Theme.of(context).textTheme.titleLarge),
            if (orders!.isEmpty)
              const Text('Nenhum pedido encontrado nesta conta.'),
            for (final order in orders!)
              ListTile(
                title: Text('Pedido ${order['id']}'),
                subtitle: Text(
                  'Status: ${order['status']}\n${order['createdAt']}',
                ),
                trailing: Text(
                  money(boundedInteger(order['totalCents'], 'totalCents')),
                ),
              ),
            const Text(
              'Exibidos até 100 pedidos retornados pelo servidor. Rastreamento ainda não integrado.',
            ),
          ],
          TextButton(
            onPressed: busy
                ? null
                : () => act(
                    () => FirebaseAuth.instance.signOut(),
                    identityChanged: true,
                  ),
            child: const Text('Sair'),
          ),
        ] else ...[
          TextField(
            controller: email,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            decoration: const InputDecoration(labelText: 'E-mail'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: password,
            obscureText: true,
            autofillHints: const [AutofillHints.password],
            decoration: const InputDecoration(labelText: 'Senha'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: busy
                ? null
                : () => act(() async {
                    if (register) {
                      await FirebaseAuth.instance
                          .createUserWithEmailAndPassword(
                            email: email.text.trim(),
                            password: password.text,
                          );
                    } else {
                      await FirebaseAuth.instance.signInWithEmailAndPassword(
                        email: email.text.trim(),
                        password: password.text,
                      );
                    }
                    password.clear();
                  }, identityChanged: true),
            child: Text(register ? 'Criar conta' : 'Entrar'),
          ),
          TextButton(
            onPressed: busy ? null : () => setState(() => register = !register),
            child: Text(register ? 'Já tenho uma conta' : 'Criar uma conta'),
          ),
          TextButton(
            onPressed: busy
                ? null
                : () => act(() async {
                    await FirebaseAuth.instance.sendPasswordResetEmail(
                      email: email.text.trim(),
                    );
                    if (mounted) {
                      setState(
                        () => message =
                            'Confira seu e-mail para recuperar a senha.',
                      );
                    }
                  }),
            child: const Text('Esqueci minha senha'),
          ),
          if (googleEnabled)
            OutlinedButton(
              onPressed: busy
                  ? null
                  : () => act(() async {
                      await FirebaseAuth.instance.signInWithProvider(
                        GoogleAuthProvider(),
                      );
                    }, identityChanged: true),
              child: const Text('Entrar com Google'),
            ),
          if (appleEnabled)
            OutlinedButton(
              onPressed: busy
                  ? null
                  : () => act(() async {
                      await FirebaseAuth.instance.signInWithProvider(
                        AppleAuthProvider(),
                      );
                    }, identityChanged: true),
              child: const Text('Entrar com Apple'),
            ),
        ],
        if (busy) const Center(child: CircularProgressIndicator()),
        if (message != null)
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Semantics(liveRegion: true, child: Text(message!)),
          ),
        const SizedBox(height: 24),
        const Text(
          'As contas do site existente não são migradas automaticamente. Pedidos e endereços usam a API autenticada desta plataforma. Privacidade e exclusão da conta ainda precisam de integração antes do lançamento público.',
        ),
      ],
    );
  }
}
