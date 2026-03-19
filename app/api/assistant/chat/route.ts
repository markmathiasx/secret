import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  buildCommerceFallbackReply,
  commerceAssistantTools,
  createCommerceAssistantInstructions,
  executeCommerceTool,
  type AssistantChatMessage,
} from "@/lib/commerce-assistant";
import { whatsappNumber } from "@/lib/constants";
import {
  getAiAssistantModel,
  getAiAssistantProvider,
  getGroqApiKey,
  getOllamaBaseUrl,
  getOpenAiApiKey,
  isAiAssistantConfigured,
} from "@/lib/env";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { checkRateLimit, getClientIp } from "@/lib/security";

export const runtime = "nodejs";

type AssistantChatPayload = {
  messages?: AssistantChatMessage[];
  previousResponseId?: string | null;
};

type ProviderConfig = {
  provider: "openai" | "groq" | "ollama";
  model: string;
  apiKey: string;
  baseURL?: string;
  supportsStatefulResponses: boolean;
  supportsStore: boolean;
  supportsReasoningField: boolean;
};

function sanitizeMessages(messages: AssistantChatPayload["messages"]) {
  return (messages || [])
    .filter((message): message is AssistantChatMessage => {
      if (!message) return false;
      if (message.role !== "user" && message.role !== "assistant") return false;
      return typeof message.content === "string" && message.content.trim().length > 0;
    })
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

function toResponseInput(messages: AssistantChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: [
      {
        type: "input_text" as const,
        text: message.content,
      },
    ],
  }));
}

function getAssistantText(response: any) {
  const outputText = response?.output_text?.trim();
  if (outputText) return outputText;

  const message = response?.output?.find((item: any) => item?.type === "message");
  const content = message?.content?.find((item: any) => item?.type === "output_text");
  return content?.text?.trim() || "";
}

function getToolCalls(response: any) {
  return (response?.output || []).filter((item: any) => item?.type === "function_call");
}

function getProviderConfig(): ProviderConfig | null {
  const provider = getAiAssistantProvider();
  const model = getAiAssistantModel();

  switch (provider) {
    case "openai":
      return {
        provider,
        model,
        apiKey: getOpenAiApiKey(),
        supportsStatefulResponses: true,
        supportsStore: true,
        supportsReasoningField: true,
      };
    case "groq":
      return {
        provider,
        model,
        apiKey: getGroqApiKey(),
        baseURL: "https://api.groq.com/openai/v1",
        supportsStatefulResponses: false,
        supportsStore: false,
        supportsReasoningField: false,
      };
    case "ollama":
      return {
        provider,
        model,
        apiKey: "ollama",
        baseURL: `${getOllamaBaseUrl()}/v1`,
        supportsStatefulResponses: false,
        supportsStore: false,
        supportsReasoningField: false,
      };
    default:
      return null;
  }
}

function buildResponseRequest(config: ProviderConfig, input: any, previousResponseId?: string | null) {
  return {
    model: config.model,
    instructions: createCommerceAssistantInstructions("site"),
    input,
    tools: [...commerceAssistantTools],
    parallel_tool_calls: true,
    max_output_tokens: 700,
    ...(config.supportsStatefulResponses && previousResponseId ? { previous_response_id: previousResponseId } : {}),
    ...(config.supportsStore ? { store: false } : {}),
    ...(config.supportsReasoningField ? { reasoning: { effort: "low" as const } } : {}),
  };
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`assistant_chat:${ip}`, 14, 60_000);

  if (!rateLimit.ok) {
    const response = applyNoStoreHeaders(
      NextResponse.json(
        {
          ok: false,
          error: "Muitas mensagens em sequência. Aguarde um pouco antes de continuar.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      )
    );
    response.headers.set("Retry-After", String(rateLimit.retryAfter));
    return response;
  }

  const payload = ((await request.json().catch(() => ({}))) || {}) as AssistantChatPayload;
  const messages = sanitizeMessages(payload.messages);
  const previousResponseId = payload.previousResponseId?.trim() || null;
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!latestUserMessage) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Envie uma mensagem para continuar." }, { status: 400 })
    );
  }

  const providerConfig = getProviderConfig();
  if (!providerConfig || !isAiAssistantConfigured()) {
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        provider: "fallback",
        model: getAiAssistantModel(),
        responseId: null,
        message: buildCommerceFallbackReply(latestUserMessage.content),
      })
    );
  }

  try {
    const client = new OpenAI({
      apiKey: providerConfig.apiKey,
      baseURL: providerConfig.baseURL,
    });

    const initialInput =
      providerConfig.supportsStatefulResponses && previousResponseId
        ? toResponseInput([latestUserMessage])
        : toResponseInput(messages);

    let response = await client.responses.create(
      buildResponseRequest(providerConfig, initialInput, previousResponseId)
    );

    for (let safety = 0; safety < 4; safety += 1) {
      const toolCalls = getToolCalls(response);
      if (!toolCalls.length) break;

      const outputs = await Promise.all(
        toolCalls.map(async (call: any) => {
          const args = JSON.parse(call.arguments || "{}");
          const output = await executeCommerceTool(call.name, args);
          return {
            type: "function_call_output" as const,
            call_id: call.call_id,
            output: JSON.stringify(output),
          };
        })
      );

      response = await client.responses.create(
        buildResponseRequest(
          providerConfig,
          outputs,
          providerConfig.supportsStatefulResponses ? response.id : null
        )
      );
    }

    const message = getAssistantText(response) || buildCommerceFallbackReply(latestUserMessage.content);

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: true,
        source: "ai",
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseId: providerConfig.supportsStatefulResponses ? response.id || null : null,
        message,
      })
    );
  } catch (error: any) {
    const status = Number(error?.status || error?.cause?.status || 0);
    const rateLimited = status === 429;

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        provider: providerConfig.provider,
        model: providerConfig.model,
        responseId: null,
        message: rateLimited
          ? `O consultor automático atingiu o limite atual do provedor. Posso continuar em modo guiado ou você pode fechar pelo WhatsApp: https://wa.me/${whatsappNumber}`
          : buildCommerceFallbackReply(latestUserMessage.content),
      })
    );
  }
}
