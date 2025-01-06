export class LocalStorageRecycler {
  private static instance: LocalStorageRecycler;
  private obsoleteKeys: string[] = [];

  private constructor() {
    // Initialize with known obsolete keys
    this.obsoleteKeys = ['rainbow.wagmi'];
  }

  public static getInstance(): LocalStorageRecycler {
    if (!LocalStorageRecycler.instance) {
      LocalStorageRecycler.instance = new LocalStorageRecycler();
    }
    return LocalStorageRecycler.instance;
  }

  /**
   * Add new keys to be recycled
   */
  public addObsoleteKeys(keys: string[]): void {
    this.obsoleteKeys.push(...keys);
  }

  /**
   * Check if any obsolete keys exist in storage
   */
  private async hasObsoleteData(): Promise<boolean> {
    const storage = await chrome.storage.local.get(this.obsoleteKeys);
    return Object.keys(storage).length > 0;
  }

  /**
   * Clean up obsolete storage keys
   */
  public async cleanup(): Promise<void> {
    try {
      // Check if there's anything to clean
      const hasObsoleteData = await this.hasObsoleteData();
      if (!hasObsoleteData) {
        return;
      }

      // Get storage size before cleanup for logging
      const beforeStorage = await chrome.storage.local.get(this.obsoleteKeys);
      const beforeSize = Object.values(beforeStorage).reduce(
        (acc, value) => acc + JSON.stringify(value).length / 1024,
        0,
      );

      // Remove obsolete keys
      await chrome.storage.local.remove(this.obsoleteKeys);

      console.log(`Storage cleanup completed:`);
      console.log(`- Removed keys: ${this.obsoleteKeys.join(', ')}`);
      console.log(`- Freed approximately ${beforeSize.toFixed(2)} KB`);
    } catch (error) {
      console.error('Storage cleanup failed:', error);
    }
  }
}
