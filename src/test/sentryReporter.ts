import * as Sentry from '@sentry/node';
import { File, Reporter } from 'vitest';

Sentry.init({
  dsn: 'https://1f96990126bdc1ad3fa31d41a231a174@o331974.ingest.us.sentry.io/4507507871645696',
});

class SentryReporter implements Reporter {
  onFinished(files?: File[]): void {
    files?.forEach((file) => {
      file.tasks.forEach((task) => {
        if (
          task.result?.state === 'fail' &&
          task.result?.errors &&
          task.result.errors.length > 0
        ) {
          const error = task.result.errors[0];
          Sentry.captureMessage(task.name, {
            level: 'error',
            tags: {
              testFile: file.name || 'unknown',
              testName: task.name,
              branch: process.env.GITHUB_HEAD_REF,
            },
            contexts: {
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
            },
            extra: {
              errorName: error.name,
              errorMessage: error.message,
              stack: error.stack,
              branch: process.env.GITHUB_HEAD_REF,
            },
          });
        }
      });
    });
  }
}

export default SentryReporter;
