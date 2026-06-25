# AI Chat Report

Implemented files:

- `src/lib/ai-chat/*`
- `src/components/ai-chat/*`
- `app/api/ai-chat/message/route.ts`
- `app/api/ai-chat/session/route.ts`
- `app/api/ai-chat/escalate-whatsapp/route.ts`

Behavior:

- Public chat works in `fallback_instant` without Ollama or local PC.
- It uses catalog/RAG context.
- It does not collect CPF, card data, passwords or admin commands.
- Low confidence or unsafe input escalates to WhatsApp.

Validate:

- `npm run ai:health`
- `npm run ai:evaluate`
