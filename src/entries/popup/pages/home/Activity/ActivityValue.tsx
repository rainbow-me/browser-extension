import { RainbowTransaction } from '~/core/types/transactions';
import { Box, Inline, Text, TextOverflow } from '~/design-system';
import { ChainBadge } from '~/entries/popup/components/ChainBadge/ChainBadge';
import { ContractIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';

import {
  type ActivityDisplayValues,
  getActivityDisplayValues,
} from './getActivityDisplayValues';

const renderValues = (
  values: ActivityDisplayValues,
): [React.ReactNode, React.ReactNode] => {
  switch (values.type) {
    case 'swap':
      return [values.outValue, values.inValue];

    case 'bridge':
      return [
        <Inline key="bridge" alignVertical="center" space="4px">
          <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
            to {values.chainName}
          </TextOverflow>
          <ChainBadge chainId={values.chainId} size={12} />
        </Inline>,
        values.inValue,
      ];

    case 'approval':
      return [
        values.contractName ? (
          <Inline alignVertical="center" space="4px">
            {values.contractIconUrl && (
              <ContractIcon size={16} iconUrl={values.contractIconUrl} />
            )}
            {values.contractName}
          </Inline>
        ) : null,
        values.label ? (
          <Box
            paddingHorizontal="6px"
            paddingVertical="5px"
            borderColor="separatorSecondary"
            borderRadius="6px"
            borderWidth="1px"
            style={{ borderStyle: 'dashed' }}
          >
            <Text size="11pt" weight="semibold" color="labelTertiary">
              {values.label}
            </Text>
          </Box>
        ) : null,
      ];

    case 'transfer':
      return [values.topValue, values.bottomValue];
  }
};

export const ActivityValue = ({
  transaction,
}: {
  transaction: RainbowTransaction;
}) => {
  const values = getActivityDisplayValues(transaction);
  if (!values) return null;

  const [topValue, bottomValue] = renderValues(values);
  if (!topValue && !bottomValue) return null;

  return (
    <Box
      display="flex"
      flexShrink="0"
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="center"
      gap="8px"
    >
      {topValue && (
        <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
          {topValue}
        </TextOverflow>
      )}
      {typeof bottomValue === 'string' ? (
        <TextOverflow
          size="14pt"
          weight="semibold"
          align="right"
          color={
            typeof bottomValue === 'string' && bottomValue.includes('+')
              ? 'green'
              : 'labelSecondary'
          }
        >
          {bottomValue}
        </TextOverflow>
      ) : (
        bottomValue
      )}
    </Box>
  );
};
