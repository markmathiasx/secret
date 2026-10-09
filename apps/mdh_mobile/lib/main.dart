import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:model_viewer_plus/model_viewer_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'store.dart';

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
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff986b22)),
      scaffoldBackgroundColor: const Color(0xfffaf9f6),
    ),
    darkTheme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xffdfb770),
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: const Color(0xff101419),
    ),
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
  String? category, cursor, error;
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
      if (mounted)
        setState(() => error = 'O carrinho salvo não pôde ser restaurado.');
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
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Não foi possível salvar neste aparelho. Suas alterações podem se perder ao fechar.',
            ),
          ),
        );
    }
  }

  Future<void> loadCategories() async {
    try {
      final result = await api.get('/api/categories');
      if (mounted)
        setState(
          () => categories = (result['items'] as List)
              .map((c) => Map<String, dynamic>.from(c))
              .toList(),
        );
    } catch (_) {
      if (mounted)
        setState(() => error = 'Categorias indisponíveis. Tente novamente.');
    }
  }

  Future<void> load({bool more = false}) async {
    if (more && (loading || cursor == null)) return;
    final ticket = ++generation;
    setState(() {
      loading = true;
      error = null;
      if (!more) {
        products = [];
        cursor = null;
      }
    });
    try {
      final result = await api.get(
        '/api/products',
        query: {
          'limit': '24',
          if (category != null) 'categoryId': category!,
          if (search.text.trim().isNotEmpty) 'q': search.text.trim(),
          if (more && cursor != null) 'cursor': cursor!,
        },
      );
      if (!mounted || ticket != generation) return;
      final items = (result['items'] as List)
          .map((j) => Product.fromJson(Map<String, dynamic>.from(j)))
          .toList();
      setState(() {
        products = more ? [...products, ...items] : items;
        cursor = result['nextCursor'] as String?;
        loading = false;
      });
    } catch (_) {
      if (mounted && ticket == generation)
        setState(() {
          loading = false;
          error =
              'Sem conexão com o catálogo. Verifique sua internet e tente novamente.';
        });
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
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductScreen(product: p, onAdd: () => add(p)),
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
          icon: Icon(Icons.explore_outlined),
          label: 'Explorar',
        ),
        NavigationDestination(
          icon: Icon(Icons.favorite_border),
          label: 'Favoritos',
        ),
        NavigationDestination(
          icon: Icon(Icons.shopping_bag_outlined),
          label: 'Sacola',
        ),
        NavigationDestination(icon: Icon(Icons.person_outline), label: 'Conta'),
      ],
    ),
    body: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1200),
        child: switch (tab) {
          0 => catalog(),
          1 => productGrid(
            saved.values.where((p) => favorites.contains(p.id)).toList(),
            empty: 'Seus favoritos aparecem aqui.',
          ),
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
  Widget catalog() => CustomScrollView(
    slivers: [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Dê forma ao extraordinário.',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Peças para colecionar, presentear e transformar seu espaço.',
              ),
              const SizedBox(height: 20),
              TextField(
                controller: search,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => load(),
                decoration: InputDecoration(
                  labelText: 'Buscar uma peça',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    tooltip: 'Buscar',
                    onPressed: () => load(),
                    icon: const Icon(Icons.arrow_forward),
                  ),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    ChoiceChip(
                      label: const Text('Todas'),
                      selected: category == null,
                      onSelected: (_) {
                        setState(() => category = null);
                        load();
                      },
                    ),
                    for (final c in categories)
                      Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: ChoiceChip(
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
              if (error != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Column(
                    children: [
                      Text(
                        error!,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                      TextButton(
                        onPressed: () => load(),
                        child: const Text('Tentar novamente'),
                      ),
                    ],
                  ),
                ),
              if (!loading && error == null && products.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Text('Nenhuma peça encontrada nesta seleção.'),
                ),
            ],
          ),
        ),
      ),
      SliverLayoutBuilder(
        builder: (context, constraints) => SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverGrid(
            delegate: SliverChildBuilderDelegate(
              (context, index) => productCard(products[index]),
              childCount: products.length,
            ),
            gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 320,
              mainAxisExtent:
                  330.0 *
                  MediaQuery.textScalerOf(
                    context,
                  ).scale(1).clamp(1.0, 1.8).toDouble(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
            ),
          ),
        ),
      ),
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: loading
              ? const Center(child: CircularProgressIndicator())
              : cursor != null
              ? OutlinedButton(
                  onPressed: () => load(more: true),
                  child: const Text('Ver mais peças'),
                )
              : const SizedBox.shrink(),
        ),
      ),
    ],
  );
  Widget productGrid(List<Product> items, {required String empty}) =>
      items.isEmpty
      ? Center(child: Text(empty))
      : GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 320,
            mainAxisExtent:
                330.0 *
                MediaQuery.textScalerOf(
                  context,
                ).scale(1).clamp(1.0, 1.8).toDouble(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: items.length,
          itemBuilder: (_, i) => productCard(items[i]),
        );
  Widget productCard(Product p) => Card(
    clipBehavior: Clip.antiAlias,
    child: InkWell(
      onTap: () => openProduct(p),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                Positioned.fill(child: productImage(p)),
                Positioned(
                  right: 4,
                  top: 4,
                  child: IconButton.filledTonal(
                    tooltip: favorites.contains(p.id)
                        ? 'Remover dos favoritos'
                        : 'Favoritar',
                    onPressed: () => favorite(p),
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
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(
                  p.stock > 0
                      ? 'Disponível • confira condições ao comprar'
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
        if (mounted) setState(() => profile = null);
      }
    } on FirebaseAuthException catch (e) {
      if (mounted)
        setState(
          () => message =
              'Não foi possível autenticar (${e.code}). Verifique os dados ou tente novamente.',
        );
    } catch (_) {
      if (mounted)
        setState(() => message = 'Serviço indisponível. Tente novamente.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> fetchProfile() async {
    await act(() async {
      final token = await FirebaseAuth.instance.currentUser?.getIdToken();
      if (token == null) throw StateError('Login necessário');
      final data = await widget.api.get('/api/me', token: token);
      if (mounted)
        setState(() {
          profile = data;
          message = 'Conta autenticada no servidor.';
        });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.authReady)
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Login indisponível até a configuração segura do Firebase. Sua sacola local continua disponível.',
          ),
        ),
      );
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
            TextButton(
              onPressed: busy
                  ? null
                  : () => act(() => user.sendEmailVerification()),
              child: const Text('Enviar verificação por e-mail'),
            ),
          OutlinedButton(
            onPressed: busy ? null : fetchProfile,
            child: const Text('Verificar acesso à API'),
          ),
          if (profile != null) Text('Perfil: ${profile!['role'] ?? 'cliente'}'),
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
                    if (mounted)
                      setState(
                        () => message =
                            'Confira seu e-mail para recuperar a senha.',
                      );
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
            child: Text(message!),
          ),
        const SizedBox(height: 24),
        const Text(
          'As contas do site existente não são migradas automaticamente. Histórico, endereços, privacidade e exclusão da conta ainda precisam de integração antes do lançamento público.',
        ),
      ],
    );
  }
}
