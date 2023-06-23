import { ActionReducer, Action } from '@ngrx/store';
import * as datasets from '../actions/actions';
import { DatasetsState, getInitialState } from '../state';

const INITIAL_STATE = getInitialState();

export function reducer(state: DatasetsState = INITIAL_STATE, action: datasets.DatasetsActions) {
    switch (action.type) {
        case datasets.DatasetsActionsType.GET_ANNOTATIONS:
            return state.getAnnotations(action.payload);
        case datasets.DatasetsActionsType.GET_ANNOTATIONS_SUCCESS:
            return state.getAnnotationsSuccess(action.payload);
        case datasets.DatasetsActionsType.GET_ANNOTATIONS_ERROR:
            return state.getAnnotationsError(action.payload);
        case datasets.DatasetsActionsType.SET_MAIN_DATASET:
            return state.setMainDataset(action.payload);
        case datasets.DatasetsActionsType.SET_SELECTED_DATASETS:
            return state.setSelected(action.payload);
        case datasets.DatasetsActionsType.SET_DATASETS:
            return state.setDatasets(action.payload);
        case datasets.DatasetsActionsType.RESET:
            return getInitialState();
    }
    return state;
}
