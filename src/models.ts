import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

export interface BranchNames {
  base: string;
  feature: string;
  hotfix: string;
  development: string;
  bugfix: string;
}

export const gitMethodologies = ['GitFlow', 'GitHubFlow'] as const;
export type GitMethodology = typeof gitMethodologies[number];

export const gitBranchSeparators = ['/', '-'] as const;
export type BranchSeparator = typeof gitBranchSeparators[number];

export const tagSeparators = ['#', '£', '$'] as const;
export type TagSeparator = typeof tagSeparators[number];

export const packageManagers = ['npm'] as const;
export type PackageManager = typeof packageManagers[number];

export interface CIPilotFileConfig {
  gitMethodology: GitMethodology;
  branchNames: BranchNames;
  gitBranchSeparator: BranchSeparator;
  tagSeparator: TagSeparator;
  packageManager: PackageManager;
}

export interface NextVersionInfo {
  version: string;
  tag: string;
  lastTag?: string;
}

export type PackageJson = JSONSchemaForNPMPackageJsonFiles & {
  packagePath: string;
};
