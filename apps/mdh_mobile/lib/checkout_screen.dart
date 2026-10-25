import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'checkout.dart';
import 'store.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({
    super.key,
    required this.origin,
    required this.userId,
    required this.tokenProvider,
    required this.localCart,
    required this.onOrderCreated,
    this.api,
    this.gateway,
    this.draftStore,
  }) : assert(api != null || gateway != null);

  final Uri origin;
  final String userId;
  final Future<String?> Function() tokenProvider;
  final Map<String, int> localCart;
  final VoidCallback onOrderCreated;
  final StoreApi? api;
  final CheckoutGateway? gateway;
  final CheckoutDraftStore? draftStore;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final CheckoutGateway gateway;
  late final CheckoutDraftStore drafts;
  CommerceCapabilities? capabilities;
  CheckoutCart? cart;
  List<DeliveryAddress> addresses = [];
  List<PurchaseOrder> orders = [];
  CheckoutDraft? draft;
  PixPayment? pix;
  String? selectedAddressId, error, notice;
  bool loading = true, submitting = false;
  int step = 0;

  @override
  void initState() {
    super.initState();
    gateway = widget.gateway ?? CheckoutRepository(widget.api!);
    drafts =
        widget.draftStore ??
        SharedPreferencesCheckoutDraftStore(
          origin: widget.origin,
          userId: widget.userId,
        );
    bootstrap();
  }

  Future<String> token() async {
    final value = await widget.tokenProvider();
    if (value == null || value.isEmpty) {
      throw const StoreApiException(401, code: 'authentication_required');
    }
    return value;
  }

  Future<void> bootstrap() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final auth = await token();
      final loadedCapabilities = await gateway.capabilities();
      final loadedDraft = await drafts.read();
      final results = await Future.wait<dynamic>([
        if (loadedDraft?.orderId == null)
          gateway.synchronizeCart(auth, widget.localCart),
        gateway.addresses(auth),
        gateway.orders(auth),
      ]);
      if (!mounted) return;
      final offset = loadedDraft?.orderId == null ? 1 : 0;
      final loadedAddresses = results[offset] as List<DeliveryAddress>;
      String? initialAddressId;
      if (loadedAddresses.any(
        (address) => address.id == loadedDraft?.addressId,
      )) {
        initialAddressId = loadedDraft?.addressId;
      } else if (loadedAddresses.isNotEmpty) {
        initialAddressId = loadedAddresses.first.id;
      }
      final initialStep = loadedDraft?.paymentId != null
          ? 2
          : loadedDraft?.orderId != null
          ? 1
          : 0;
      setState(() {
        capabilities = loadedCapabilities;
        cart = loadedDraft?.orderId == null ? results[0] as CheckoutCart : null;
        addresses = loadedAddresses;
        orders = results[offset + 1] as List<PurchaseOrder>;
        draft = loadedDraft;
        selectedAddressId = initialAddressId;
        step = initialStep;
        loading = false;
        if (loadedDraft?.orderId != null) {
          notice = loadedDraft?.paymentId != null
              ? 'Retomando o pagamento pendente sem recriar o pedido.'
              : 'Pedido já criado. Continue para gerar o Pix sem duplicar a compra.';
        } else if (!loadedCapabilities.canBuy) {
          notice =
              'Seu carrinho está sincronizado, mas o servidor ainda não habilitou checkout e pagamento.';
        }
      });
      if (loadedDraft?.paymentId != null) await refreshPayment();
    } on StoreApiException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } on FormatException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (_) {
      if (mounted) {
        setState(
          () => error = 'Não foi possível preparar a compra. Tente novamente.',
        );
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> addAddress() async {
    final payload = await showDialog<Map<String, String>>(
      context: context,
      builder: (_) => const _AddressDialog(),
    );
    if (payload == null) return;
    setState(() {
      submitting = true;
      error = null;
    });
    try {
      final created = await gateway.createAddress(await token(), payload);
      if (!mounted) return;
      setState(() {
        addresses = [...addresses, created];
        selectedAddressId = created.id;
        notice = 'Endereço cadastrado e selecionado.';
      });
    } on StoreApiException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (_) {
      if (mounted) {
        setState(() => error = 'Não foi possível salvar o endereço.');
      }
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  Future<void> selectAddress(String? id) async {
    if (id == null) return;
    final next = (draft ?? CheckoutDraft(idempotencyKey: newIdempotencyKey()))
        .copyWith(addressId: id);
    setState(() {
      selectedAddressId = id;
      draft = next;
    });
    try {
      await drafts.write(next);
    } catch (_) {
      if (mounted) {
        setState(
          () => error =
              'O endereço foi selecionado, mas a retomada não pôde ser salva.',
        );
      }
    }
  }

  Future<void> buy() async {
    final addressId = selectedAddressId;
    if (draft?.orderId == null &&
        (addressId == null || cart?.isValid != true)) {
      setState(() => error = 'Selecione um endereço e revise os itens.');
      return;
    }
    if (capabilities?.canBuy != true) {
      setState(
        () => error =
            'O servidor confirmou que checkout ou pagamento ainda está indisponível.',
      );
      return;
    }
    setState(() {
      submitting = true;
      error = null;
      notice = null;
    });
    try {
      final auth = await token();
      var current = draft ?? CheckoutDraft(idempotencyKey: newIdempotencyKey());
      current = current.copyWith(addressId: addressId);
      await drafts.write(current);
      if (current.orderId == null) {
        final order = await gateway.createOrder(
          auth,
          addressId: addressId!,
          idempotencyKey: current.idempotencyKey,
        );
        current = current.copyWith(orderId: order.id);
        await drafts.write(current);
      }
      final payment = await gateway.createPix(
        auth,
        orderId: current.orderId!,
        idempotencyKey: '${current.idempotencyKey}-pix',
      );
      current = current.copyWith(paymentId: payment.paymentId);
      await drafts.write(current);
      if (!mounted) return;
      setState(() {
        draft = current;
        pix = payment;
        step = 2;
        notice = payment.approved
            ? 'Pagamento confirmado.'
            : 'Pix criado. Pague e depois confirme o status.';
      });
      if (payment.approved) await complete();
    } on StoreApiException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } on FormatException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (_) {
      if (mounted) {
        setState(() => error = 'A compra não foi concluída. Tente novamente.');
      }
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  Future<void> refreshPayment() async {
    final paymentId = draft?.paymentId;
    if (paymentId == null) return;
    setState(() {
      submitting = true;
      error = null;
    });
    try {
      final payment = await gateway.payment(await token(), paymentId);
      if (!mounted) return;
      setState(() {
        pix = payment;
        step = 2;
        notice = payment.approved
            ? 'Pagamento confirmado.'
            : 'Pagamento ${payment.status}. Atualize depois de pagar.';
      });
      if (payment.approved) await complete();
    } on StoreApiException catch (exception) {
      if (mounted) setState(() => error = exception.message);
    } catch (_) {
      if (mounted) setState(() => error = 'Não foi possível consultar o Pix.');
    } finally {
      if (mounted) setState(() => submitting = false);
    }
  }

  Future<void> complete() async {
    try {
      await drafts.clear();
    } catch (_) {}
    widget.onOrderCreated();
    if (!mounted) return;
    setState(() {
      draft = null;
      step = 3;
    });
  }

  Uint8List? qrImage() {
    final value = pix?.qrCodeBase64;
    if (value == null || value.length > 2000000) return null;
    try {
      return base64Decode(value.contains(',') ? value.split(',').last : value);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Finalizar compra')),
    body: SafeArea(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 760),
          child: loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: bootstrap,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(20),
                    children: [
                      _Progress(current: step),
                      const SizedBox(height: 20),
                      if (error != null)
                        _Message(
                          icon: Icons.error_outline,
                          text: error!,
                          color: Theme.of(context).colorScheme.errorContainer,
                        ),
                      if (notice != null)
                        _Message(
                          icon: Icons.info_outline,
                          text: notice!,
                          color: Theme.of(
                            context,
                          ).colorScheme.secondaryContainer,
                        ),
                      if (step == 0) _addressStep(),
                      if (step == 1) _reviewStep(),
                      if (step == 2) _paymentStep(),
                      if (step == 3) _successStep(),
                      const SizedBox(height: 28),
                      _ordersSection(),
                    ],
                  ),
                ),
        ),
      ),
    ),
  );

  Widget _addressStep() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text('1. Entrega', style: Theme.of(context).textTheme.headlineSmall),
      const SizedBox(height: 8),
      if (addresses.isEmpty) const Text('Cadastre um endereço para continuar.'),
      RadioGroup<String>(
        groupValue: selectedAddressId,
        onChanged: submitting ? (_) {} : selectAddress,
        child: Column(
          children: [
            for (final address in addresses)
              RadioListTile<String>(
                value: address.id,
                title: Text(address.recipient),
                subtitle: Text(address.summary),
              ),
          ],
        ),
      ),
      OutlinedButton.icon(
        onPressed: submitting ? null : addAddress,
        icon: const Icon(Icons.add_location_alt_outlined),
        label: const Text('Adicionar endereço'),
      ),
      const SizedBox(height: 12),
      FilledButton(
        onPressed: selectedAddressId == null || submitting
            ? null
            : () => setState(() => step = 1),
        child: const Text('Revisar pedido'),
      ),
    ],
  );

  Widget _reviewStep() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text('2. Revisão', style: Theme.of(context).textTheme.headlineSmall),
      const SizedBox(height: 8),
      if (draft?.orderId != null)
        const ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.receipt_long_outlined),
          title: Text('Pedido já criado'),
          subtitle: Text(
            'A retomada não recria nem altera os itens reservados.',
          ),
        ),
      for (final item in cart?.items ?? const <CheckoutCartItem>[])
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(
            item.available ? Icons.check_circle_outline : Icons.error_outline,
          ),
          title: Text(item.title),
          subtitle: Text('${item.quantity} × ${money(item.priceCents)}'),
          trailing: Text(money(item.quantity * item.priceCents)),
        ),
      const Divider(),
      if (cart != null)
        Text(
          'Total confirmado: ${money(cart!.totalCents)}',
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
      const SizedBox(height: 8),
      const Text(
        'O servidor recalculou preço e disponibilidade. O pagamento será Pix.',
      ),
      const SizedBox(height: 16),
      FilledButton.icon(
        onPressed: submitting ? null : buy,
        icon: submitting
            ? const SizedBox.square(
                dimension: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.pix),
        label: Text(
          draft?.orderId == null
              ? 'Criar pedido e gerar Pix'
              : 'Retomar e gerar Pix',
        ),
      ),
      TextButton(
        onPressed: submitting ? null : () => setState(() => step = 0),
        child: const Text('Voltar ao endereço'),
      ),
    ],
  );

  Widget _paymentStep() {
    final image = qrImage();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('3. Pagamento', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        if (image != null)
          Center(
            child: Image.memory(
              image,
              width: 240,
              height: 240,
              semanticLabel: 'QR Code Pix do pedido',
            ),
          ),
        if (pix?.qrCode != null) ...[
          const Text('Pix copia e cola'),
          const SizedBox(height: 8),
          SelectableText(pix!.qrCode!, maxLines: 5),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: pix!.qrCode!));
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Código Pix copiado.')),
                );
              }
            },
            icon: const Icon(Icons.copy),
            label: const Text('Copiar código Pix'),
          ),
        ],
        if (pix?.expiresAt != null) Text('Validade: ${pix!.expiresAt}'),
        Text('Status: ${pix?.status ?? 'aguardando'}'),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: submitting ? null : refreshPayment,
          child: const Text('Já paguei — atualizar status'),
        ),
      ],
    );
  }

  Widget _successStep() => Column(
    children: [
      const Icon(Icons.verified_rounded, size: 72, color: Color(0xff3fce8a)),
      const SizedBox(height: 12),
      Text(
        'Pedido confirmado',
        style: Theme.of(context).textTheme.headlineSmall,
      ),
      const Text('Acompanhe a produção e a entrega na sua conta.'),
      const SizedBox(height: 16),
      FilledButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Voltar à loja'),
      ),
    ],
  );

  Widget _ordersSection() => ExpansionTile(
    tilePadding: EdgeInsets.zero,
    title: const Text('Pedidos recentes'),
    children: [
      if (orders.isEmpty) const ListTile(title: Text('Nenhum pedido ainda.')),
      for (final order in orders)
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text('Pedido ${order.id}'),
          subtitle: Text(orderStatusLabel(order.status)),
          trailing: Text(money(order.totalCents)),
        ),
    ],
  );
}

String orderStatusLabel(String status) => switch (status) {
  'pending' => 'Aguardando pagamento',
  'paid' => 'Pagamento confirmado',
  'preparing' => 'Em produção',
  'shipped' => 'Enviado',
  'delivered' => 'Entregue',
  'cancelled' => 'Cancelado',
  'refunded' => 'Reembolsado',
  _ => status,
};

class _Progress extends StatelessWidget {
  const _Progress({required this.current});
  final int current;
  @override
  Widget build(BuildContext context) => Row(
    children: [
      for (var index = 0; index < 4; index++) ...[
        Expanded(
          child: Semantics(
            label: 'Etapa ${index + 1} de 4',
            selected: index == current,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              height: 5,
              decoration: BoxDecoration(
                color: index <= current
                    ? Theme.of(context).colorScheme.primary
                    : Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(99),
              ),
            ),
          ),
        ),
        if (index < 3) const SizedBox(width: 6),
      ],
    ],
  );
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, required this.color});
  final IconData icon;
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    child: Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon),
          const SizedBox(width: 10),
          Expanded(child: Text(text)),
        ],
      ),
    ),
  );
}

class _AddressDialog extends StatefulWidget {
  const _AddressDialog();
  @override
  State<_AddressDialog> createState() => _AddressDialogState();
}

class _AddressDialogState extends State<_AddressDialog> {
  final form = GlobalKey<FormState>();
  final fields = <String, TextEditingController>{
    for (final name in [
      'recipient',
      'postalCode',
      'street',
      'number',
      'complement',
      'district',
      'city',
      'state',
    ])
      name: TextEditingController(),
  };

  @override
  void dispose() {
    for (final controller in fields.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Novo endereço'),
    content: SizedBox(
      width: 520,
      child: Form(
        key: form,
        child: SingleChildScrollView(
          child: Column(
            children: [
              _field('recipient', 'Nome de quem recebe'),
              _field('postalCode', 'CEP', keyboard: TextInputType.number),
              _field('street', 'Rua'),
              _field('number', 'Número'),
              _field('complement', 'Complemento', required: false),
              _field('district', 'Bairro', required: false),
              _field('city', 'Cidade'),
              _field('state', 'UF', maxLength: 2),
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
          if (form.currentState?.validate() != true) return;
          Navigator.pop(context, {
            for (final entry in fields.entries)
              entry.key: switch (entry.key) {
                'postalCode' => entry.value.text.replaceAll('-', '').trim(),
                'state' => entry.value.text.trim().toUpperCase(),
                _ => entry.value.text.trim(),
              },
          });
        },
        child: const Text('Salvar endereço'),
      ),
    ],
  );

  Widget _field(
    String name,
    String label, {
    bool required = true,
    int? maxLength,
    TextInputType? keyboard,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: TextFormField(
      controller: fields[name],
      maxLength: maxLength,
      keyboardType: keyboard,
      textCapitalization: TextCapitalization.sentences,
      decoration: InputDecoration(labelText: label),
      validator: (value) {
        final text = value?.trim() ?? '';
        if (required && text.isEmpty) return 'Campo obrigatório';
        if (name == 'postalCode' && !RegExp(r'^\d{5}-?\d{3}$').hasMatch(text)) {
          return 'Informe um CEP válido';
        }
        if (name == 'state' && !RegExp(r'^[A-Za-z]{2}$').hasMatch(text)) {
          return 'Use a sigla com 2 letras';
        }
        return null;
      },
    ),
  );
}
