import { os } from '@orpc/server';
import * as Sentry from '@sentry/browser';
import z from 'zod';

// Schema for telemetry breadcrumb input
const TelemetryBreadcrumbSchema = z.object({
  path: z.string(),
  params: z.record(z.string(), z.any()).optional(),
});

// Handler to add a breadcrumb to Sentry on navigation
const addRouterBreadcrumbHandler = os
  .input(TelemetryBreadcrumbSchema)
  .output(z.object({ success: z.literal(true) }))
  .handler(async ({ input: { path, params } }) => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${path}`,
      data: {
        ...(params ? { params } : {}),
      },
      timestamp: Math.floor(Date.now() / 1000), // Sentry expects seconds
      level: 'info',
    });
    return { success: true };
  });

export const telemetryRouter = {
  addRouterBreadcrumb: addRouterBreadcrumbHandler,
};
