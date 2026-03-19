import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  buildCommerceFallbackReply,
  commerceAssistantTools,
  createCommerceAssistantInstructions,
  executeCommerceTool,
  type AssistantChatMessage,
} from "@/lib/commerce-assistant";
import { getOpenAiApiKey, getOpenAiAssistantModel, isOpenAiConfigured } from "@/lib/env";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export const runtime = "nodejs";

type AssistantChatPayload = {
  messages?: AssistantChatMessage[];
  previousResponseId?: string | null;
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

export async function POST(request: Request) {
  const payload = ((await request.json().catch(() => ({}))) || {}) as AssistantChatPayload;
  const messages = sanitizeMessages(payload.messages);
  const previousResponseId = payload.previousResponseId?.trim() || null;
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (!latestUserMessage) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Envie uma mensagem para continuar." }, { status: 400 })
    );
  }

  if (!isOpenAiConfigured()) {
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        model: getOpenAiAssistantModel(),
        responseId: null,
        message: buildCommerceFallbackReply(latestUserMessage.content),
      })
    );
  }

  try {
    const client = new OpenAI({ apiKey: getOpenAiApiKey() });
    const model = getOpenAiAssistantModel();
    const initialInput = previousResponseId ? toResponseInput([latestUserMessage]) : toResponseInput(messages);

    let response = await client.responses.create({
      model,
      instructions: createCommerceAssistantInstructions("site"),
      input: initialInput,
      previous_response_id: previousResponseId || undefined,
      tools: [...commerceAssistantTools],
      parallel_tool_calls: true,
      reasoning: { effort: "low" },
      max_output_tokens: 700,
      store: false,
    });

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

      response = await client.responses.create({
        model,
        instructions: createCommerceAssistantInstructions("site"),
        previous_response_id: response.id,
        input: outputs,
        tools: [...commerceAssistantTools],
        parallel_tool_calls: true,
        reasoning: { effort: "low" },
        max_output_tokens: 700,
        store: false,
      });
    }

    const message = getAssistantText(response) || buildCommerceFallbackReply(latestUserMessage.content);

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: true,
        source: "openai",
        model,
        responseId: response.id || null,
        message,
      })
    );
  } catch {
    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        aiReady: false,
        source: "fallback",
        model: getOpenAiAssistantModel(),
        responseId: null,
        message: buildCommerceFallbackReply(latestUserMessage.content),
      })
    );
  }
}
