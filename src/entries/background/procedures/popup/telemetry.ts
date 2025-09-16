import { os } from '@orpc/server';
import * as Sentry from '@sentry/browser';
import z from 'zod';

// Schema for telemetry breadcrumb input
const TelemetryBreadcrumbSchema = z.object({
  from: z.string(),
  to: z.string(),
});

// Handler to add a breadcrumb to Sentry on navigation
const addRouterBreadcrumbHandler = os
  .input(TelemetryBreadcrumbSchema)
  .output(z.object({ success: z.literal(true) }))
  .handler(async ({ input: { from, to } }) => {
    Sentry.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      data: {
        from,
        to,
      },
      timestamp: Math.floor(Date.now() / 1000), // Sentry expects seconds
      level: 'info',
    });
    return { success: true };
  });

export const telemetryRouter = {
  addRouterBreadcrumb: addRouterBreadcrumbHandler,
};
