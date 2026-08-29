const FULL_COMMIT = /^[0-9a-f]{40}$/i;

export function selectReleaseCommit(gitCommit: string | undefined, injectedCommits: Array<string | undefined>): string {
  const supplied = injectedCommits.filter((value): value is string => Boolean(value));
  const candidates = [gitCommit, ...supplied].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (!FULL_COMMIT.test(candidate)) throw new Error(`Release commit must be a full 40-character Git SHA, received ${JSON.stringify(candidate)}.`);
  }

  const normalized = candidates.map((candidate) => candidate.toLowerCase());
  if (new Set(normalized).size > 1) throw new Error(`Injected release commit does not match repository HEAD (${normalized.join(' != ')}).`);
  if (!normalized[0]) throw new Error('A full Git commit is required to build release metadata.');
  return normalized[0];
}
