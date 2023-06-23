import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { SitesActionsType, GetSitesSuccess, GetSitesError, GetSites } from '../actions/actions';
import { SitesService } from '../sites.service';

@Injectable()
export class SitesEffects {
    constructor(private actions$: Actions, private sitesService: SitesService) {}

    @Effect() getSites$ = this.actions$.ofType(SitesActionsType.GET_SITES)
        .map((action: GetSites) => action.payload)
        .mergeMap(progress => {
            return this.sitesService.getSites()
                .map(sites => {
                    return new GetSitesSuccess(sites);
                })
                .catch((error) => Observable.of(new GetSitesError(error)));
        });
}