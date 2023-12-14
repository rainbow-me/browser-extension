import { motion } from 'framer-motion';
import { fetchAddresses } from 'gridplus-sdk';
import { FormEvent, useEffect, useState } from 'react';

import { Box, Button, Text } from '~/design-system';

export type AddressesData = {
  addresses: string[];
};

export type AddressChoiceProps = {
  onSelected: (addressses: AddressesData['addresses']) => void;
};

export const AddressChoice = ({ onSelected }: AddressChoiceProps) => {
  const [addresses, setAddresses] = useState<AddressesData['addresses']>([]);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // onSelected(data.addresses);
    onSelected([]);
  };
  useEffect(() => {
    const fetchWalletAddresses = async () => {
      const fetchedAddresses = await fetchAddresses();
      setAddresses(fetchedAddresses);
    };
    fetchWalletAddresses();
  }, []);
  console.log('>>>ADDRS', addresses);
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
        Choose Addresses
      </Text>
      <ul>
        {addresses.map((address) => (
          <li key={address}>
            <input id={`addr_${address}`} type="checkbox" value={address} />
            <label htmlFor={`addr_${address}`}>{address}</label>
          </li>
        ))}
      </ul>
      <Button height="36px" variant="flat" color="fill">
        Export Addresses
      </Button>
    </Box>
  );
};
