
import { AuthErrorCategory } from '@/constants/auth';

export interface TechnicalErrorInfo {
  message: string;
  category?: AuthErrorCategory;
  timestamp: string;
  context?: Record<string, any>;
}
