import { readFileSync } from 'fs';

import { RELEASE_RELIC_FILENAME } from './constants';
import { ReleaseRelic } from './models';

export const retrieveReleaseRelicData = (): ReleaseRelic => {
  try {
    const relicStr = readFileSync(RELEASE_RELIC_FILENAME).toString();
    return JSON.parse(relicStr);
  } catch (error) {
    throw new Error(`Error retrieving the release relic - ${error.message}`);
  }
};
