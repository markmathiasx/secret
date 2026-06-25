export function getTraceContext(request?: Request) {
  return {
    requestId: request?.headers.get("x-request-id") || crypto.randomUUID(),
    traceId: request?.headers.get("x-trace-id") || crypto.randomUUID(),
  };
}
