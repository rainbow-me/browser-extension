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
  const [formData, setFormData] = useState({
    selectedAddresses: [] as string[],
  });
  const [addresses, setAddresses] = useState<AddressesData['addresses']>([]);
  const toggleAddress = (address: string) => {
    const selected = formData.selectedAddresses.includes(address);
    if (selected)
      return setFormData({
        selectedAddresses: formData.selectedAddresses.filter(
          (currentAddress) => currentAddress !== address,
        ),
      });
    return setFormData({
      selectedAddresses: [...formData.selectedAddresses, address],
    });
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSelected(formData.selectedAddresses);
  };
  useEffect(() => {
    const fetchWalletAddresses = async () => {
      const fetchedAddresses = await fetchAddresses();
      setAddresses(fetchedAddresses);
    };
    fetchWalletAddresses();
  }, []);
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
            <input
              id={`addr_${address}`}
              type="checkbox"
              value={address}
              onClick={() => toggleAddress(address)}
            />
            <label
              htmlFor={`addr_${address}`}
              onClick={() => toggleAddress(address)}
            >
              {address}
            </label>
          </li>
        ))}
      </ul>
      <Button height="36px" variant="flat" color="fill">
        Export Addresses
      </Button>
    </Box>
  );
};
