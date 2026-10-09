import 'package:flutter_test/flutter_test.dart';
import 'package:mdh_mobile/store.dart';

void main() {
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
      'imageUrl': 'https://cdn.example.com/a.png',
    });
    expect(Product.fromJson(product.toJson()).priceCents, 1999);
    expect(product.modelUrl, isNull);
  });
}
