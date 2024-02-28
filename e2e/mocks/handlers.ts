import { rest } from 'msw';

interface BlockchainRequestBody {
  transactionHash: string;
}

export const handlers = [
  rest.post<never, never, BlockchainRequestBody>(
    'https://eth-mainnet.g.alchemy.com/v2/7A_gwNuV-oCQhMJnhlOdHaPo1yJZnp39',
    async (req) => {
      const requestBody = await req.json();
      const { transactionHash } = requestBody;
      console.log(`Intercepted transaction hash: ${transactionHash}`);
    },
  ),
];
