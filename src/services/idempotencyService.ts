
export interface ValidationResult {
  valid: boolean;
  message: string;
  error_code?: string;
  active_associations: number;
  current_status: string;
}

class IdempotencyService {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { result, timestamp } = cached;
    const now = Date.now();

    // Verificar se não expirou
    if (now - timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return result;
  }

  cacheResult<T>(key: string, result: T): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Limpar cache expirado periodicamente
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  constructor() {
    // Cleanup a cada 10 minutos
    setInterval(() => this.cleanupExpiredCache(), 10 * 60 * 1000);
  }
}

export const idempotencyService = new IdempotencyService();
