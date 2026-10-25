import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mdh_mobile/checkout.dart';
import 'package:mdh_mobile/checkout_screen.dart';
import 'package:mdh_mobile/store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test(
    'Sincronização remove sobra remota, envia quantidade e relê total',
    () async {
      final requests = <http.Request>[];
      var cartReads = 0;
      final api = StoreApi(
        Uri.parse('https://api.example.com'),
        client: MockClient((request) async {
          requests.add(request);
          if (request.method == 'GET' && request.url.path == '/api/cart') {
            cartReads++;
            return http.Response(
              jsonEncode({
                'items': cartReads == 1
                    ? [cartItem('remote', 1)]
                    : [cartItem('local', 2)],
                'totalCents': cartReads == 1 ? 1000 : 2000,
              }),
              200,
            );
          }
          return http.Response('', 204);
        }),
      );
      final cart = await CheckoutRepository(
        api,
      ).synchronizeCart('token', {'local': 2});
      expect(cart.totalCents, 2000);
      expect(requests.map((request) => request.method), [
        'GET',
        'DELETE',
        'PUT',
        'GET',
      ]);
      expect(requests[2].body, '{"quantity":2}');
      expect(
        requests.every(
          (request) => request.headers['Authorization'] == 'Bearer token',
        ),
        isTrue,
      );
      api.close();
    },
  );

  test('Pedido e Pix carregam chaves idempotentes no cabeçalho', () async {
    final requests = <http.Request>[];
    final api = StoreApi(
      Uri.parse('https://api.example.com'),
      client: MockClient((request) async {
        requests.add(request);
        if (request.url.path == '/api/orders') {
          return http.Response(
            '{"id":"order-1","status":"pending","totalCents":2590}',
            201,
          );
        }
        return http.Response(
          '{"id":"123","status":"pending","qrCode":"pix-code"}',
          201,
        );
      }),
    );
    final repository = CheckoutRepository(api);
    final order = await repository.createOrder(
      'token',
      addressId: 'address-1',
      idempotencyKey: 'checkout-key-1234',
    );
    final pix = await repository.createPix(
      'token',
      orderId: order.id,
      idempotencyKey: 'checkout-key-1234-pix',
    );
    expect(order.totalCents, 2590);
    expect(pix.qrCode, 'pix-code');
    expect(requests[0].headers['Idempotency-Key'], 'checkout-key-1234');
    expect(requests[1].headers['Idempotency-Key'], 'checkout-key-1234-pix');
    expect(jsonDecode(requests[0].body), {'addressId': 'address-1'});
    api.close();
  });

  test('Retomada persiste somente identificadores não secretos', () async {
    SharedPreferences.setMockInitialValues({});
    final store = SharedPreferencesCheckoutDraftStore(
      origin: Uri.parse('https://api.example.com'),
      userId: 'user-1',
    );
    const draft = CheckoutDraft(
      idempotencyKey: 'key',
      addressId: 'address',
      orderId: 'order',
      paymentId: 'payment',
    );
    await store.write(draft);
    final preferences = await SharedPreferences.getInstance();
    final raw = preferences.getString(
      'mdh:checkout:api.example.com:443:user-1',
    );
    expect(raw, contains('order'));
    expect(raw, isNot(contains('qrCode')));
    expect(raw, isNot(contains('token')));
    expect((await store.read())?.paymentId, 'payment');
    await store.clear();
    expect(await store.read(), isNull);
  });

  testWidgets(
    'Checkout informa bloqueio declarado pela API sem fingir compra',
    (tester) async {
      final gateway = FakeGateway(enabled: false);
      await tester.pumpWidget(
        MaterialApp(
          home: CheckoutScreen(
            origin: Uri.parse('https://api.example.com'),
            userId: 'user',
            gateway: gateway,
            draftStore: MemoryDraftStore(),
            tokenProvider: () async => 'token',
            localCart: const {'product': 1},
            onOrderCreated: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(
        find.textContaining('servidor ainda não habilitou'),
        findsOneWidget,
      );
      await tester.tap(find.text('Revisar pedido'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Criar pedido e gerar Pix'));
      await tester.pumpAndSettle();
      expect(find.textContaining('servidor confirmou'), findsOneWidget);
      expect(gateway.orderCalls, 0);
    },
  );

  testWidgets('Compra aprovada conclui e limpa o fluxo retomável', (
    tester,
  ) async {
    final gateway = FakeGateway(enabled: true);
    final store = MemoryDraftStore();
    var completed = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: CheckoutScreen(
          origin: Uri.parse('https://api.example.com'),
          userId: 'user',
          gateway: gateway,
          draftStore: store,
          tokenProvider: () async => 'token',
          localCart: const {'product': 1},
          onOrderCreated: () => completed++,
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Revisar pedido'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Criar pedido e gerar Pix'));
    await tester.pumpAndSettle();
    expect(find.text('Pedido confirmado'), findsOneWidget);
    expect(completed, 1);
    expect(store.value, isNull);
    expect(gateway.orderCalls, 1);
    expect(gateway.pixCalls, 1);
  });

  testWidgets('Retomada de pedido não repovoa o carrinho do servidor', (
    tester,
  ) async {
    final gateway = FakeGateway(enabled: true);
    final store = MemoryDraftStore()
      ..value = const CheckoutDraft(
        idempotencyKey: 'resume-checkout-key',
        addressId: 'address',
        orderId: 'order',
      );
    await tester.pumpWidget(
      MaterialApp(
        home: CheckoutScreen(
          origin: Uri.parse('https://api.example.com'),
          userId: 'user',
          gateway: gateway,
          draftStore: store,
          tokenProvider: () async => 'token',
          localCart: const {'product': 1},
          onOrderCreated: () {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(gateway.syncCalls, 0);
    expect(find.text('Retomar e gerar Pix'), findsOneWidget);
  });
}

Map<String, dynamic> cartItem(String id, int quantity) => {
  'productId': id,
  'title': 'Peça $id',
  'quantity': quantity,
  'priceCents': 1000,
  'available': true,
  'imageUrl': null,
};

class MemoryDraftStore implements CheckoutDraftStore {
  CheckoutDraft? value;
  @override
  Future<void> clear() async {
    value = null;
  }

  @override
  Future<CheckoutDraft?> read() async => value;
  @override
  Future<void> write(CheckoutDraft draft) async {
    value = draft;
  }
}

class FakeGateway implements CheckoutGateway {
  FakeGateway({required this.enabled});
  final bool enabled;
  int orderCalls = 0, pixCalls = 0, syncCalls = 0;

  @override
  Future<List<DeliveryAddress>> addresses(String token) async => const [
    DeliveryAddress(
      id: 'address',
      recipient: 'Cliente',
      postalCode: '01001-000',
      street: 'Rua Real',
      number: '1',
      complement: '',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    ),
  ];

  @override
  Future<CommerceCapabilities> capabilities() async => CommerceCapabilities(
    cart: true,
    addresses: true,
    orders: true,
    checkout: enabled,
    payments: enabled,
  );

  @override
  Future<DeliveryAddress> createAddress(
    String token,
    Map<String, String> address,
  ) async => throw UnimplementedError();

  @override
  Future<PurchaseOrder> createOrder(
    String token, {
    required String addressId,
    required String idempotencyKey,
  }) async {
    orderCalls++;
    return const PurchaseOrder(
      id: 'order',
      status: 'pending',
      totalCents: 1000,
    );
  }

  @override
  Future<PixPayment> createPix(
    String token, {
    required String orderId,
    required String idempotencyKey,
  }) async {
    pixCalls++;
    return const PixPayment(paymentId: 'payment', status: 'approved');
  }

  @override
  Future<List<PurchaseOrder>> orders(String token) async => const [];

  @override
  Future<PixPayment> payment(String token, String paymentId) async =>
      const PixPayment(paymentId: 'payment', status: 'approved');

  @override
  Future<CheckoutCart> synchronizeCart(
    String token,
    Map<String, int> localCart,
  ) async {
    syncCalls++;
    return CheckoutCart(
      items: [
        CheckoutCartItem(
          productId: 'product',
          title: 'Peça real',
          quantity: localCart['product'] ?? 1,
          priceCents: 1000,
          available: true,
        ),
      ],
      totalCents: 1000,
    );
  }
}
