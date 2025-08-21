import { os } from '@orpc/server';
import z from 'zod';

import { initializeMessenger } from '~/core/messengers';

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

const SetDefaultProviderInputSchema = z.object({
  rainbowAsDefault: z.boolean(),
});

// Ping handler (equivalent to current keep alive)
const setDefaultProviderHandler = os
  .input(SetDefaultProviderInputSchema)
  .handler(async ({ input: { rainbowAsDefault } }) => {
    await inpageMessenger.send('rainbow_setDefaultProvider', {
      rainbowAsDefault,
    });
  });

export const rainbowRouter = {
  setDefaultProvider: setDefaultProviderHandler,
};
