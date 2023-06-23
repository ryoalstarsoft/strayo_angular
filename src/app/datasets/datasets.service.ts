import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import * as d3 from 'd3';

import { tap, map, first, share, take, debounceTime } from 'rxjs/operators';
import { isNumeric } from 'rxjs/util/isNumeric';

import { DatasetsState } from './state';

import { Dataset } from '../models/dataset.model';

import * as fromRoot from '../reducers';
import { SetDatasets, SetMainDataset, GetAnnotations, DatasetsActionsType } from './actions/actions';
import { IAnnotation, Annotation } from '../models/annotation.model';
import { List, Map } from 'immutable';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { memoize } from 'lodash';
import { Resource } from '../models/resource.model';
import { Progress } from '../util/progress';

const allAnnotationsQuery = gql`
  query AnnotationsForDataset($datasetID: ID!) {
    dataset(id: $datasetID) {
      annotations {
        id,
        data,
        is_phantom,
        meta,
        type,
        resources {
          id,
          type,
          status,
          url
        }
      }
    }
  }
`;

@Injectable()
export class DatasetsService {
  private datasetsSource = new BehaviorSubject<List<Dataset>>(List([]));
  datasets = this.datasetsSource.asObservable().pipe(distinctUntilChanged());

  private selectedDatasetsSource = new BehaviorSubject<List<Dataset>>(List([]));
  selectedDatasets = this.selectedDatasetsSource.asObservable().pipe(distinctUntilChanged());

  private mainDatasetSource = new BehaviorSubject<Dataset>(null);
  mainDataset = this.mainDatasetSource.asObservable().pipe(distinctUntilChanged());

  private annotationsSource = new BehaviorSubject<Map<number, List<Annotation>>>(Map());
  annotations = this.annotationsSource.asObservable().pipe(distinctUntilChanged());

  private pendingSource = new BehaviorSubject<Map<number, List<Progress>>>(Map());
  pending = this.pendingSource.asObservable().pipe(distinctUntilChanged());

  constructor(private store: Store<fromRoot.State>, private apollo: Apollo) {
    this.getState$().subscribe((state) => {
      if (!state) return;
      this.datasetsSource.next(state.datasets);
      this.mainDatasetSource.next(state.mainDataset);
      this.annotationsSource.next(state.annotations);
      this.pendingSource.next(state.pending);
      this.selectedDatasetsSource.next(state.selectedDatasets);
    });
  }

  public getState$() {
    return this.store.select('datasets');
  }

  public setDatasets(datasets: Dataset[]) {
    const colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    datasets.forEach((set, i) => set.color(colorScale(i as any)));
    this.store.dispatch(new SetDatasets(datasets));
  }

  public setMainDataset(dataset: Dataset) {
    this.store.dispatch(new SetMainDataset(dataset));
  }

  public async loadAnnotations(dataset: Dataset): Promise<Progress> {
    const pending = await this.pending.pipe(debounceTime(0), take(1)).toPromise();
    const createAndDispatch = () => {
      const p = new Progress({
        stage: DatasetsActionsType.GET_ANNOTATIONS,
        details: `Getting all annotations for dataset: ${dataset.name() || dataset.id()}`,
        index: 0,
        length: 1,
      });
      this.store.dispatch(new GetAnnotations({ dataset, progress: p }));
      return p;
    };
    const progresses = pending.get(dataset.id());
    if (!progresses) return createAndDispatch();
    const progress = progresses.find(p => p.stage() === DatasetsActionsType.GET_ANNOTATIONS && !p.isDone());
    if (!progress) return createAndDispatch();
    return progress;
  }

  // Called by effect
  public getAnnotations(dataset: Dataset): Observable<Annotation[]> {
    return this.apollo.watchQuery<{
        dataset: {
          annotations: IAnnotation[]
        }
      }>({
      query: allAnnotationsQuery,
      variables: { datasetID: dataset.id() }
    })
    .valueChanges
    .pipe(
      map(({ data }) => {
        return data.dataset.annotations.map((datum) => {
          const anno = new Annotation(datum);
          // Update from string
          anno.updateFromInterface();

          const resources: any[] = anno.resources() || [];
          anno.resources(resources.map(r => {
            const resource = new Resource(r);
            // update from string
            resource.id(resource.id());
            resource.createdAt(resource.createdAt());
            resource.updatedAt(resource.updatedAt());
            return resource;
          }));
          return anno;
        });
      })
    );
  }
}