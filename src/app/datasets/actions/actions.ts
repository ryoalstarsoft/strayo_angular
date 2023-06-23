import { Action } from '@ngrx/store';

import { Dataset } from '../../models/dataset.model';
import { Annotation } from '../../models/annotation.model';
import { Progress } from '../../util/progress';

export enum DatasetsActionsType {
    GET_ANNOTATIONS = '[Dataset] Get Annotations',
    GET_ANNOTATIONS_SUCCESS = '[Site] Get Annotations Success',
    GET_ANNOTATIONS_ERROR = '[Site] Get Annotations Error',
    SET_DATASETS = '[Dataset] Set datasets',
    SET_MAIN_DATASET = '[Dataset] Set main dataset',
    SET_SELECTED_DATASETS = '[Dataset] Set selected datasets',
    RESET = '[Dataset] Reset',
}

export class GetAnnotations implements Action {
    type = DatasetsActionsType.GET_ANNOTATIONS;
    constructor(public payload: {dataset: Dataset, progress: Progress}) {}
}

export class GetAnnotationsSuccess implements Action {
    type = DatasetsActionsType.GET_ANNOTATIONS_SUCCESS;
    constructor(public payload: { dataset: Dataset, annotations: Annotation[]}) {}
}

export class GetAnnotationsError implements Action {
    type = DatasetsActionsType.GET_ANNOTATIONS_ERROR;
    constructor(public payload: { dataset: Dataset, error: Error}) {}
}

export class SetDatasets implements Action {
    type = DatasetsActionsType.SET_DATASETS;
    constructor(public payload: Dataset[]) {}
}

export class SetMainDataset implements Action {
    type = DatasetsActionsType.SET_MAIN_DATASET;
    constructor(public payload: Dataset) {}
}

export class SetSelectedDatasets implements Action {
    type = DatasetsActionsType.SET_SELECTED_DATASETS;
    constructor(public payload: Dataset[]) {}
}

export class ResetState implements Action {
    type = DatasetsActionsType.RESET;
    constructor(public payload) {}
}

export type DatasetsActions = ResetState
| GetAnnotations
| GetAnnotationsSuccess
| GetAnnotationsError
| SetDatasets;