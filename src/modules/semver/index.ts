import { inc, ReleaseType } from 'semver';

export const getNextVersion = (lastVersion: string, type: ReleaseType, identifier?: string) => {
  const nextVersion = inc(lastVersion, type, identifier ? { includePrerelease: true } : undefined, identifier);

  if (!nextVersion) {
    throw new Error(`Could not generate the next version for '${lastVersion}'`);
  }

  return nextVersion;
};
