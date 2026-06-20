/**
 * DeepSeek API client (OpenAI-compatible).
 * Server-only: never import from client components.
 */

const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL?.replace(/\/$/, "") ??
  "https://api.deepseek.com/v1";

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";

export type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DeepSeekCallOptions = {
  messages: DeepSeekMessage[];
  /** Force JSON object output (model still produces a string; caller parses). */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** Optional model override (defaults to env / `deepseek-v4-flash`). */
  model?: string;
  signal?: AbortSignal;
};

export type DeepSeekResult = {
  ok: true;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type DeepSeekError = {
  ok: false;
  status: number;
  message: string;
};

export function hasDeepSeekKey(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export async function callDeepSeek(
  opts: DeepSeekCallOptions
): Promise<DeepSeekResult | DeepSeekError> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "DEEPSEEK_API_KEY is not configured on the server.",
    };
  }

  const body: Record<string, unknown> = {
    model: opts.model ?? DEEPSEEK_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1500,
  };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: opts.signal,
    });
  } catch (err) {
    return {
      ok: false,
      status: 502,
      message:
        err instanceof Error ? err.message : "Failed to reach DeepSeek API",
    };
  }

  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      detail = j.error?.message ?? "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    return {
      ok: false,
      status: res.status,
      message: detail || `DeepSeek request failed (${res.status})`,
    };
  }

  type ChatResp = {
    choices?: { message?: { content?: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  const json = (await res.json()) as ChatResp;
  const content = json.choices?.[0]?.message?.content ?? "";
  if (!content) {
    return { ok: false, status: 500, message: "Empty response from DeepSeek" };
  }

  return {
    ok: true,
    content,
    usage: {
      promptTokens: json.usage?.prompt_tokens,
      completionTokens: json.usage?.completion_tokens,
      totalTokens: json.usage?.total_tokens,
    },
  };
}
