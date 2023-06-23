import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { TerrainProviderService } from '../terrain-provider.service';
import { TerrainProviderActionsType, GetTerrain, GetTerrainSuccess, GetTerrainError } from '../actions/actions';

@Injectable()
export class TerrainProviderEffects {
    constructor(private actions$: Actions, private terrainService: TerrainProviderService) {}

    @Effect() loadTerrain$ = this.actions$.ofType(TerrainProviderActionsType.GET_TERRAIN)
        .map((action: GetTerrain) => action.payload)
        .mergeMap(payload => {
            const { provider, smdjs, mtljs, smdjsURL, quality, progress } = payload;
            return Observable.fromPromise(this.terrainService.getTerrain(provider, smdjs, mtljs, smdjsURL, quality, progress))
                .map(result => new GetTerrainSuccess(result))
                .catch((error) => Observable.of(new GetTerrainError({provider, error})))
        });
}