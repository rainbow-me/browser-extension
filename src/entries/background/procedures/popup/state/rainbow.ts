import { os } from '@orpc/server';
import z from 'zod';

import { sendSetDefaultProviderEvent } from '~/core/utils/inpageEvents';

const SetDefaultProviderInputSchema = z.object({
  rainbowAsDefault: z.boolean(),
});

// Ping handler (equivalent to current keep alive)
const setDefaultProviderHandler = os
  .input(SetDefaultProviderInputSchema)
  .handler(async ({ input: { rainbowAsDefault } }) => {
    await sendSetDefaultProviderEvent(rainbowAsDefault);
  });

export const rainbowRouter = {
  setDefaultProvider: setDefaultProviderHandler,
};
