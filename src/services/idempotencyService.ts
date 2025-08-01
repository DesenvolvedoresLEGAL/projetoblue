
interface CacheEntry<T> {
  result: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class IdempotencyService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  cacheResult<T>(key: string, result: T, ttl: number = this.DEFAULT_TTL): void {
    
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl
    });

    // Limpar cache expirado periodicamente
    this.cleanupExpiredEntries();
  }

  getCachedResult<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      
      return null;
    }

    // Verificar se o cache expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      
      this.cache.delete(key);
      return null;
    }

    
    return entry.result as T;
  }

  clearCache(key?: string): void {
    if (key) {
      
      this.cache.delete(key);
    } else {
      
      this.cache.clear();
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
  }

  // Método para debugging
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const idempotencyService = new IdempotencyService();
