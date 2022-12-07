// import { useState } from 'react';
// import { Address, useEnsAddress } from 'wagmi';

// import { ParsedAddressAsset } from '~/core/types/assets';

export const useSendTransactionState = ({
  addressOrName,
}: {
  addressOrName: string;
}) => {
  const { data: address } = useEnsAddress({ name: addressOrName });

  //   const [to, setTo] = useState<Address>();
  //   const [from, setfrom] = useState<Address>();
  //   const [data, setData] = useState<string>();
  //   const [value, setValue] = useState<string>();
  //   const [gasLimit, setGasLimit] = useState<string>();
  //   const [token, setToken] = useState<ParsedAddressAsset>();

  console.log('ADDRESSSSS - ', address);
  return { address };
};
