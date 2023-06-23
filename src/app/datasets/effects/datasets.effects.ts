import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { DatasetsService } from '../datasets.service';
import { DatasetsActionsType, GetAnnotations, GetAnnotationsSuccess, GetAnnotationsError } from '../actions/actions';

@Injectable()
export class DatasetsEffects {
    constructor(private actions$: Actions, private datasetsService: DatasetsService) {}

    @Effect() getAnnotations$ = this.actions$.ofType(DatasetsActionsType.GET_ANNOTATIONS)
        .map((action: GetAnnotations) => action.payload)
        .mergeMap(({dataset, progress}) => {
            return this.datasetsService.getAnnotations(dataset)
                .map(annotations => new GetAnnotationsSuccess({dataset, annotations}))
                .catch(error => Observable.of(new GetAnnotationsError({ dataset, error })));
        });
}