
import '@testing-library/jest-dom';

// Mock matchMedia for tests that need it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi => ({
    matches: false,
    media: vi,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

// Global mocks for supabase can be added here if needed
