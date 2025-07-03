
interface CacheEntry<T> {
  result: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class IdempotencyService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  cacheResult<T>(key: string, result: T, ttl: number = this.DEFAULT_TTL): void {
    if (import.meta.env.DEV) console.log('[IdempotencyService] Cacheando resultado para chave:', key);
    
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
      if (import.meta.env.DEV) console.log('[IdempotencyService] Nenhum resultado cacheado encontrado para:', key);
      return null;
    }

    // Verificar se o cache expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      if (import.meta.env.DEV) console.log('[IdempotencyService] Cache expirado para chave:', key);
      this.cache.delete(key);
      return null;
    }

    if (import.meta.env.DEV) console.log('[IdempotencyService] Resultado cacheado encontrado para:', key);
    return entry.result;
  }

  clearCache(key?: string): void {
    if (key) {
      if (import.meta.env.DEV) console.log('[IdempotencyService] Limpando cache específico:', key);
      this.cache.delete(key);
    } else {
      if (import.meta.env.DEV) console.log('[IdempotencyService] Limpando todo o cache');
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

    if (cleanedCount > 0) {
      if (import.meta.env.DEV) console.log(`[IdempotencyService] Limpeza automática: ${cleanedCount} entradas expiradas removidas`);
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
