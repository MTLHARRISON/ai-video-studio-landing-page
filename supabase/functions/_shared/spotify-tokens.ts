// Shared in-memory storage for Spotify host tokens
// Note: In edge functions, each function has its own isolate, so this won't be truly shared
// For production, consider using Deno KV or a database
// This is a simple in-memory solution that works within a single function's lifecycle

export interface HostToken {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

class TokenStorage {
  private tokens = new Map<string, HostToken>();

  set(roomId: string, token: HostToken): void {
    this.tokens.set(roomId, token);
  }

  get(roomId: string): HostToken | undefined {
    return this.tokens.get(roomId);
  }

  delete(roomId: string): boolean {
    return this.tokens.delete(roomId);
  }

  has(roomId: string): boolean {
    return this.tokens.has(roomId);
  }

  clear(): void {
    this.tokens.clear();
  }
}

export const tokenStorage = new TokenStorage();
