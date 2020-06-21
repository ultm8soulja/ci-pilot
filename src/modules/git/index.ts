import simpleGit from 'simple-git/promise';
import { exec } from 'shelljs';

import { printInfoText, printWarningText, printErrorText } from '../../util';

export const getCurrentBranchName = async () => {
  const git = simpleGit();
  const { current } = await git.branchLocal();
  return current;
};

export const isRemoteBranchExist = (branch: string) => {
  const { code, stderr } = exec(`git show-ref --verify --quiet 'refs/remotes/origin/${branch}'`, { silent: true });

  if (code === 0) {
    return true;
  } else if (code === 1) {
    return false;
  } else {
    throw new Error(`Unexpected: ${stderr}`);
  }
};

export const moveTag = async (tag: string, destinationRef = 'HEAD') => {
  const git = simpleGit();
  await git.tag(['-f', tag, destinationRef]);
};

export const getMostRecentMatchingTag = async (pattern: string) => {
  const git = simpleGit();
  const tags = await git.tags([pattern, { '--sort': '-v:refname' }]);
  const tag = tags.latest;

  if (!tag) {
    printWarningText(`No tags match '${pattern}'`);
    return;
  } else {
    printInfoText(`Last tag: ${tag}`);
    return tag;
  }
};

export const fetchMatchingTags = async (pattern: string) => {
  const git = simpleGit();
  const remoteTags = await git.listRemote(['--tags', 'origin', pattern]);

  if (remoteTags.trim() === '') {
    printInfoText(`No matching remote tags found`);
    return;
  }

  const tags = remoteTags
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      const [, fullTag] = line.split(/\s/);
      const tag = /(refs\/tags\/.*)/.exec(fullTag);

      return tag ? tag[1] : undefined;
    })
    .filter(tag => tag);

  if (!tags) {
    printInfoText(`No matching remote tags found`);
    return;
  }

  printInfoText(`Matching remote tags =>\n${tags.reduce((p, c) => `${p}\n${c}`)}`);

  const refSpecs = tags.map(tag => `${tag}:${tag}`);

  await git.fetch('origin', undefined, refSpecs);
};

export const checkoutBranch = async (branch: string) => {
  const git = simpleGit();
  try {
    await git.checkout(branch);
    await git.pull();
  } catch (error) {
    if ((error.message as string).includes('did not match any file(s) known to git')) {
      throw new Error(`'${branch}' branch does not exist`);
    }
    throw error;
  }
};

export const createBranch = async (branch: string) => {
  const git = simpleGit();
  await git.checkoutLocalBranch(branch);

  printInfoText(`Git branch created => ${branch}`);
};

export const createTag = async (tag: string) => {
  const git = simpleGit();
  const { name } = await git.addTag(tag);

  printInfoText(`Git tag created => ${name}`);

  return name;
};

export const pushToOrigin = async (ref: string) => {
  const git = simpleGit();
  await git.push('origin', ref);
};

export const reset = async (mode: 'soft' | 'mixed' | 'hard' | 'merge' | 'keep') => {
  const git = simpleGit();
  await git.reset(mode);
};

export const isGitRepository = async (): Promise<boolean> => {
  const git = simpleGit();
  return await git.checkIsRepo();
};

export const isWorkingDirectoryClean = async (): Promise<boolean> => {
  const git = simpleGit();
  const result = await git.status();
  return result.isClean();
};

export const getRefHash = async (ref: string): Promise<string> => {
  const git = simpleGit();
  const {
    latest: { hash },
  } = await git.log([ref, '-1', '--pretty=%H']);
  printInfoText(`Hash: '${hash}'`);
  return hash;
};

export const isAncestor = (refOne: string, refTwo: string) => {
  const { code, stderr } = exec(`git merge-base --is-ancestor ${refOne} ${refTwo}`, { silent: true });

  if (code === 0) {
    return true;
  } else if (code === 1) {
    return false;
  } else {
    printErrorText(stderr);

    let msg;
    if (new RegExp(refOne).test(stderr)) {
      msg = `'${refOne}' is not a valid Git ref`;
    } else if (new RegExp(refTwo).test(stderr)) {
      msg = `'${refTwo}' is not a valid Git ref`;
    } else {
      msg = `Unexpected: ${stderr}`;
    }

    throw new Error(msg);
  }
};

export const isGitHeadTagged = (tagPattern: string) => {
  const { code } = exec(`git describe --tags --exact-match --match "${tagPattern}" HEAD`, { silent: true });
  return code !== 128;
};

export const getDiff = async (refOne: string, refTwo = 'HEAD') => {
  const git = simpleGit();
  const diff = await git.diff([refOne, refTwo, '--name-only']);

  if (diff.trim() === '') {
    return;
  }

  printInfoText(`Changes => \n${diff}`);
  return diff.split('\n');
};

export const stageFiles = async (files: string[]) => {
  const git = simpleGit();
  await git.add(files);
};

export const commit = async (message: string, files?: string[]) => {
  const git = simpleGit();
  await git.commit(message, files, { '--no-verify': true });
};

export const getRepositoryName = async () => {
  const git = simpleGit();
  const remotes = await git.getRemotes(true);
  const originRemote = remotes.filter(remote => remote.name === 'origin')[0];
  const repositoryName = originRemote.refs.push
    ?.split('git@github.com:')
    ?.pop()
    ?.split('.git')[0];

  return repositoryName;
};

export const merge = async (from: string, to: string) => {
  const git = simpleGit();
  await git.mergeFromTo(from, to, ['--no-ff', '--no-verify']);
};

export const deleteLocalBranch = async (branch: string) => {
  const git = simpleGit();
  await git.deleteLocalBranch(branch, true);
};

export const deleteRemoteRef = async (ref: string) => {
  const git = simpleGit();
  await git.push('origin', ref, { '--delete': null });
};

export const fetchBranch = async (branch: string) => {
  const git = simpleGit();
  await git.raw(['fetch', 'origin', `${branch}:${branch}`]);
};
