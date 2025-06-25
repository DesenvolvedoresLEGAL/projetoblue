import { createContext } from 'react';
import type { AuthContextType } from '@/types/authContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
