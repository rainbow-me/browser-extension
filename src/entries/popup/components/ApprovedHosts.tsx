import React, { useState } from 'react';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function ApprovedHosts() {
  const [approvedHosts, setApprovedHosts] = useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      const approvedHosts = await Storage.get('approvedHosts');
      setApprovedHosts(approvedHosts);

      const unlisten = Storage.listen('approvedHosts', setApprovedHosts);
      return unlisten;
    })();
  }, []);

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="14pt" weight="bold">
          APPROVED HOSTS
        </Text>
      </Box>
      {approvedHosts?.map((approvedHost, i) => {
        return (
          <Box key={i} background="surfaceSecondary" padding="16px">
            <Text color="labelSecondary" size="14pt" weight="bold">
              {approvedHost}
            </Text>
          </Box>
        );
      })}
    </>
  );
}
