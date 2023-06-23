import { SitesEffects } from '../sites/effects/sites.effects';
import { DatasetsEffects } from '../datasets/effects/datasets.effects';
import { TerrainProviderEffects } from '../services/terrainprovider/effects/terrainprovider.effects';
import { UsersEffects } from '../users/effects/users.effects';

export const Effects = [
  SitesEffects,
  DatasetsEffects,
  TerrainProviderEffects,
  UsersEffects,
];