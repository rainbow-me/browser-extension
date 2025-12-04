import '@total-typescript/ts-reset';

// Patch NodeJS.Timer and related timer types to be `number` for browser compatibility.
// This ensures types reflect that setTimeout/setInterval in browser return number, not Node.js objects.

declare global {
  namespace NodeJS {
    type Timer = number;
    type Timeout = number;
    type Immediate = number;
  }
}
