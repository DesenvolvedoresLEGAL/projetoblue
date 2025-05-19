
import '@testing-library/jest-dom';
import { expect } from 'vitest';

// Extend Vitest's expect with Jest DOM matchers
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
