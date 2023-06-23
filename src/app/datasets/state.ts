import { Record, List, Map } from 'immutable';
import { uniqBy } from 'lodash';
import { Dataset } from '../models/dataset.model';
import { Annotation } from '../models/annotation.model';
import { Progress } from '../util/progress';
import { DatasetsActionsType } from './actions/actions';


const datasetRecord = Record({
    datasets: List([]),
    mainDataset: null,
    selectedDatasets: List([]),
    pending: Map({}),
    progress: null,
});

export class DatasetsState extends datasetRecord {
    annotations: Map<number, List<Annotation>>;
    datasets: List<Dataset>;
    mainDataset: Dataset;
    selectedDatasets: List<Dataset>;
    pending: Map<number, List<Progress>>;
    progress: Progress;

    public getAnnotations(payload: {dataset: Dataset, progress: Progress}): DatasetsState {
        const { dataset, progress } = payload;
        const progresses = this.pending.get(dataset.id()) || List();
        const newState = this.setIn(['pending', dataset.id()], progresses.push(progress)) as DatasetsState;
        return newState;
    }

    public getAnnotationsSuccess(payload: {dataset: Dataset, annotations: Annotation[]}): DatasetsState {
        const { dataset, annotations } = payload;
        const progresses = this.pending.get(dataset.id());
        const progress = progresses.find(p => p.stage() === DatasetsActionsType.GET_ANNOTATIONS && !p.isDone());
        dataset.annotations(annotations);
        dataset.updateFromAnnotations();
        progress.stage(DatasetsActionsType.GET_ANNOTATIONS_SUCCESS);
        progress.progress(annotations.length, annotations.length);
        // TODO: only do in production
        // return this.setIn(['pending', dataset.id()], progresses.filter(p => p !== progress)) as DatasetsState;
        return this;
    }

    public getAnnotationsError(payload: { dataset: Dataset, error: Error}) {
        const { dataset, error } = payload;
        const progresses = this.pending.get(dataset.id());
        const progress = progresses.find(p => p.stage() === DatasetsActionsType.GET_ANNOTATIONS && !p.isDone());
        progress.stage(DatasetsActionsType.GET_ANNOTATIONS_ERROR);
        progress.error(error);
        console.error(error);
        return this;
    }

    public setDatasets(datasets: Dataset[]): DatasetsState {
        return this.set('datasets', List(datasets)) as DatasetsState;
    }

    public setMainDataset(dataset: Dataset): DatasetsState {
        const exist = this.selectedDatasets.find(d => dataset === d);
        let state: DatasetsState = this;
        if (!exist) {
            state = state.setSelected(this.selectedDatasets.push(dataset).toArray());
        }
        return state.set('mainDataset', dataset) as DatasetsState;
    }

    public setSelected(datasets: Dataset[]): DatasetsState {
        return this.set('selectedDatasets', List(datasets)) as DatasetsState;
    }
}

export function getInitialState() {
    return new DatasetsState();
}