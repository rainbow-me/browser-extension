import { detectScriptType } from './detectScriptType';

/**
 * Throws an error if the current script is not running in the background context.
 *
 * @param identifier - A string used to identify the file or module for error reporting.
 * @throws {Error} If the script is not running in the background context.
 */
export const onlyBackground = (identifier: string): void => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (detectScriptType() !== 'background') {
    throw new Error(
      `This file '${identifier}' can only be loaded from the background script`,
    );
  }
};
