import { Router, type Request, type Response } from 'express';
import { dbPool } from '../db/pool';

interface UsageMetricsRow {
  calls: string;
  input_tokens: string;
  output_tokens: string;
  total_tokens: string;
}

interface CostMetricsRow {
  total_cost_eur: string;
  avg_cost_eur: string;
}

interface LatencyMetricsRow {
  avg_latency_ms: string;
  p95_latency_ms: string;
  p99_latency_ms: string;
}

/**
 * Router exposing LLM monitoring metrics endpoints.
 */
export const metricsRouter = Router();

/**
 * GET /metrics/usage
 * Returns aggregate usage from the last 24 hours.
 */
metricsRouter.get('/usage', async (_req: Request, res: Response) => {
  try {
    const result = await dbPool.query<UsageMetricsRow>(
      `
      SELECT
        COUNT(*)::text AS calls,
        COALESCE(SUM(input_tokens), 0)::text AS input_tokens,
        COALESCE(SUM(output_tokens), 0)::text AS output_tokens,
        COALESCE(SUM(total_tokens), 0)::text AS total_tokens
      FROM token_usage
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      `
    );

    const row = result.rows[0];

    res.status(200).json({
      window: '24h',
      calls: Number(row.calls),
      inputTokens: Number(row.input_tokens),
      outputTokens: Number(row.output_tokens),
      totalTokens: Number(row.total_tokens)
    });
  } catch (error) {
    respondWithMetricsError(res, error);
  }
});

/**
 * GET /metrics/cost
 * Returns total and average cost in EUR.
 */
metricsRouter.get('/cost', async (_req: Request, res: Response) => {
  try {
    const result = await dbPool.query<CostMetricsRow>(
      `
      SELECT
        COALESCE(SUM(cost_eur), 0)::text AS total_cost_eur,
        COALESCE(AVG(cost_eur), 0)::text AS avg_cost_eur
      FROM token_usage
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      `
    );

    const row = result.rows[0];

    res.status(200).json({
      currency: 'EUR',
      totalCostEur: Number(row.total_cost_eur),
      averageCostEur: Number(Number(row.avg_cost_eur).toFixed(8))
    });
  } catch (error) {
    respondWithMetricsError(res, error);
  }
});

/**
 * GET /metrics/latency
 * Returns latency aggregates in milliseconds.
 */
metricsRouter.get('/latency', async (_req: Request, res: Response) => {
  try {
    const result = await dbPool.query<LatencyMetricsRow>(
      `
      SELECT
        COALESCE(AVG(latency_ms), 0)::text AS avg_latency_ms,
        COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::text AS p95_latency_ms,
        COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms), 0)::text AS p99_latency_ms
      FROM token_usage
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      `
    );

    const row = result.rows[0];

    res.status(200).json({
      unit: 'ms',
      averageLatencyMs: Number(Number(row.avg_latency_ms).toFixed(2)),
      p95LatencyMs: Number(Number(row.p95_latency_ms).toFixed(2)),
      p99LatencyMs: Number(Number(row.p99_latency_ms).toFixed(2))
    });
  } catch (error) {
    respondWithMetricsError(res, error);
  }
});

function respondWithMetricsError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown metrics error';

  res.status(500).json({
    error: 'Failed to fetch metrics',
    detail: message
  });
}
