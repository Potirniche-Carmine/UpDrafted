declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface ManifestEntry {
    url: string;
    revision?: string | null;
  }
  
  interface ExpirationOptions {
    maxEntries?: number;
    maxAgeSeconds?: number;
    purgeOnQuotaError?: boolean;
  }
  
  interface CacheableResponseOptions {
    statuses?: number[];
    headers?: Record<string, string>;
  }
  
  interface PluginConfig {
    cacheWillUpdate?: (options: { request: Request; response: Response }) => Promise<Response | undefined | null> | Response | undefined | null;
    [key: string]: unknown;
  }
  
  interface RuntimeCachingOptions {
    cacheName?: string;
    networkTimeoutSeconds?: number;
    expiration?: ExpirationOptions;
    cacheableResponse?: CacheableResponseOptions;
    plugins?: PluginConfig[];
    cacheKeyWillBeUsed?: (options: { request: Request }) => Promise<string> | string;
    cacheWillUpdate?: (options: { request: Request; response: Response }) => Promise<Response | undefined | null> | Response | undefined | null;
    cacheResponseWillBeUsed?: (options: { request: Request; response: Response }) => Promise<Response> | Response;
    requestWillFetch?: (options: { request: Request }) => Promise<Request> | Request;
    fetchDidFail?: (options: { originalRequest: Request; error: Error }) => Promise<void> | void;
    fetchDidSucceed?: (options: { request: Request; response: Response }) => Promise<Response> | Response;
  }
  
  interface RuntimeCaching {
    urlPattern: string | RegExp;
    handler: string;
    options?: RuntimeCachingOptions;
  }
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    sw?: string;
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: string[];
    additionalManifestEntries?: ManifestEntry[];
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    scope?: string;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    customWorkerDir?: string;
    mode?: 'production' | 'development';
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}
