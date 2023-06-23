import { ActionReducer, Action } from '@ngrx/store';
import * as sites from '../actions/actions';
import { SitesState, getInitialState } from '../state';

const INITIAL_STATE = getInitialState();

export const reducer = (state: SitesState = INITIAL_STATE, action: sites.SitesActions) => {
  switch (action.type) {
    case sites.SitesActionsType.GET_SITES:
      return state.getSites(action.payload);
    case sites.SitesActionsType.GET_SITES_SUCCESS:
      return state.getSitesSuccess(action.payload);
    case sites.SitesActionsType.GET_SITES_ERROR:
      return state.getSitesError(action.payload);
    case sites.SitesActionsType.SET_MAIN_SITE:
      return state.setMainSite(action.payload);
    case sites.SitesActionsType.SET_SITES:
      return state.setSites(action.payload);
    case sites.SitesActionsType.RESET:
      return getInitialState();
  }

  return state;
};