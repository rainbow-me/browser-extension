import { getAddress } from '@ethersproject/address';
import { motion } from 'framer-motion';
import { fetchAddresses } from 'gridplus-sdk';
import { FormEvent, useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { truncateAddress } from '~/core/utils/address';
import { Box, Button, Text } from '~/design-system';
import { Checkbox } from '~/entries/popup/components/Checkbox/Checkbox';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';

export type AddressesData = {
  addresses: Address[];
};

export type AddressChoiceProps = {
  onSelected: (addressses: AddressesData['addresses']) => void;
};

export const AddressChoice = ({ onSelected }: AddressChoiceProps) => {
  const [formData, setFormData] = useState({
    selectedAddresses: [] as string[],
  });
  const [loadingAddresses, setLoadingAddresses] = useState(true);
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
    onSelected(formData.selectedAddresses as Address[]);
  };
  useEffect(() => {
    const fetchWalletAddresses = async () => {
      setLoadingAddresses(true);
      const fetchedAddresses = (await fetchAddresses()) as Address[];
      const mixedCaseAddresses = fetchedAddresses.map((address) =>
        getAddress(address),
      );
      setAddresses(mixedCaseAddresses);
      setLoadingAddresses(false);
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
      {loadingAddresses && <Spinner size={24} />}
      <Box display="flex" flexDirection="column" gap="16px">
        {addresses.map((address, i) => (
          <Box key={address} display="flex" gap="8px" alignItems="center">
            <Checkbox
              borderColor="blue"
              onClick={() => toggleAddress(address)}
              selected={formData.selectedAddresses.includes(address)}
              testId={`gridplus-address-${i}`}
            />
            <Text size="14pt" weight="bold">
              {truncateAddress(address)}
            </Text>
          </Box>
        ))}
      </Box>
      <Button
        height="36px"
        variant="flat"
        color="fill"
        disabled={loadingAddresses || formData.selectedAddresses.length === 0}
        testId="gridplus-submit"
      >
        Export Addresses
      </Button>
    </Box>
  );
};
