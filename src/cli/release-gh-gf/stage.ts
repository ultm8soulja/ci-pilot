import { printSuccessText, checkGitFlowReleaseBranch } from '../../util';
import { getCurrentBranchName, pushToOrigin, createTag } from '../../modules';

import { STAGE_TAG_PREFIX } from './constants';

export const stageReleaseCandidateHead = async () => {
  const currentBranchName = await getCurrentBranchName();

  checkGitFlowReleaseBranch(currentBranchName);

  const tag = await createTag(`${STAGE_TAG_PREFIX}${new Date().getTime()}`);

  await pushToOrigin(tag);

  printSuccessText(`Staging tag ${tag} successfully created and pushed to origin`);
};
