import { Record, Map } from 'immutable';

import { TerrainProvider } from '../../models/terrainProvider.model';
import { Progress } from '../../util/progress';

const terrainProviderState = Record({
    providers: Map({}),
    pending: Map({}),
});

export class TerrainProviderState extends terrainProviderState {
    providers: Map<number, TerrainProvider>;
    pending: Map<number, Progress>;

    addTerrainProvider(provider: TerrainProvider): TerrainProviderState {
        const check: TerrainProvider = this.getIn(['providers', provider.dataset().id()]);
        if (check) {
            const update = Object.assign({}, check.getProperties(), provider.getProperties());
            check.setProperties(update);
            provider = check;
        }
        return this.setIn(['providers', provider.dataset().id()], provider) as TerrainProviderState;
    }

    getTerrain(params: {provider: TerrainProvider, progress: Progress}): TerrainProviderState {
        const { provider, progress } = params;
        return this.setIn(['pending', provider.dataset().id()], progress) as TerrainProviderState;
    }

    getTerrainSuccess(params: { provider: TerrainProvider, modelNode: osg.Node, quality: number}): TerrainProviderState {
        const { provider, modelNode, quality } = params;
        const progress = this.pending.get(provider.dataset().id());
        provider.modelNode(modelNode);
        provider.quality(quality);
        progress.progress(1, 1);
        return this;
    }

    getTerrainError(params: { provider: TerrainProvider, error: Error}): TerrainProviderState {
        const { provider, error } = params;
        const progress = this.pending.get(provider.dataset().id());
        console.error(error);
        progress.error(error);
        return this;
    }
}

export function getInitialState() {
    return new TerrainProviderState();
}