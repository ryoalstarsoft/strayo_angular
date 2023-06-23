import { TerrainProviderActions, TerrainProviderActionsType as types } from '../actions/actions';
import { TerrainProviderState, getInitialState } from '../state';

const INITIAL_STATE = getInitialState();

export function reducer(state: TerrainProviderState = INITIAL_STATE, action: TerrainProviderActions): TerrainProviderState {
    switch (action.type) {
        case types.RESET:
            return getInitialState();
        case types.ADD_TERRAIN_PROVIDER:
            return state.addTerrainProvider(action.payload);
        case types.GET_TERRAIN:
            return state.getTerrain(action.payload);
        case types.GET_TERRAIN_SUCCESS:
            return state.getTerrainSuccess(action.payload);
        case types.GET_TERRAIN_ERROR:
            return state.getTerrainError(action.payload);
    }
    return state;
}