import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Route = { route: string; headers?: Record<string, string> };
const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Route[];
  navigationFallback?: unknown;
  responseOverrides: Record<string, { rewrite: string }>;
};
const route = (path: string) => config.routes.find((item) => item.route === path)?.headers ?? {};

describe('static deployment response policy', () => {
  it('ships restrictive browser policies for the local financial workspace', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  });

  it('separates immutable hashed assets from revalidated app entry points', () => {
    expect(route('/assets/*')['Cache-Control']).toContain('max-age=31536000');
    expect(route('/assets/*')['Cache-Control']).toContain('immutable');
    expect(route('/')['Cache-Control']).toBe('no-cache');
    expect(route('/demo/')['Cache-Control']).toBe('no-cache');
    expect(route('/sw.js')['Cache-Control']).toBe('no-cache');
    expect(route('/asset-manifest.json')['Cache-Control']).toBe('no-cache');
    expect(route('/manifest.webmanifest')['Content-Type']).toContain('application/manifest+json');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  });

  it('returns a designed 404 instead of rewriting unknown pages to the app', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']?.rewrite).toBe('/404.html');
    expect(route('/404.html')['Cache-Control']).toBe('no-cache');
  });
});
