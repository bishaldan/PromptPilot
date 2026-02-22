export {};

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage?: (
          extensionId: string,
          message: unknown,
          callback?: (response?: unknown) => void
        ) => void;
        lastError?: {
          message?: string;
        };
      };
    };
  }
}
