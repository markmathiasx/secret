/**
 * Instrumentation.ts - Server-side initialization
 *
 * This file runs once when the server starts. Use it for:
 * - Configuration validation (startup guards)
 * - Monitoring setup (Sentry, OpenTelemetry)
 * - Database initialization
 */

// startup-guards uses process.exit — dynamic import keeps it out of Edge bundle

/**
 * Server-side initialization
 */
export async function register() {
  // Only run in Node.js environment, not in edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic import keeps process.exit out of Edge bundle
    const { runStartupGuards } = await import('@/lib/startup-guards');
    // Run startup validation — log issues but never crash (resilient mode)
    runStartupGuards({ exitOnError: false });

    console.log('✅ Server initialization complete');
  }
}

/**
 * Edge runtime initialization
 */
export async function registerEdge() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('✅ Edge initialization complete');
  }
}
