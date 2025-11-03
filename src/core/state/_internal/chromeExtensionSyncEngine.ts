import {
  StorageValue,
  SyncEngine,
  SyncHandle,
  SyncRegistration,
  SyncValues,
} from 'stores';

import {
  AreaName,
  CHROME_STORAGE_NAMESPACE,
  ChromeStorageAdapter,
} from './chromeStorageAdapter';

const ENABLE_LOGS = false;
const ENABLE_METADATA_LOGS = false;

export type ChromeExtensionSyncEngineOptions =
  | {
      area?: AreaName;
      namespace?: string;
    }
  | { storage: ChromeStorageAdapter };

type RegistrationContainer = {
  destroyed: boolean;
  hydrated: boolean;
  listeners: Set<() => void>;
  registration: SyncRegistration<Record<string, unknown>>;
};

export class ChromeExtensionSyncEngine implements SyncEngine {
  readonly injectStorageMetadata = true;
  readonly sessionId: string;

  private readonly area: AreaName;
  private readonly namespace: string;
  private readonly registrations = new Map<string, RegistrationContainer>();

  private isListening = false;

  constructor(options?: ChromeExtensionSyncEngineOptions) {
    if (options && 'storage' in options) {
      this.area = options.storage.area;
      this.namespace = options.storage.namespace;
    } else {
      this.area = options?.area ?? 'local';
      this.namespace = options?.namespace ?? CHROME_STORAGE_NAMESPACE;
    }
    this.sessionId = this.generateSessionId();
    this.attachListener();
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      return crypto.randomUUID();
    return `${Math.random().toString(36).slice(2)}:${Date.now().toString(36)}`;
  }

  register<T extends Record<string, unknown>>(
    registration: SyncRegistration<T>,
  ): SyncHandle<T> {
    this.attachListener();

    const container: RegistrationContainer = {
      destroyed: false,
      hydrated: true, // Immediately hydrated - persist will handle its own hydration
      listeners: new Set(),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      registration: registration as SyncRegistration<Record<string, unknown>>,
    };

    this.registrations.set(registration.key, container);
    if (ENABLE_LOGS)
      console.log(
        '[SyncEngine] REGISTERED store:',
        registration.key,
        'sessionId:',
        this.sessionId,
        'fields:',
        registration.fields,
      );

    return {
      destroy: () => {
        container.destroyed = true;
        container.listeners.clear();
        this.registrations.delete(registration.key);
        if (!this.registrations.size) this.detachListener();
      },

      /**
       * Broadcasting occurs via chrome.storage.onChanged.
       *
       * When syncEnhancer calls set(), the persist middleware:
       *   1. Embeds syncMetadata (origin, timestamp, fields) into the persisted value
       *   2. Writes to chrome.storage[area]
       *   3. Chrome automatically fires onChanged events in all contexts
       *
       * This onStorageChanged handler receives the change with embedded metadata
       * and applies it after filtering out self-updates via origin check.
       *
       * Therefore, publish is a no-op - broadcasts happen automatically via storage events.
       */
      publish: () => {
        // No-op: Broadcasting happens automatically via chrome.storage.onChanged
        // when persist middleware writes to storage with injectStorageMetadata: true
      },
    };
  }

  private attachListener(): void {
    if (typeof chrome === 'undefined' || !chrome.storage || this.isListening)
      return;
    this.isListening = true;
    chrome.storage.onChanged.addListener(this.onStorageChanged);
    if (ENABLE_LOGS)
      console.log(
        '[📡 SyncEngine 📡] Storage listener attached for sessionId:',
        this.sessionId,
      );
  }

  private detachListener(): void {
    if (typeof chrome === 'undefined' || !chrome.storage || !this.isListening)
      return;
    chrome.storage.onChanged.removeListener(this.onStorageChanged);
    this.isListening = false;
  }

  private onStorageChanged = async (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: AreaName,
  ): Promise<void> => {
    if (areaName !== this.area) return;

    for (const registeredStore of this.registrations) {
      const storeKey = registeredStore[0];
      const container = registeredStore[1];
      if (container.destroyed) continue;

      const change = changes[this.toStorageKey(storeKey)];
      if (!change || !change.newValue) continue;

      try {
        const persistValue = this.parsePersistValue(change.newValue);
        if (
          !persistValue ||
          persistValue.syncMetadata?.origin === this.sessionId
        )
          continue;

        if (ENABLE_LOGS)
          console.log(
            `[📡 SyncEngine 📡] onStorageChanged('${storeKey}'): Applying remote update`,
          );

        const metadata = persistValue?.syncMetadata;
        const values = this.extractChangedFields(
          container,
          persistValue.state,
          metadata,
          change.oldValue,
        );

        if (!Object.keys(values).length) {
          if (ENABLE_LOGS) console.log(`[SyncEngine] No fields changed`);
          continue;
        }

        container.registration.apply({
          replace: false,
          sessionId: metadata?.origin ?? 'unknown',
          timestamp: metadata?.timestamp ?? Date.now(),
          values,
        });

        if (ENABLE_LOGS)
          console.log(
            `[📡 SyncEngine 📡] Passed fields to syncEnhancer:`,
            Object.keys(values).join(', '),
          );
      } catch (error) {
        // Ignore errors, sync is best-effort
        if (ENABLE_LOGS)
          console.error(
            `[SyncEngine] Error processing update for ${storeKey}:`,
            error,
          );
        continue;
      }
    }
  };

  /**
   * Extracts which fields changed in this update.
   * Prefers field-level metadata when available, falls back to full state diff.
   * Does NOT perform conflict resolution - that's handled by syncEnhancer.processUpdate.
   */
  private extractChangedFields(
    container: RegistrationContainer,
    incomingState: Record<string, unknown>,
    metadata: StorageValue<Record<string, unknown>>['syncMetadata'] | undefined,
    oldValue: unknown,
  ): SyncValues<Record<string, unknown>> {
    const values: SyncValues<Record<string, unknown>> = Object.create(null);
    const metadataFields = metadata?.fields;

    if (metadataFields && Object.keys(metadataFields).length > 0) {
      let populatedFromMetadata = false;
      for (const field of container.registration.fields) {
        const fieldKey = String(field);
        if (Object.prototype.hasOwnProperty.call(metadataFields, fieldKey)) {
          values[field] = incomingState[field];
          populatedFromMetadata = true;
        }
      }

      if (populatedFromMetadata) {
        if (ENABLE_METADATA_LOGS)
          console.log(
            '[✅ SyncEngine ✅] Extracted field metadata:',
            Object.keys(metadataFields).join(', '),
          );
        return values;
      }
    }

    // Fallback to state diff if no field metadata available
    if (ENABLE_METADATA_LOGS)
      console.log(
        '[🟡 SyncEngine 🟡] No field metadata available — falling back to full state diff',
      );
    const oldPersistValue = this.parsePersistValue(oldValue);

    for (const field of container.registration.fields) {
      const newVal = incomingState[field];
      const oldVal = oldPersistValue?.state[field];
      if (!Object.is(newVal, oldVal)) values[field] = newVal;
    }

    return values;
  }

  private namespacePrefix(): string {
    return this.namespace ?? '';
  }

  private toStorageKey(key: string): string {
    return `${this.namespacePrefix()}${key}`;
  }

  private parsePersistValue(value: unknown): {
    state: Record<string, unknown>;
    version?: number;
    syncMetadata?: {
      origin?: string;
      timestamp?: number;
      fields?: Record<string, number>;
    };
  } | null {
    if (!value || typeof value !== 'string') return null;
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== 'object') return null;
      if (!('state' in parsed) || typeof parsed.state !== 'object') return null;
      return parsed as {
        state: Record<string, unknown>;
        version?: number;
        syncMetadata?: {
          origin?: string;
          timestamp?: number;
          fields?: Record<string, number>;
        };
      };
    } catch {
      return null;
    }
  }
}
