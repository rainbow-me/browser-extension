// / <reference types="vitest" />
import { WebDriver } from 'selenium-webdriver';

declare module 'vitest' {
  export interface TestContext {
    driver: WebDriver;
    rootURL: string;
  }
}
