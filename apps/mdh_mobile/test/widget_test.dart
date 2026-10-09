import 'package:flutter_test/flutter_test.dart';
import 'package:mdh_mobile/main.dart';

void main() {
  testWidgets('Ausência de origem não inicia loja ou checkout fictício', (
    tester,
  ) async {
    await tester.pumpWidget(const MdhApp(authReady: false));
    expect(find.text('MDH 3D'), findsOneWidget);
    expect(find.textContaining('aguardando configuração'), findsOneWidget);
    expect(find.text('Pagamento ainda não habilitado'), findsNothing);
  });
}
