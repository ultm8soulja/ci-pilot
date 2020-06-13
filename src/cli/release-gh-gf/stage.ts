import { printSuccessText, checkGitFlowReleaseBranch } from '../../util';
import { getCurrentBranchName, pushToOrigin, createTag } from '../../modules';

export const stageReleaseCandidateHead = async () => {
  const currentBranchName = await getCurrentBranchName();

  checkGitFlowReleaseBranch(currentBranchName);

  const tag = await createTag(`staging-${new Date().getTime()}`);

  await pushToOrigin(tag);

  printSuccessText(`Staging tag ${tag} successfully created and pushed to origin`);
};
