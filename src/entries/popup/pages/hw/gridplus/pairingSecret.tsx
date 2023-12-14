import { motion } from 'framer-motion';
import { pair } from 'gridplus-sdk';
import { FormEvent, useState } from 'react';

import { Box, Button, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';

export type PairingSecretProps = {
  onAfterPair?: () => void;
};

export const PairingSecret = ({ onAfterPair }: PairingSecretProps) => {
  const [formData, setFormData] = useState({
    pairingCode: '',
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await pair(formData.pairingCode);
    console.log('>>>RES', result);
    onAfterPair && onAfterPair();
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
        Check your Lattice1 device for the pairing secret.
      </Text>
      <Box as="fieldset" display="flex" flexDirection="column" gap="8px">
        <Text size="14pt" weight="semibold">
          Pairing Code
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
        />
      </Box>
      <Button height="36px" variant="flat" color="fill">
        Pair Device
      </Button>
    </Box>
  );
};
