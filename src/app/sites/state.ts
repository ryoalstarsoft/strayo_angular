import { Map, Record, List } from 'immutable';
import { Site } from '../models/site.model';
import { Progress } from '../util/progress';

const siteRecord = Record({
    sites: List([]),
    mainSite: null,
    pending: Map({}),
    progress: null,
});

export class SitesState extends siteRecord {
    sites: List<Site>;
    mainSite: Site;
    pending: Map<number, Progress>;
    progress: Progress;

    public getSites(progress: Progress): SitesState {
        return this.set('progress', progress) as SitesState;
    }

    public getSitesError(error: Error): SitesState {
        const progress = this.get('progress') as Progress;
        progress.error(error);
        return this;
    }

    public getSitesSuccess(sites: Site[]): SitesState {
        return this.set('progress', null).set('sites', List(sites)) as SitesState;
    }

    public setMainSite(site: Site): SitesState {
        return this.set('mainSite', Site) as SitesState;
    }

    public setSites(sites: Site[]): SitesState {
        return this.set('sites', List(sites)) as SitesState;
    }
}

export function getInitialState() {
    return new SitesState();
}