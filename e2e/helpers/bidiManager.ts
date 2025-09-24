import type { WebDriver } from 'selenium-webdriver';

import { interceptMocks } from '../mocks/intercept';

/**
 * Manages BiDi lifecycle to work around Chrome crashes during window operations
 */
export class BiDiManager {
  private driver: WebDriver;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private interceptor: any;
  private isActive = false;
  private pauseCount = 0; // Handle nested pauses

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  /**
   * Initialize BiDi interception
   */
  async initialize(): Promise<void> {
    if (!this.isActive) {
      try {
        console.log('[BiDiManager] Starting initialization...');
        this.interceptor = await interceptMocks(this.driver);
        if (this.interceptor) {
          this.isActive = true;
          console.log(
            '[BiDiManager] Successfully initialized with interceptor',
          );
        } else {
          console.warn('[BiDiManager] interceptMocks returned null');
        }
      } catch (error) {
        console.error('[BiDiManager] Failed to initialize:', error);
      }
    } else {
      console.log('[BiDiManager] Already active, skipping initialization');
    }
  }

  /**
   * Temporarily pause BiDi (before window operations)
   */
  async pause(): Promise<void> {
    // eslint-disable-next-line no-plusplus
    this.pauseCount++;
    if (this.isActive && this.pauseCount === 1) {
      try {
        await this.interceptor?.cleanup();
        this.isActive = false;
        console.log('[BiDiManager] Paused');
      } catch (error) {
        console.warn('[BiDiManager] Error during pause:', error);
        // Still mark as inactive even if cleanup fails
        this.isActive = false;
      }
    }
  }

  /**
   * Resume BiDi (after window operations)
   * Only resume if we're still in a testable state
   */
  async resume(): Promise<void> {
    this.pauseCount = Math.max(0, this.pauseCount - 1);
    if (!this.isActive && this.pauseCount === 0) {
      try {
        // Check if driver is still alive before resuming
        await this.driver.getCurrentUrl();

        // Only resume if we're on a test page (not extension)
        const url = await this.driver.getCurrentUrl();
        const isExtensionPage = url.startsWith('chrome-extension://');

        if (!isExtensionPage) {
          this.interceptor = await interceptMocks(this.driver);
          this.isActive = true;
          console.log('[BiDiManager] Resumed');
        } else {
          console.log('[BiDiManager] Skipping resume on extension page');
        }
      } catch (error) {
        console.warn(
          '[BiDiManager] Cannot resume - driver may be in bad state:',
          (error as Error).message,
        );
        // Don't try to resume if driver is dead
      }
    }
  }

  /**
   * Execute a callback without BiDi active
   */
  async withoutBiDi<T>(callback: () => Promise<T>): Promise<T> {
    await this.pause();
    try {
      return await callback();
    } finally {
      await this.resume();
    }
  }

  /**
   * Clean up BiDi on driver shutdown
   */
  async cleanup(): Promise<void> {
    if (this.interceptor) {
      try {
        await this.interceptor.cleanup();
        this.interceptor = null;
        this.isActive = false;
        this.pauseCount = 0;
        console.log('[BiDiManager] Cleaned up');
      } catch (error) {
        console.warn('[BiDiManager] Error during cleanup:', error);
        // Reset state even if cleanup fails
        this.interceptor = null;
        this.isActive = false;
        this.pauseCount = 0;
      }
    }
  }

  /**
   * Check if BiDi is currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }
}
