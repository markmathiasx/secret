import 'package:flutter/material.dart';

ThemeData commerceTheme(Brightness brightness) {
  final dark = brightness == Brightness.dark;
  final scheme = ColorScheme.fromSeed(
    seedColor: const Color(0xffff7a18),
    brightness: brightness,
    surface: dark ? const Color(0xff11151d) : const Color(0xfffbfcfe),
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: dark
        ? const Color(0xff07090d)
        : const Color(0xfff4f6f9),
    fontFamily: 'Roboto',
    visualDensity: VisualDensity.standard,
    splashFactory: InkSparkle.splashFactory,
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: PredictiveBackPageTransitionsBuilder(),
        TargetPlatform.iOS: ZoomPageTransitionsBuilder(),
      },
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: scheme.surface,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleTextStyle: TextStyle(
        color: scheme.onSurface,
        fontSize: 20,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.5,
      ),
    ),
    cardTheme: CardThemeData(
      color: scheme.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: scheme.outlineVariant.withValues(alpha: .55)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(
          color: scheme.outlineVariant.withValues(alpha: .55),
        ),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: dark ? const Color(0xff0d1118) : scheme.surface,
      indicatorColor: const Color(0xffff7a18).withValues(alpha: .18),
      height: 72,
    ),
    chipTheme: ChipThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      side: BorderSide(color: scheme.outlineVariant.withValues(alpha: .55)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: const Color(0xffff7a18),
        foregroundColor: const Color(0xff11151d),
        minimumSize: const Size(48, 54),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        textStyle: const TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(48, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );
}

/// Sizing uses the actual viewport and text scale, rather than squeezing
/// two cards onto every phone. It also serves the saved-products screen.
SliverGridDelegate commerceGrid(BuildContext context, double width) {
  final scale = MediaQuery.textScalerOf(context).scale(16) / 16;
  final minimumWidth = scale > 1.3 ? 260.0 : 190.0;
  final columns = (width / minimumWidth).floor().clamp(1, 4).toInt();
  return SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: columns,
    mainAxisExtent: 270 + 126 * scale,
    mainAxisSpacing: 16,
    crossAxisSpacing: 16,
  );
}

IconData categoryIcon(String name) {
  final normalized = name.toLowerCase();
  if (normalized.contains('chibi') || normalized.contains('miniatura')) {
    return Icons.auto_awesome_outlined;
  }
  if (normalized.contains('game') || normalized.contains('geek')) {
    return Icons.sports_esports_outlined;
  }
  if (normalized.contains('chaveiro')) return Icons.key_outlined;
  if (normalized.contains('casa') || normalized.contains('organiza')) {
    return Icons.chair_outlined;
  }
  if (normalized.contains('personal')) return Icons.design_services_outlined;
  return Icons.view_in_ar_outlined;
}

class CollectionTile extends StatelessWidget {
  const CollectionTile({
    super.key,
    required this.name,
    required this.onTap,
    this.selected = false,
  });
  final String name;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      selected: selected,
      child: Card(
        color: selected ? colors.primaryContainer : colors.surface,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: colors.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Icon(categoryIcon(name), color: colors.onSurface),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_rounded, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CollectionIntro extends StatelessWidget {
  const CollectionIntro({
    super.key,
    required this.onCollections,
    this.catalogCount,
  });
  final VoidCallback onCollections;
  final int? catalogCount;

  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(30),
      gradient: const LinearGradient(
        colors: [Color(0xff071b2a), Color(0xff11131c), Color(0xff251109)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      border: Border.all(color: const Color(0x33ffffff)),
      boxShadow: const [
        BoxShadow(
          color: Color(0x55000000),
          blurRadius: 32,
          offset: Offset(0, 18),
        ),
      ],
    ),
    padding: const EdgeInsets.all(26),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const DecoratedBox(
              decoration: BoxDecoration(
                color: Color(0x22ffffff),
                shape: BoxShape.circle,
              ),
              child: Padding(
                padding: EdgeInsets.all(10),
                child: Icon(
                  Icons.auto_awesome_rounded,
                  color: Color(0xffffa55f),
                  size: 18,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'MANUFATURA CRIATIVA • MDH 3D',
                style: TextStyle(
                  color: Color(0xffffb578),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.25,
                ),
              ),
            ),
            if (catalogCount != null)
              Text(
                '$catalogCount carregadas',
                style: const TextStyle(color: Color(0xffb9c6d1), fontSize: 12),
              ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Seu universo,\nimpresso em 3D.',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            height: 1.02,
            letterSpacing: -1.2,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Peças autênticas, personalização clara e produção sob encomenda sem promessas inventadas.',
          style: TextStyle(color: Color(0xffd1dce2), height: 1.5),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xffff7a18),
                  foregroundColor: const Color(0xff11151d),
                ),
                onPressed: onCollections,
                icon: const Icon(Icons.arrow_forward_rounded),
                label: const Text('Explorar coleções'),
              ),
            ),
            const SizedBox(width: 12),
            const Tooltip(
              message: 'Catálogo com dados do produto',
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Color(0x18ffffff),
                  shape: BoxShape.circle,
                ),
                child: Padding(
                  padding: EdgeInsets.all(14),
                  child: Icon(
                    Icons.verified_outlined,
                    color: Color(0xff9ed8ff),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

class CommerceEmptyState extends StatelessWidget {
  const CommerceEmptyState({super.key, required this.message, this.onReset});
  final String message;
  final VoidCallback? onReset;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(24),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.search_off_rounded,
          size: 48,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center),
        if (onReset != null) ...[
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: onReset,
            child: const Text('Ver todas as peças'),
          ),
        ],
      ],
    ),
  );
}
