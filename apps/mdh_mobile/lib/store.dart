import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

String money(int cents) =>
    'R\$ ${(cents / 100).toStringAsFixed(2).replaceAll('.', ',')}';
Uri? apiOrigin(String value, {bool debug = kDebugMode}) {
  final uri = Uri.tryParse(value);
  if (uri == null ||
      !uri.hasAuthority ||
      uri.userInfo.isNotEmpty ||
      uri.hasQuery ||
      uri.hasFragment ||
      (uri.path.isNotEmpty && uri.path != '/'))
    return null;
  if (uri.scheme == 'https') return uri.replace(path: '');
  if (debug &&
      uri.scheme == 'http' &&
      ['localhost', '127.0.0.1', '10.0.2.2'].contains(uri.host))
    return uri.replace(path: '');
  return null;
}

int boundedInteger(dynamic value, String field) {
  if (value is! int || value < 0 || value > 2147483647) {
    throw FormatException('$field deve ser inteiro não negativo de 32 bits.');
  }
  return value;
}

class Product {
  Product({
    required this.id,
    required this.title,
    required this.description,
    required this.priceCents,
    required this.stock,
    this.imageUrl,
    this.modelUrl,
  });
  final String id, title, description;
  final int priceCents, stock;
  final String? imageUrl, modelUrl;
  factory Product.fromJson(Map<String, dynamic> j) => Product(
    id: j['id'] as String,
    title: j['title'] as String,
    description: j['description'] as String? ?? '',
    priceCents: boundedInteger(j['priceCents'], 'priceCents'),
    stock: boundedInteger(j['stock'], 'stock'),
    imageUrl: safeMedia(j['imageUrl']),
    modelUrl: safeMedia(j['modelUrl']),
  );
  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'priceCents': priceCents,
    'stock': stock,
    'imageUrl': imageUrl,
    'modelUrl': modelUrl,
  };
}

String? safeMedia(dynamic value) {
  if (value is! String) return null;
  final uri = Uri.tryParse(value);
  return uri != null &&
          uri.scheme == 'https' &&
          uri.host.isNotEmpty &&
          uri.userInfo.isEmpty
      ? value
      : null;
}

class StoreApi {
  StoreApi(this.origin, {http.Client? client})
    : client = client ?? http.Client();
  final Uri origin;
  final http.Client client;
  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? query,
    String? token,
  }) async {
    final response = await client
        .get(
          origin.replace(path: path, queryParameters: query),
          headers: {if (token != null) 'Authorization': 'Bearer $token'},
        )
        .timeout(const Duration(seconds: 15));
    if (response.statusCode < 200 || response.statusCode >= 300)
      throw StateError(
        'Não foi possível carregar os dados (${response.statusCode}).',
      );
    final body = jsonDecode(response.body);
    if (body is! Map<String, dynamic>)
      throw const FormatException('Resposta inválida.');
    return body;
  }

  void close() => client.close();
}
