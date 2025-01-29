#!/usr/bin/env node

import { Interface } from '@ethersproject/abi';

const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'commands',
        type: 'bytes',
      },
      {
        internalType: 'bytes[]',
        name: 'inputs',
        type: 'bytes[]',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'execute2',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];

const COMMANDS = {
  '0a': 'PERMIT2_TRANSFER_FROM',
  '00': 'V3_SWAP_EXACT_IN',
  '06': 'UNWRAP_WETH',
  '0c': 'SWEEP',
};

function decodeUniversalRouterTx(data) {
  const iface = new Interface(UNIVERSAL_ROUTER_ABI);
  const decodedFunction = iface.parseTransaction({ data });

  const commands = decodedFunction.args[0].slice(2).match(/.{2}/g);
  const inputs = decodedFunction.args[1];
  const deadline = new Date(decodedFunction.args[2].toNumber() * 1000);

  return {
    function: 'execute2',
    commands: commands.map((cmd) => ({
      raw: cmd,
      decoded: COMMANDS[cmd] || 'UNKNOWN',
    })),
    inputs,
    deadline: deadline.toISOString(),
  };
}

const txData = process.argv[2];
if (!txData) {
  console.error('Usage: node decode-tx.mjs <transaction-data>');
  process.exit(1);
}

try {
  const decoded = decodeUniversalRouterTx(txData);
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
