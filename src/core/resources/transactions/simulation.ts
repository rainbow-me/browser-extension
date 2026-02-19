import { metadataPostClient } from '~/core/graphql';
import {
  SimulateTransactionsQuery,
  SimulateTransactionsQueryVariables,
  Transaction,
} from '~/core/graphql/__generated__/metadata';
import { ChainId } from '~/core/types/chains';
import { RainbowError, logger } from '~/logger';

import { add } from '../../utils/numbers';

/** Single simulation result from the API */
export type TransactionSimulationResult = NonNullable<
  NonNullable<SimulateTransactionsQuery['simulateTransactions']>[number]
>;

/**
 * Simulate transactions using the metadata API.
 * This is a wrapper around metadataPostClient.simulateTransactions for consistency.
 */
export async function simulateTransactions(
  args: SimulateTransactionsQueryVariables,
): Promise<TransactionSimulationResult[]> {
  if (!args.transactions) return [];

  const transactions = Array.isArray(args.transactions)
    ? args.transactions
    : [args.transactions];
  if (transactions.length === 0) return [];

  const response = await metadataPostClient.simulateTransactions({
    ...args,
    transactions,
  });

  // Filter out null values from the response
  return (response?.simulateTransactions ?? []).filter(
    (r): r is TransactionSimulationResult => r !== null,
  );
}

/**
 * Estimate gas for multiple transaction steps using simulation.
 * Consolidates gas estimation for approve + swap or other multi-step flows.
 */
export async function estimateTransactionsGasLimit({
  chainId,
  steps,
}: {
  chainId: ChainId;
  steps: {
    transaction: Transaction | null;
    label: string;
    fallbackEstimate?: () => Promise<string | undefined>;
  }[];
}): Promise<string | undefined> {
  // Filter to only steps with valid transactions
  const activeSteps = steps.filter(
    (step): step is (typeof steps)[number] & { transaction: Transaction } =>
      step.transaction !== null,
  );

  if (activeSteps.length === 0) {
    return undefined;
  }

  const transactions = activeSteps.map((step) => step.transaction);

  try {
    const results = await simulateTransactions({
      chainId,
      transactions,
    });

    if (results.length !== activeSteps.length) {
      logger.warn(
        '[estimateTransactionsGasLimit]: Simulation result count mismatch',
        { expected: activeSteps.length, received: results.length },
      );
      return undefined;
    }

    const gasEstimates = await Promise.all(
      results?.map(async (res, index) => {
        const step = activeSteps[index];
        let gasEstimate = res?.gas?.estimate;

        if (!gasEstimate) {
          logger.warn(
            `[estimateTransactionsGasLimit]: Simulation failed for ${step.label}`,
            {
              message: res?.error?.message,
            },
          );

          if (step.fallbackEstimate) {
            gasEstimate = await step.fallbackEstimate();
          }
        }

        if (!gasEstimate) {
          throw new Error(`Failed to estimate gas for ${step.label}`);
        }

        return gasEstimate;
      }) || [],
    );

    return gasEstimates.reduce((acc, limit) => add(acc, limit), '0');
  } catch (e) {
    logger.error(
      new RainbowError('[estimateTransactionsGasLimit]: Failed to estimate'),
      {
        message: (e as Error)?.message,
      },
    );
    return undefined;
  }
}
