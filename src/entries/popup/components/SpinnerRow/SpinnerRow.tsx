import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Column, Columns, Inset, Row, Rows, Text } from '~/design-system';

import { Spinner } from '../Spinner/Spinner';

export function SpinnerRow() {
  return (
    <Box style={{ height: '52px', marginTop: '-8px', paddingBottom: 60 }}>
      <Inset horizontal="20px" vertical="8px">
        <Rows>
          <Row>
            <Columns alignVertical="center" space="8px">
              <Column width="content">
                <Box
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  borderRadius="round"
                  borderColor="buttonStroke"
                  borderWidth="1px"
                  style={{
                    height: 36,
                    width: 36,
                    display: 'flex',
                  }}
                >
                  <Spinner color="accent" size={18} />
                </Box>
              </Column>
              <Column>
                <Text color="labelTertiary" size="12pt" weight="semibold">
                  {i18n.t('activity.loading_more')}
                </Text>
              </Column>
            </Columns>
          </Row>
        </Rows>
      </Inset>
    </Box>
  );
}
