import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Site } from '../../models/site.model';
import { Dataset } from '../../models/dataset.model';
import { SitesService } from '../../sites/sites.service';
import { DatasetsService } from '../../datasets/datasets.service';

import { List } from 'immutable';

import { listenOn } from '../../util/listenOn';

import { Observable } from 'rxjs/Observable';
import { switchMap, map, share, distinctUntilChanged } from 'rxjs/operators';

type Panels = 'annotations' | 'shotplanning';

@Component({
  selector: 'app-dataset-layout',
  templateUrl: './dataset-layout.component.html',
  styleUrls: ['./dataset-layout.component.css']
})
export class DatasetLayoutComponent implements OnInit {
  site: Site;
  mainDataset: Dataset;
  datasets: List<Dataset>;

  site$: Observable<Site>;
  mainDataset$: Observable<Dataset>;
  datasets$: Observable<List<Dataset>>;

  sidepanel = 'shotplanning';
  constructor(private sitesService: SitesService, private datasetsService: DatasetsService, private route: ActivatedRoute) { }

  ngOnInit() {
    initStrayosJquery($);
    // Get the site
    this.route.params.pipe(
      switchMap((params) => {
        const site_id = +params.site_id;
        return this.sitesService.sites.pipe(
          map(sites => sites.find(site => site.id() === site_id)),
        );
      })
    ).subscribe((site) => {
      this.site = site;
      if (!site) return;
      console.log('SITE', site);
      this.sitesService.setMainSite(site);
      this.datasetsService.setDatasets(site.datasets());
    });
    // Setting main
    this.route.params.pipe(
      switchMap((params) => {
        const dataset_id = +params.dataset_id;
        return this.datasetsService.datasets.pipe(
          map(datasets => datasets.find(dataset => dataset.id() === dataset_id))
        );
      })
    ).subscribe((dataset) => {
      if (!dataset) {
        return;
      }
      this.datasetsService.setMainDataset(dataset);
    });

    // Getting datasets
    this.datasetsService.datasets.subscribe((datasets) => {
      this.datasets = datasets;
    });

    // Getting main
    this.datasetsService.mainDataset.subscribe(async (dataset) => {
      this.mainDataset = dataset;
      if (!dataset) return;
      const progress = await this.datasetsService.loadAnnotations(dataset);
      const off = listenOn(progress, 'change:progress', () => {
        off();
      });
    });
  }

  switchPanel(panel: Panels) {
    this.sidepanel = panel;
    initStrayosJquery($);
  }

}