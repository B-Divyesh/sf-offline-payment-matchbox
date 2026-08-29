import { describe, expect, it } from 'vitest';
import { selectReleaseCommit } from '../release-metadata.ts';

const candidate = '20fe84da49e6c0a3402ba0c64bd7dd26e92ade84';

describe('release identity', () => {
  it('uses a full repository commit when build metadata agrees', () => {
    expect(selectReleaseCommit(candidate, [candidate.toUpperCase(), undefined])).toBe(candidate);
  });

  it('stops a build whose injected candidate does not match repository HEAD', () => {
    const unavailableCandidate = '20fe840e99f5384136ea626c20aa1b5770ecde94';
    expect(() => selectReleaseCommit(candidate, [unavailableCandidate])).toThrow(/does not match repository HEAD/);
  });

  it('rejects shortened or missing release identities', () => {
    expect(() => selectReleaseCommit('20fe84d', [])).toThrow(/full 40-character Git SHA/);
    expect(() => selectReleaseCommit(undefined, [])).toThrow(/full Git commit is required/);
  });
});
