// NanoBanana Pro Asset Provider
// With fallback to local placeholder assets

export interface SpriteAsset {
  idle: string;
  attack: string;
  hurt: string;
  victory: string;
  defeat: string;
}

export interface BattleAssets {
  fighterA: SpriteAsset;
  fighterB: SpriteAsset;
  background: string;
  effects: {
    hit: string;
    critical: string;
    heal: string;
  };
}

export interface AssetProvider {
  name: string;
  getBattleAssets(): Promise<BattleAssets>;
  getCharacterSprite(type: "A" | "B"): Promise<SpriteAsset>;
  getEffectSprite(type: "hit" | "critical" | "heal"): Promise<string>;
}

// Local fallback assets (SVG data URLs)
const fallbackSprite: SpriteAsset = {
  idle: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%234a90d9'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 40 Q32 48 40 40' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E",
  attack: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%234a90d9'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 38 L40 38' stroke='white' stroke-width='3'/%3E%3Cpath d='M48 32 L56 24 L56 40 Z' fill='%23ff6b6b'/%3E%3C/svg%3E",
  hurt: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%234a90d9' opacity='0.8'/%3E%3Cpath d='M22 28 L30 28' stroke='white' stroke-width='2'/%3E%3Cpath d='M34 28 L42 28' stroke='white' stroke-width='2'/%3E%3Ccircle cx='32' cy='42' r='6' fill='white'/%3E%3C/svg%3E",
  victory: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%234a90d9'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 40 Q32 48 40 40' stroke='white' stroke-width='3' fill='none'/%3E%3Cpath d='M32 8 L34 14 L40 14 L35 18 L37 24 L32 20 L27 24 L29 18 L24 14 L30 14 Z' fill='%23ffd700'/%3E%3C/svg%3E",
  defeat: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%234a90d9' opacity='0.5'/%3E%3Cpath d='M23 25 L29 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M29 25 L23 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M35 25 L41 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M41 25 L35 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M24 44 Q32 36 40 44' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E",
};

const fallbackSpriteB: SpriteAsset = {
  idle: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23e84057'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 40 Q32 48 40 40' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E",
  attack: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23e84057'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 38 L40 38' stroke='white' stroke-width='3'/%3E%3Cpath d='M16 32 L8 24 L8 40 Z' fill='%234a90d9'/%3E%3C/svg%3E",
  hurt: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23e84057' opacity='0.8'/%3E%3Cpath d='M22 28 L30 28' stroke='white' stroke-width='2'/%3E%3Cpath d='M34 28 L42 28' stroke='white' stroke-width='2'/%3E%3Ccircle cx='32' cy='42' r='6' fill='white'/%3E%3C/svg%3E",
  victory: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23e84057'/%3E%3Ccircle cx='26' cy='28' r='3' fill='white'/%3E%3Ccircle cx='38' cy='28' r='3' fill='white'/%3E%3Cpath d='M24 40 Q32 48 40 40' stroke='white' stroke-width='3' fill='none'/%3E%3Cpath d='M32 8 L34 14 L40 14 L35 18 L37 24 L32 20 L27 24 L29 18 L24 14 L30 14 Z' fill='%23ffd700'/%3E%3C/svg%3E",
  defeat: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23e84057' opacity='0.5'/%3E%3Cpath d='M23 25 L29 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M29 25 L23 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M35 25 L41 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M41 25 L35 31' stroke='white' stroke-width='2'/%3E%3Cpath d='M24 44 Q32 36 40 44' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E",
};

const fallbackEffects = {
  hit: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 0 L18 12 L32 16 L18 20 L16 32 L14 20 L0 16 L14 12 Z' fill='%23ffd700'/%3E%3C/svg%3E",
  critical: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 0 L27 18 L48 24 L27 30 L24 48 L21 30 L0 24 L21 18 Z' fill='%23ff6b6b'/%3E%3Cpath d='M24 8 L26 20 L40 24 L26 28 L24 40 L22 28 L8 24 L22 20 Z' fill='%23ffd700'/%3E%3C/svg%3E",
  heal: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect x='12' y='4' width='8' height='24' fill='%2344d9a8'/%3E%3Crect x='4' y='12' width='24' height='8' fill='%2344d9a8'/%3E%3C/svg%3E",
};

const fallbackBackground =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230f172a'/%3E%3Cstop offset='100%25' style='stop-color:%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23bg)' width='400' height='300'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23334155' opacity='0.3'/%3E%3Ccircle cx='350' cy='250' r='40' fill='%23334155' opacity='0.2'/%3E%3C/svg%3E";

// Fallback provider using local SVG assets
class FallbackAssetProvider implements AssetProvider {
  name = "fallback";

  async getBattleAssets(): Promise<BattleAssets> {
    return {
      fighterA: fallbackSprite,
      fighterB: fallbackSpriteB,
      background: fallbackBackground,
      effects: fallbackEffects,
    };
  }

  async getCharacterSprite(type: "A" | "B"): Promise<SpriteAsset> {
    return type === "A" ? fallbackSprite : fallbackSpriteB;
  }

  async getEffectSprite(type: "hit" | "critical" | "heal"): Promise<string> {
    return fallbackEffects[type];
  }
}

// NanoBanana Pro provider (connects to external API)
class NanoBananaProvider implements AssetProvider {
  name = "nanobanana";
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  private async fetchAsset(endpoint: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url || data.dataUrl;
    } catch (error) {
      console.warn(`NanoBanana fetch failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getBattleAssets(): Promise<BattleAssets> {
    try {
      const [fighterA, fighterB, background, effects] = await Promise.all([
        this.getCharacterSprite("A"),
        this.getCharacterSprite("B"),
        this.fetchAsset("/backgrounds/battle-arena"),
        this.getEffects(),
      ]);

      return {
        fighterA,
        fighterB,
        background,
        effects,
      };
    } catch {
      // Fallback to local assets
      const fallback = new FallbackAssetProvider();
      return fallback.getBattleAssets();
    }
  }

  private async getEffects(): Promise<BattleAssets["effects"]> {
    const [hit, critical, heal] = await Promise.all([
      this.fetchAsset("/effects/hit"),
      this.fetchAsset("/effects/critical"),
      this.fetchAsset("/effects/heal"),
    ]);
    return { hit, critical, heal };
  }

  async getCharacterSprite(type: "A" | "B"): Promise<SpriteAsset> {
    try {
      const characterType = type === "A" ? "fighter-blue" : "fighter-red";
      const [idle, attack, hurt, victory, defeat] = await Promise.all([
        this.fetchAsset(`/characters/${characterType}/idle`),
        this.fetchAsset(`/characters/${characterType}/attack`),
        this.fetchAsset(`/characters/${characterType}/hurt`),
        this.fetchAsset(`/characters/${characterType}/victory`),
        this.fetchAsset(`/characters/${characterType}/defeat`),
      ]);
      return { idle, attack, hurt, victory, defeat };
    } catch {
      const fallback = new FallbackAssetProvider();
      return fallback.getCharacterSprite(type);
    }
  }

  async getEffectSprite(type: "hit" | "critical" | "heal"): Promise<string> {
    try {
      return await this.fetchAsset(`/effects/${type}`);
    } catch {
      const fallback = new FallbackAssetProvider();
      return fallback.getEffectSprite(type);
    }
  }
}

// Factory function to create the appropriate provider
export function createAssetProvider(): AssetProvider {
  const apiKey = process.env.NANOBANANA_API_KEY;
  const apiUrl = process.env.NANOBANANA_API_URL;

  if (apiKey && apiUrl) {
    console.log("[AssetProvider] Using NanoBanana Pro");
    return new NanoBananaProvider(apiKey, apiUrl);
  }

  console.log("[AssetProvider] Using fallback local assets");
  return new FallbackAssetProvider();
}

// Singleton instance
let assetProviderInstance: AssetProvider | null = null;

export function getAssetProvider(): AssetProvider {
  if (!assetProviderInstance) {
    assetProviderInstance = createAssetProvider();
  }
  return assetProviderInstance;
}

// Export fallback assets for direct use in components
export const localAssets = {
  fighterA: fallbackSprite,
  fighterB: fallbackSpriteB,
  effects: fallbackEffects,
  background: fallbackBackground,
};
