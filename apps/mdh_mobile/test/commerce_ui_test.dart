import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mdh_mobile/commerce_ui.dart';
import 'package:mdh_mobile/main.dart';
import 'package:mdh_mobile/store.dart';

void main() {
  testWidgets('Fallback compacto de mídia não quebra cards estreitos', (
    tester,
  ) async {
    final product = Product(
      id: 'product-1',
      title: 'Produto sem foto',
      description: '',
      priceCents: 1000,
      stock: 1,
      availabilityMode: 'in_stock',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: SizedBox(
          width: 58,
          height: 58,
          child: productImage(product, compactFallback: true),
        ),
      ),
    );
    expect(find.byIcon(Icons.image_not_supported_outlined), findsOneWidget);
    expect(find.text('Foto original indisponível'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Categoria executa a seleção e expõe estado acessível', (
    tester,
  ) async {
    var selections = 0;
    await tester.pumpWidget(
      MaterialApp(
        theme: commerceTheme(Brightness.light),
        home: Scaffold(
          body: CollectionTile(
            name: 'Casa e Organização',
            selected: true,
            onTap: () => selections++,
          ),
        ),
      ),
    );
    await tester.tap(find.text('Casa e Organização'));
    expect(selections, 1);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Grid deixa espaço para leitura em telefone e texto ampliado', (
    tester,
  ) async {
    late SliverGridDelegateWithFixedCrossAxisCount grid;
    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: Builder(
            builder: (context) {
              grid =
                  commerceGrid(context, 360)
                      as SliverGridDelegateWithFixedCrossAxisCount;
              return const SizedBox();
            },
          ),
        ),
      ),
    );
    expect(grid.crossAxisCount, 1);
    expect(grid.mainAxisExtent, greaterThan(400));
  });

  testWidgets('Grid tem duas colunas quando há largura suficiente', (
    tester,
  ) async {
    late SliverGridDelegateWithFixedCrossAxisCount grid;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            grid =
                commerceGrid(context, 420)
                    as SliverGridDelegateWithFixedCrossAxisCount;
            return const SizedBox();
          },
        ),
      ),
    );
    expect(grid.crossAxisCount, 2);
  });

  testWidgets('Abertura cabe em tela pequena com texto ampliado', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    var opened = false;
    await tester.pumpWidget(
      MaterialApp(
        theme: commerceTheme(Brightness.dark),
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: Scaffold(
            body: SingleChildScrollView(
              child: CollectionIntro(onCollections: () => opened = true),
            ),
          ),
        ),
      ),
    );
    await tester.ensureVisible(find.text('Explorar coleções'));
    await tester.tap(find.text('Explorar coleções'));
    expect(opened, isTrue);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Seleção vazia permite voltar ao catálogo completo', (
    tester,
  ) async {
    var cleared = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: CommerceEmptyState(
            message: 'Nenhuma peça nesta seleção.',
            onReset: () => cleared = true,
          ),
        ),
      ),
    );
    await tester.tap(find.text('Ver todas as peças'));
    expect(cleared, isTrue);
  });
}
