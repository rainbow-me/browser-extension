import { motion } from 'framer-motion';
import { pair } from 'gridplus-sdk';
import { FormEvent, useState } from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

export type PairingSecretProps = {
  onAfterPair?: () => void;
};

export const PairingSecret = ({ onAfterPair }: PairingSecretProps) => {
  const [pairing, setPairing] = useState(false);
  const [formState, setFormState] = useState({
    error: false,
  });
  const [formData, setFormData] = useState({
    pairingCode: '',
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPairing(true);
    try {
      const result = await pair(formData.pairingCode);
      if (!result) {
        return setFormState({ error: true });
      }
      onAfterPair && onAfterPair();
    } finally {
      setPairing(false);
    }
  };
  return (
    <Box
      as={motion.form}
      display="flex"
      flexDirection="column"
      onSubmit={onSubmit}
      gap="16px"
      width="full"
    >
      <Text size="20pt" weight="semibold">
        {i18n.t('hw.gridplus_check_device')}
      </Text>
      <Box as="fieldset" display="flex" flexDirection="column" gap="8px">
        <Text size="14pt" weight="semibold">
          {i18n.t('hw.gridplus_pairing_code')}
        </Text>
        <Input
          id="pairingCode"
          height="40px"
          variant="bordered"
          placeholder="Pairing Code"
          onChange={(e) =>
            setFormData({ ...formData, pairingCode: e.target.value })
          }
          value={formData.pairingCode}
          testId="gridplus-pairing-code"
          autoFocus
        />
        {formState.error && (
          <Text size="14pt" weight="semibold">
            {i18n.t('hw.gridplus_wrong_code')}
          </Text>
        )}
      </Box>
      <Button
        height="36px"
        variant="flat"
        color="fill"
        testId="gridplus-submit"
        disabled={pairing}
      >
        {i18n.t('hw.gridplus_pair_device')}
      </Button>
    </Box>
  );
};
