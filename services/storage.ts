class StorageService {
  private storage: Map<string, string> = new Map();

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.storage.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      this.storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getString(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setString(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
}

export const storageService = new StorageService();
