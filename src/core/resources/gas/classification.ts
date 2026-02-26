import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';

type MeteorologyData = MeteorologyLegacyResponse | MeteorologyResponse;

/**
 * Classifies meteorology payloads by fee model.
 * Uses meta.feeType first, then falls back to payload-shape checks.
 * https://github.com/rainbow-me/rainbow/commit/268105a01e0f6b53f50bf84b67d13601c1c7f9eb
 */
export function isLegacyMeteorologyFeeData(
  meteorologyData: MeteorologyData,
): meteorologyData is MeteorologyLegacyResponse {
  const feeType = meteorologyData?.meta?.feeType;
  if (feeType === 'legacy') return true;
  if (feeType === 'eip1559') return false;

  const hasLegacyPayload =
    !!meteorologyData?.data && 'legacy' in meteorologyData.data;
  const hasEip1559Payload =
    !!meteorologyData?.data && 'baseFeeSuggestion' in meteorologyData.data;
  return hasLegacyPayload && !hasEip1559Payload;
}
