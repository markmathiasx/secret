import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mdh_mobile/store.dart';

void main() {
  test('Autenticação por requisição não vaza token entre sessões', () async {
    final seen = <String?>[];
    final api = StoreApi(
      Uri.parse('https://api.example.com'),
      client: MockClient((request) async {
        seen.add(request.headers['Authorization']);
        return http.Response('{"items":[]}', 200);
      }),
    );
    await api.get('/api/orders', token: 'account-one');
    await api.get('/api/orders', token: 'account-two');
    await api.get('/api/categories');
    expect(seen, ['Bearer account-one', 'Bearer account-two', null]);
    api.close();
  });
  test(
    'Mutação JSON respeita contrato e DELETE 204 não decodifica corpo',
    () async {
      var calls = 0;
      final api = StoreApi(
        Uri.parse('https://api.example.com'),
        client: MockClient((request) async {
          calls++;
          if (request.method == 'POST') {
            expect(request.headers['Content-Type'], 'application/json');
            expect(request.body, '{"city":"Rio"}');
            return http.Response('{"id":"a"}', 201);
          }
          expect(request.method, 'DELETE');
          return http.Response('', 204);
        }),
      );
      expect(
        await api.send(
          'POST',
          '/api/addresses',
          body: {'city': 'Rio'},
          token: 'session',
        ),
        {'id': 'a'},
      );
      expect(
        await api.send('DELETE', '/api/addresses/a', token: 'session'),
        isEmpty,
      );
      expect(calls, 2);
      api.close();
    },
  );
  test(
    'Erros de autorização, corpo inválido e falhas não viram lista vazia',
    () async {
      for (final status in [401, 403, 404, 500, 503]) {
        final api = StoreApi(
          Uri.parse('https://api.example.com'),
          client: MockClient(
            (_) async => http.Response('internal provider secret', status),
          ),
        );
        await expectLater(
          api.get('/api/orders'),
          throwsA(
            isA<StoreApiException>().having(
              (e) => e.statusCode,
              'status',
              status,
            ),
          ),
        );
        api.close();
      }
      for (final body in ['[]', 'not-json']) {
        final api = StoreApi(
          Uri.parse('https://api.example.com'),
          client: MockClient((_) async => http.Response(body, 200)),
        );
        await expectLater(api.get('/api/orders'), throwsFormatException);
        api.close();
      }
    },
  );

  test('Origem de API não aceita credenciais, caminhos ou HTTP público', () {
    expect(apiOrigin(''), isNull);
    expect(apiOrigin('https://user:secret@api.example.com'), isNull);
    expect(apiOrigin('https://api.example.com/api'), isNull);
    expect(apiOrigin('https://api.example.com?key=a'), isNull);
    expect(apiOrigin('http://api.example.com', debug: false), isNull);
    expect(apiOrigin('https://api.example.com')?.host, 'api.example.com');
    expect(apiOrigin('http://10.0.2.2:4000', debug: true)?.port, 4000);
    expect(apiOrigin('http://10.0.2.2:4000', debug: false), isNull);
  });
  test('Não promove URLs locais ou scripts a mídia pública', () {
    expect(safeMedia('javascript:alert(1)'), isNull);
    expect(safeMedia('http://localhost/a.png'), isNull);
    expect(safeMedia('https://cdn.example.com/a.glb'), isNotNull);
  });
  test('Valores inválidos não são truncados ou promovidos a dinheiro', () {
    for (final invalid in [-1, 1.5, 1.0, '10', null, 2147483648]) {
      expect(
        () => boundedInteger(invalid, 'priceCents'),
        throwsFormatException,
      );
      expect(() => boundedInteger(invalid, 'stock'), throwsFormatException);
    }
    expect(boundedInteger(0, 'stock'), 0);
    expect(boundedInteger(2147483647, 'priceCents'), 2147483647);
  });
  test('Valores e produto preservam dados do servidor', () {
    expect(money(1999), 'R\$ 19,99');
    final product = Product.fromJson({
      'id': 'p',
      'title': 'Peça',
      'description': 'Real',
      'priceCents': 1999,
      'stock': 2,
      'availabilityMode': 'in_stock',
      'imageUrl': 'https://cdn.example.com/a.png',
    });
    expect(Product.fromJson(product.toJson()).priceCents, 1999);
    expect(product.isPurchasable, isTrue);
    expect(product.modelUrl, isNull);
  });
  test('Produto sob encomenda é comprável sem inventar estoque', () {
    final product = Product.fromJson({
      'id': 'custom',
      'title': 'Peça sob encomenda',
      'description': 'Produção real',
      'priceCents': 3990,
      'stock': 0,
      'availabilityMode': 'made_to_order',
      'productionWindow': '3 a 7 dias úteis',
    });
    expect(product.isPurchasable, isTrue);
    expect(product.isMadeToOrder, isTrue);
    expect(product.availabilityLabel, 'Produzido para você');
    expect(product.stock, 0);
    expect(
      () => Product.fromJson({...product.toJson(), 'availabilityMode': 'fake'}),
      throwsFormatException,
    );
  });
  test('Cache legado recupera disponibilidade sem perder o produto', () {
    final product = Product.fromJson({
      'id': 'legacy',
      'title': 'Peça antiga',
      'description': 'Salva antes da atualização',
      'priceCents': 2500,
      'stock': 2,
    });
    expect(product.availabilityMode, 'in_stock');
    expect(product.isPurchasable, isTrue);
  });
}
