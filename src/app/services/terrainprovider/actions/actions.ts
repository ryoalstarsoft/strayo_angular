import { Action } from '@ngrx/store';

import { TerrainProvider } from '../../../models/terrainProvider.model';
import { TerrainProviderState } from '../state';

import { Smdjs } from '../../../models/smdjs.model';
import { Mtljs } from '../../../models/mtljs.model';
import { Progress } from '../../../util/progress';

export enum TerrainProviderActionsType {
    RESET = '[TerrainProvider] Reset',
    ADD_TERRAIN_PROVIDER = '[TerrainProvider] Add',
    GET_TERRAIN = '[TerrainProvider] Load Model',
    GET_TERRAIN_SUCCESS = '[TerrainProvider] Load Model Success',
    GET_TERRAIN_ERROR = '[TerrainProvider] Load Model Error',
}

export class ResetState implements Action {
    type = TerrainProviderActionsType.RESET;
    constructor(public payload?) {}
}

export class AddTerrainProvider implements Action {
    type = TerrainProviderActionsType.ADD_TERRAIN_PROVIDER;
    constructor(public payload: TerrainProvider) {}
}

export class GetTerrain implements Action {
    type = TerrainProviderActionsType.GET_TERRAIN;
    constructor(public payload: {provider: TerrainProvider, smdjs: Smdjs,
        mtljs: Mtljs, smdjsURL: string, quality?: number, progress: Progress}) {}
}

export class GetTerrainSuccess implements Action {
    type = TerrainProviderActionsType.GET_TERRAIN_SUCCESS;
    constructor(public payload: { provider: TerrainProvider, modelNode: osg.Node, quality: number}) {}
}

export class GetTerrainError implements Action {
    type = TerrainProviderActionsType.GET_TERRAIN_ERROR;
    constructor(public payload: { provider: TerrainProvider, error: Error}) {}
}

export type TerrainProviderActions = ResetState
| AddTerrainProvider
| GetTerrain
| GetTerrainSuccess
| GetTerrainError;