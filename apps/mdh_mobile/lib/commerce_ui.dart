import 'package:flutter/material.dart';

ThemeData commerceTheme(Brightness brightness) {
  final dark = brightness == Brightness.dark;
  final scheme = ColorScheme.fromSeed(
    seedColor: const Color(0xffa96b08),
    brightness: brightness,
    surface: dark ? const Color(0xff171c25) : Colors.white,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: dark
        ? const Color(0xff10141b)
        : const Color(0xfff3f5f8),
    appBarTheme: AppBarTheme(
      backgroundColor: scheme.surface,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      color: scheme.surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: scheme.outlineVariant),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: scheme.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(18)),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: scheme.surface,
      indicatorColor: scheme.primaryContainer,
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
    mainAxisExtent: 260 + 112 * scale,
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
  const CollectionIntro({super.key, required this.onCollections});
  final VoidCallback onCollections;

  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(24),
      gradient: const LinearGradient(
        colors: [Color(0xff142b36), Color(0xff20212c)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    padding: const EdgeInsets.all(24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.view_in_ar_outlined, color: Color(0xffefc77d)),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'CRIADO EM 3D. ESCOLHIDO POR VOCÊ.',
                style: TextStyle(
                  color: Color(0xffefc77d),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.4,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          'Pequenos objetos.\nGrandes ideias.',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Encontre uma peça para sua coleção, sua casa ou seu próximo presente.',
          style: TextStyle(color: Color(0xffd1dce2), height: 1.5),
        ),
        const SizedBox(height: 20),
        FilledButton.icon(
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xffefc77d),
            foregroundColor: const Color(0xff17212c),
            minimumSize: const Size(48, 48),
          ),
          onPressed: onCollections,
          icon: const Icon(Icons.arrow_forward_rounded),
          label: const Text('Explorar coleções'),
        ),
      ],
    ),
  );
}

class CommerceEmptyState extends StatelessWidget {
  const CommerceEmptyState({
    super.key,
    required this.message,
    this.onReset,
  });
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
