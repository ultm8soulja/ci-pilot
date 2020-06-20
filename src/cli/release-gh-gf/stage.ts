import { printSuccessText, checkGitFlowReleaseBranch } from '../../util';
import { getCurrentBranchName, pushToOrigin, createTag } from '../../modules';

const STAGE_TAG_PREFIX = 'rc-';

export const stageReleaseCandidateHead = async () => {
  const currentBranchName = await getCurrentBranchName();

  checkGitFlowReleaseBranch(currentBranchName);

  const tag = await createTag(`${STAGE_TAG_PREFIX}${new Date().getTime()}`);

  await pushToOrigin(tag);

  printSuccessText(`Staging tag ${tag} successfully created and pushed to origin`);
};
