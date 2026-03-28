import type { NextFunction, Request, Response } from 'express';
import { dbPool } from '../db/pool';
import { calculateCostEur } from '../services/tokenCalculator';

interface OpenAiUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAiResponse {
  model?: string;
  usage?: OpenAiUsage;
}

interface LlmTrackOptions {
  /**
   * Path prefix that represents proxied OpenAI requests.
   * Default: /openai
   */
  openAiPathPrefix?: string;
}

/**
 * Express middleware that tracks OpenAI request usage, latency and cost.
 *
 * This middleware expects to run on routes that proxy OpenAI calls. It reads:
 * - model from request body or response body
 * - token usage from response usage payload
 * - latency from request start to response completion
 *
 * Results are persisted into `token_usage` table.
 */
export function llmTracker(options: LlmTrackOptions = {}) {
  const pathPrefix = options.openAiPathPrefix ?? '/openai';

  return async function trackLlmUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.path.startsWith(pathPrefix)) {
      next();
      return;
    }

    const startedAtMs = Date.now();
    let capturedPayload: OpenAiResponse | null = null;

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (body && typeof body === 'object') {
        capturedPayload = body as OpenAiResponse;
      }

      return originalJson(body);
    }) as Response['json'];

    res.once('finish', async () => {
      if (res.statusCode >= 400) {
        return;
      }

      const model = extractModel(req.body, capturedPayload);
      if (!model) {
        return;
      }

      const promptTokens = capturedPayload?.usage?.prompt_tokens ?? 0;
      const completionTokens = capturedPayload?.usage?.completion_tokens ?? 0;
      const totalTokens = capturedPayload?.usage?.total_tokens ?? promptTokens + completionTokens;
      const latencyMs = Date.now() - startedAtMs;

      let costEur: number;
      try {
        costEur = calculateCostEur(model, promptTokens, completionTokens);
      } catch {
        // If model is unsupported, skip persisting rather than failing request lifecycle.
        return;
      }

      try {
        await dbPool.query(
          `
          INSERT INTO token_usage (
            request_id,
            user_id,
            endpoint,
            model,
            input_tokens,
            output_tokens,
            total_tokens,
            latency_ms,
            cost_eur,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `,
          [
            req.headers['x-request-id'] ?? null,
            req.headers['x-user-id'] ?? null,
            req.originalUrl,
            model,
            promptTokens,
            completionTokens,
            totalTokens,
            latencyMs,
            costEur
          ]
        );
      } catch (error) {
        req.app.emit('error', error, req);
      }
    });

    next();
  };
}

function extractModel(requestBody: unknown, responseBody: OpenAiResponse | null): string | null {
  if (requestBody && typeof requestBody === 'object' && 'model' in requestBody) {
    const value = (requestBody as Record<string, unknown>).model;
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (typeof responseBody?.model === 'string' && responseBody.model.trim()) {
    return responseBody.model.trim();
  }

  return null;
}
