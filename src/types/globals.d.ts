/* eslint-disable @typescript-eslint/no-explicit-any */
// Global type definitions for temporary fixes

declare global {
  interface Window {
    setupModule?: any;
  }
}

// Utility types for better TypeScript compatibility
export type SafeRecord = Record<string, any>;
export type FlexibleClient = any;
export type FlexibleAsset = any;
export type FlexibleStatus = any;

export {};