import { Action } from '@ngrx/store';

import { Site } from '../../models/site.model';
import { Progress } from '../../util/progress';

export enum SitesActionsType {
    GET_SITES = '[Site] Get',
    GET_SITES_SUCCESS = '[Site] Get Success',
    GET_SITES_ERROR = '[Site] Get Error',
    SET_MAIN_SITE = '[Site] Set Main',
    SET_SITES = '[Site] Set',
    RESET = '[Site] Reset',
}

export class GetSites implements Action {
    type = SitesActionsType.GET_SITES;
    constructor(public payload: Progress) {}
}

export class GetSitesSuccess implements Action {
    type = SitesActionsType.GET_SITES_SUCCESS;
    constructor(public payload: Site[]) {}
}

export class GetSitesError implements Action {
    type = SitesActionsType.GET_SITES_ERROR;
    constructor(public payload: Error) {}
}

export class SetMainSite implements Action {
    type = SitesActionsType.SET_MAIN_SITE;
    constructor(public payload: Site) {}
}

export class SetSites implements Action {
    type = SitesActionsType.SET_SITES;

    constructor(public payload: Site[]) {}
}

export class ResetState implements Action {
    type = SitesActionsType.RESET;
    constructor(public payload) {}
}

export type SitesActions = GetSites
| GetSitesSuccess
| GetSitesError
| SetMainSite
| SetSites
| ResetState;