/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { type Address } from 'viem';
import { getProvider } from '@wagmi/core';

import { metadataClient } from '~/core/graphql';

import { fetchJsonLocally } from './localJson';

const METHOD_REGISTRY_ADDRESS = '0x44691B39d1a75dC4E0A0346CBB15E310e6ED1E86';

export const namesOverrides = {
  'Add Liquidity E T H': 'Add Liquidity',
  'Swap Exact E T H For Tokens': 'Swap',
  'Swap Exact Tokens For E T H': 'Swap',
  'Swap Tokens For Exact E T H': 'Swap',
  'Swap E T H For Exact Tokens': 'Swap',
  'Swap Tokens For Exact Tokens': 'Swap',
  'Swap Exact Tokens For Tokens': 'Swap',
  'Token To Eth Transfer Input': 'Swap',
  'Token To Eth Transfer Output': 'Swap',
  'Token To Token Transfer Input': 'Swap',
  'Token To Token Transfer Output': 'Swap',
  'Eth To Token Transfer Input': 'Swap',
  'Eth To Token Transfer Output': 'Swap',
};

export const methodRegistryLookupAndParse = async (
  methodSignatureBytes: any,
  contractAddress: Address,
) => {
  let signature = '';

  const response = await metadataClient.getContractFunction({
    chainID: 1,
    hex: methodSignatureBytes,
    address: contractAddress,
  });

  if (response?.contractFunction?.text) {
    signature = response.contractFunction.text;
  } else {
    const methodRegistryABI = (await fetchJsonLocally(
      'abis/method-registry-abi.json',
    )) as ContractInterface;
    const provider = getProvider({ chainId: 1 });

    const registry = new Contract(
      METHOD_REGISTRY_ADDRESS,
      methodRegistryABI,
      provider,
    );

    signature = await registry.entries(methodSignatureBytes);
  }

  const rawName = signature.match(new RegExp('^([^)(]*)\\((.*)\\)([^)(]*)$'));
  let parsedName;

  if (rawName) {
    parsedName =
      rawName[1].charAt(0).toUpperCase() +
      rawName[1]
        .slice(1)
        .split(/(?=[A-Z]{1})/)
        .join(' ');

    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (namesOverrides[parsedName]) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      parsedName = namesOverrides[parsedName];
    }
  } else {
    parsedName = '';
  }

  let args: { type: any }[] = [];

  if (rawName) {
    const match = signature.match(
      new RegExp(rawName[1] + '\\(+([a-z1-9,()]+)\\)'),
    );

    if (match?.[1]) {
      const argsMatch = match[1].match(/[A-z1-9]+/g);
      if (argsMatch) {
        args = argsMatch.map((arg: any) => {
          return { type: arg };
        });
      }
    }
  }

  parsedName = parsedName.replace('E T H', 'ETH');

  return {
    args,
    name: parsedName,
  };
};
