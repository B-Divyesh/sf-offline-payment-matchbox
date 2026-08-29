import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { selectReleaseCommit } from './release-metadata.ts';

type ReleaseMetadata = {
  product: string;
  version: string;
  commit: string;
};

const packageMetadata = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { name: string; version: string };
let repositoryCommit: string | undefined;
try {
  repositoryCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  repositoryCommit = undefined;
}
const commit = selectReleaseCommit(repositoryCommit, [process.env.BUILD_SOURCEVERSION, process.env.GITHUB_SHA, process.env.COMMIT_SHA]);

const release: ReleaseMetadata = {
  product: packageMetadata.name,
  version: packageMetadata.version,
  commit: commit.toLowerCase(),
};

const releaseLabel = `v${release.version} · build ${release.commit.slice(0, 7)}`;

export default defineConfig({
  define: {
    __RELEASE_LABEL__: JSON.stringify(releaseLabel),
  },
  plugins: [{
    name: 'matchbox-release-identity',
    transformIndexHtml(html) {
      return html.replaceAll('__RELEASE_LABEL__', releaseLabel);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'release.json',
        source: `${JSON.stringify(release, null, 2)}\n`,
      });
    },
  }],
  build: {
    target: 'es2022',
    manifest: 'asset-manifest.json',
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
