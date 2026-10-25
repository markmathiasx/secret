import 'dart:convert';
import 'dart:math';

import 'package:shared_preferences/shared_preferences.dart';

import 'store.dart';

String _text(dynamic value, String field) {
  if (value is! String || value.trim().isEmpty) {
    throw FormatException('$field inválido.');
  }
  return value.trim();
}

bool _flag(dynamic value, String field) {
  if (value is! bool) throw FormatException('$field inválido.');
  return value;
}

int _moneyCents(dynamic value, String field) {
  if (value is! int || value < 0 || value > 9007199254740991) {
    throw FormatException('$field inválido.');
  }
  return value;
}

List<Map<String, dynamic>> _rows(dynamic value, String field) {
  if (value is! List) throw FormatException('$field inválido.');
  return value.map((item) {
    if (item is! Map) throw FormatException('$field inválido.');
    return Map<String, dynamic>.from(item);
  }).toList();
}

class CommerceCapabilities {
  const CommerceCapabilities({
    required this.cart,
    required this.addresses,
    required this.orders,
    required this.checkout,
    required this.payments,
  });

  final bool cart, addresses, orders, checkout, payments;

  factory CommerceCapabilities.fromJson(Map<String, dynamic> json) =>
      CommerceCapabilities(
        cart: _flag(json['cart'], 'cart'),
        addresses: _flag(json['addresses'], 'addresses'),
        orders: _flag(json['orders'], 'orders'),
        checkout: _flag(json['checkout'], 'checkout'),
        payments: _flag(json['payments'], 'payments'),
      );

  bool get canBuy => cart && addresses && orders && checkout && payments;
}

class CheckoutCartItem {
  const CheckoutCartItem({
    required this.productId,
    required this.title,
    required this.quantity,
    required this.priceCents,
    required this.available,
    this.imageUrl,
  });

  final String productId, title;
  final int quantity, priceCents;
  final bool available;
  final String? imageUrl;

  factory CheckoutCartItem.fromJson(Map<String, dynamic> json) =>
      CheckoutCartItem(
        productId: _text(json['productId'], 'productId'),
        title: _text(json['title'], 'title'),
        quantity: boundedInteger(json['quantity'], 'quantity'),
        priceCents: boundedInteger(json['priceCents'], 'priceCents'),
        available: _flag(json['available'], 'available'),
        imageUrl: safeMedia(json['imageUrl']),
      );
}

class CheckoutCart {
  const CheckoutCart({required this.items, required this.totalCents});
  final List<CheckoutCartItem> items;
  final int totalCents;

  factory CheckoutCart.fromJson(Map<String, dynamic> json) => CheckoutCart(
    items: _rows(
      json['items'],
      'items',
    ).map(CheckoutCartItem.fromJson).toList(growable: false),
    totalCents: _moneyCents(json['totalCents'], 'totalCents'),
  );

  bool get isValid => items.isNotEmpty && items.every((item) => item.available);
}

class DeliveryAddress {
  const DeliveryAddress({
    required this.id,
    required this.recipient,
    required this.postalCode,
    required this.street,
    required this.number,
    required this.complement,
    required this.district,
    required this.city,
    required this.state,
  });

  final String id,
      recipient,
      postalCode,
      street,
      number,
      complement,
      district,
      city,
      state;

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) =>
      DeliveryAddress(
        id: _text(json['id'], 'id'),
        recipient: _text(json['recipient'], 'recipient'),
        postalCode: _text(json['postalCode'], 'postalCode'),
        street: _text(json['street'], 'street'),
        number: _text(json['number'], 'number'),
        complement: json['complement'] is String
            ? (json['complement'] as String).trim()
            : '',
        district: json['district'] is String
            ? (json['district'] as String).trim()
            : '',
        city: _text(json['city'], 'city'),
        state: _text(json['state'], 'state'),
      );

  String get summary => '$street, $number · $city/$state · CEP $postalCode';
}

class PurchaseOrder {
  const PurchaseOrder({
    required this.id,
    required this.status,
    required this.totalCents,
    this.createdAt,
  });

  final String id, status;
  final int totalCents;
  final String? createdAt;

  factory PurchaseOrder.fromJson(Map<String, dynamic> json) => PurchaseOrder(
    id: _text(json['id'], 'id'),
    status: _text(json['status'], 'status'),
    totalCents: _moneyCents(json['totalCents'], 'totalCents'),
    createdAt: json['createdAt'] is String ? json['createdAt'] as String : null,
  );
}

class PixPayment {
  const PixPayment({
    required this.paymentId,
    required this.status,
    this.qrCode,
    this.qrCodeBase64,
    this.expiresAt,
  });

  final String paymentId, status;
  final String? qrCode, qrCodeBase64, expiresAt;

  factory PixPayment.fromJson(Map<String, dynamic> json) => PixPayment(
    paymentId: _text(json['paymentId'] ?? json['id'], 'paymentId'),
    status: _text(json['status'], 'status'),
    qrCode: optionalText(json['qrCode']),
    qrCodeBase64: optionalText(json['qrCodeBase64']),
    expiresAt: optionalText(json['expiresAt']),
  );

  bool get approved => status == 'approved' || status == 'paid';
}

abstract class CheckoutGateway {
  Future<CommerceCapabilities> capabilities();
  Future<CheckoutCart> synchronizeCart(
    String token,
    Map<String, int> localCart,
  );
  Future<List<DeliveryAddress>> addresses(String token);
  Future<DeliveryAddress> createAddress(
    String token,
    Map<String, String> address,
  );
  Future<PurchaseOrder> createOrder(
    String token, {
    required String addressId,
    required String idempotencyKey,
  });
  Future<PixPayment> createPix(
    String token, {
    required String orderId,
    required String idempotencyKey,
  });
  Future<PixPayment> payment(String token, String paymentId);
  Future<List<PurchaseOrder>> orders(String token);
}

class CheckoutRepository implements CheckoutGateway {
  CheckoutRepository(this.api);
  final StoreApi api;

  @override
  Future<CommerceCapabilities> capabilities() async =>
      CommerceCapabilities.fromJson(await api.get('/api/capabilities'));

  @override
  Future<CheckoutCart> synchronizeCart(
    String token,
    Map<String, int> localCart,
  ) async {
    final current = CheckoutCart.fromJson(
      await api.get('/api/cart', token: token),
    );
    for (final item in current.items) {
      if (!localCart.containsKey(item.productId)) {
        await api.send(
          'DELETE',
          '/api/cart/items/${Uri.encodeComponent(item.productId)}',
          token: token,
        );
      }
    }
    for (final entry in localCart.entries) {
      if (entry.value < 1 || entry.value > 99) {
        throw const FormatException('Quantidade inválida na sacola.');
      }
      await api.send(
        'PUT',
        '/api/cart/items/${Uri.encodeComponent(entry.key)}',
        token: token,
        body: {'quantity': entry.value},
      );
    }
    return CheckoutCart.fromJson(await api.get('/api/cart', token: token));
  }

  @override
  Future<List<DeliveryAddress>> addresses(String token) async => _rows(
    (await api.get('/api/addresses', token: token))['items'],
    'items',
  ).map(DeliveryAddress.fromJson).toList(growable: false);

  @override
  Future<DeliveryAddress> createAddress(
    String token,
    Map<String, String> address,
  ) async => DeliveryAddress.fromJson(
    await api.send('POST', '/api/addresses', token: token, body: address),
  );

  Map<String, dynamic> _payload(Map<String, dynamic> json, String key) {
    final nested = json[key];
    return nested is Map
        ? Map<String, dynamic>.from(nested)
        : Map<String, dynamic>.from(json);
  }

  @override
  Future<PurchaseOrder> createOrder(
    String token, {
    required String addressId,
    required String idempotencyKey,
  }) async => PurchaseOrder.fromJson(
    _payload(
      await api.send(
        'POST',
        '/api/orders',
        token: token,
        idempotencyKey: idempotencyKey,
        body: {'addressId': addressId},
      ),
      'order',
    ),
  );

  @override
  Future<PixPayment> createPix(
    String token, {
    required String orderId,
    required String idempotencyKey,
  }) async => PixPayment.fromJson(
    _payload(
      await api.send(
        'POST',
        '/api/payments/pix',
        token: token,
        idempotencyKey: idempotencyKey,
        body: {'orderId': orderId},
      ),
      'payment',
    ),
  );

  @override
  Future<PixPayment> payment(String token, String paymentId) async =>
      PixPayment.fromJson(
        _payload(
          await api.get(
            '/api/payments/${Uri.encodeComponent(paymentId)}',
            token: token,
          ),
          'payment',
        ),
      );

  @override
  Future<List<PurchaseOrder>> orders(String token) async => _rows(
    (await api.get('/api/orders', token: token))['items'],
    'items',
  ).map(PurchaseOrder.fromJson).toList(growable: false);
}

class CheckoutDraft {
  const CheckoutDraft({
    required this.idempotencyKey,
    this.addressId,
    this.orderId,
    this.paymentId,
  });

  final String idempotencyKey;
  final String? addressId, orderId, paymentId;

  CheckoutDraft copyWith({
    String? addressId,
    String? orderId,
    String? paymentId,
  }) => CheckoutDraft(
    idempotencyKey: idempotencyKey,
    addressId: addressId ?? this.addressId,
    orderId: orderId ?? this.orderId,
    paymentId: paymentId ?? this.paymentId,
  );

  Map<String, dynamic> toJson() => {
    'idempotencyKey': idempotencyKey,
    'addressId': addressId,
    'orderId': orderId,
    'paymentId': paymentId,
  };

  factory CheckoutDraft.fromJson(Map<String, dynamic> json) => CheckoutDraft(
    idempotencyKey: _text(json['idempotencyKey'], 'idempotencyKey'),
    addressId: optionalText(json['addressId']),
    orderId: optionalText(json['orderId']),
    paymentId: optionalText(json['paymentId']),
  );
}

abstract class CheckoutDraftStore {
  Future<CheckoutDraft?> read();
  Future<void> write(CheckoutDraft draft);
  Future<void> clear();
}

class SharedPreferencesCheckoutDraftStore implements CheckoutDraftStore {
  SharedPreferencesCheckoutDraftStore({
    required this.origin,
    required this.userId,
  });

  final Uri origin;
  final String userId;
  String get _key => 'mdh:checkout:${origin.host}:${origin.port}:$userId';

  @override
  Future<CheckoutDraft?> read() async {
    final raw = (await SharedPreferences.getInstance()).getString(_key);
    if (raw == null) return null;
    try {
      return CheckoutDraft.fromJson(
        Map<String, dynamic>.from(jsonDecode(raw) as Map),
      );
    } catch (_) {
      await clear();
      return null;
    }
  }

  @override
  Future<void> write(CheckoutDraft draft) async {
    final ok = await (await SharedPreferences.getInstance()).setString(
      _key,
      jsonEncode(draft.toJson()),
    );
    if (!ok) throw StateError('Não foi possível persistir o checkout.');
  }

  @override
  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_key);
  }
}

String newIdempotencyKey([Random? source]) {
  final random = source ?? Random.secure();
  final bytes = List<int>.generate(24, (_) => random.nextInt(256));
  return base64UrlEncode(bytes).replaceAll('=', '');
}
