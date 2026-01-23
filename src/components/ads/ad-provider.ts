// Ad Provider Architecture
// Supports AdSense (primary) with fallback mock provider for development

export interface AdConfig {
  clientId: string;
  testMode: boolean;
}

export interface AdProvider {
  name: string;
  initialize: (config: AdConfig) => Promise<void>;
  loadAd: (slotId: string, format: string) => Promise<void>;
  refreshAd: (slotId: string) => Promise<void>;
  destroy: () => void;
}

// AdSense Provider
class AdsenseProvider implements AdProvider {
  name = "adsense";
  private initialized = false;

  async initialize(config: AdConfig): Promise<void> {
    if (this.initialized || typeof window === "undefined") return;

    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
        this.initialized = true;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`;
      script.async = true;
      script.crossOrigin = "anonymous";

      if (config.testMode) {
        script.dataset.adbreakTest = "on";
      }

      script.onload = () => {
        this.initialized = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load AdSense script"));
      };

      document.head.appendChild(script);
    });
  }

  async loadAd(slotId: string, _format: string): Promise<void> {
    if (typeof window === "undefined" || !(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle) {
      return;
    }

    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch (e) {
      console.warn(`AdSense load error for slot ${slotId}:`, e);
    }
  }

  async refreshAd(_slotId: string): Promise<void> {
    // AdSense doesn't support manual refresh in the same way
    // The ad will refresh based on Google's policies
  }

  destroy(): void {
    this.initialized = false;
  }
}

// Mock Provider for Development
class MockProvider implements AdProvider {
  name = "mock";

  async initialize(_config: AdConfig): Promise<void> {
    console.log("[MockAdProvider] Initialized in development mode");
  }

  async loadAd(slotId: string, format: string): Promise<void> {
    console.log(`[MockAdProvider] Loading ad: ${slotId} (${format})`);
  }

  async refreshAd(slotId: string): Promise<void> {
    console.log(`[MockAdProvider] Refreshing ad: ${slotId}`);
  }

  destroy(): void {
    console.log("[MockAdProvider] Destroyed");
  }
}

// Factory function to get the appropriate provider
export function createAdProvider(): AdProvider {
  const isProduction = process.env.NODE_ENV === "production";
  const hasAdSenseConfig = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (isProduction && hasAdSenseConfig) {
    return new AdsenseProvider();
  }

  return new MockProvider();
}

// Singleton instance
let adProviderInstance: AdProvider | null = null;

export function getAdProvider(): AdProvider {
  if (!adProviderInstance) {
    adProviderInstance = createAdProvider();
  }
  return adProviderInstance;
}
