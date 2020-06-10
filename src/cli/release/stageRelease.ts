import { printSuccessText } from '../../util';
import { getCurrentBranchName, pushToOrigin, createTag } from '../../modules';

const GITFLOW_RELEASE_BRANCH_REGEX = /^release\/\d+\.\d+\.\d+$/;

export const stageReleaseCandidateHead = async () => {
  const currentBranchName = await getCurrentBranchName();

  if (!GITFLOW_RELEASE_BRANCH_REGEX.test(currentBranchName)) {
    throw new Error('You must have a release branch checked out');
  }

  const tag = await createTag(`staging-${new Date().getTime()}`);

  await pushToOrigin(tag);

  printSuccessText(`Staging tag ${tag} successfully created and pushed to origin`);
};
