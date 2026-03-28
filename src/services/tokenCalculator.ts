/**
 * Supported priced model identifiers.
 */
export type SupportedModel = 'gpt-4o';

/**
 * Model pricing in EUR per token.
 */
export interface ModelPricing {
  inputPerTokenEur: number;
  outputPerTokenEur: number;
}

const MODEL_PRICING_EUR: Record<SupportedModel, ModelPricing> = {
  'gpt-4o': {
    inputPerTokenEur: 0.0000025,
    outputPerTokenEur: 0.00001
  }
};

/**
 * Calculates request cost in EUR from token usage and model pricing.
 *
 * @param model - Model identifier (currently supports GPT-4o).
 * @param inputTokens - Count of prompt/input tokens.
 * @param outputTokens - Count of completion/output tokens.
 * @returns Cost in EUR rounded to 8 decimal places.
 */
export function calculateCostEur(model: string, inputTokens: number, outputTokens: number): number {
  if (!Number.isInteger(inputTokens) || inputTokens < 0) {
    throw new Error('inputTokens must be a non-negative integer.');
  }

  if (!Number.isInteger(outputTokens) || outputTokens < 0) {
    throw new Error('outputTokens must be a non-negative integer.');
  }

  const pricing = MODEL_PRICING_EUR[normalizeModel(model)];
  const total = inputTokens * pricing.inputPerTokenEur + outputTokens * pricing.outputPerTokenEur;

  return Number(total.toFixed(8));
}

/**
 * Returns pricing details for a supported model.
 *
 * @param model - Model identifier.
 */
export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING_EUR[normalizeModel(model)];
}

function normalizeModel(model: string): SupportedModel {
  const normalized = model.trim().toLowerCase();

  if (normalized !== 'gpt-4o') {
    throw new Error(`Unsupported model: ${model}. Supported models: gpt-4o.`);
  }

  return normalized;
}
