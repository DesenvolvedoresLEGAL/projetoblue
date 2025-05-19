
// Add TypeScript declarations for testing libraries to resolve type errors
import '@testing-library/jest-dom';

// Augment the Vitest global instance with testing-library matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      // DOM Testing Library matchers
      toBeInTheDocument(): T;
      toBeVisible(): T;
      toBeRequired(): T;
      toHaveTextContent(text: string): T;
      toHaveAttribute(attr: string, value?: any): T;
      toHaveValue(value?: any): T;
      toBeChecked(): T;
      toBeDisabled(): T;
      toHaveFocus(): T;
      // Add other matchers as needed
    }
  }
}

// No export needed
