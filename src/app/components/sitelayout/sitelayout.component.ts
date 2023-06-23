import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { List } from 'immutable';

import { Observable } from 'rxjs/Observable';
import { switchMap, map, tap, share, filter } from 'rxjs/operators';

import { SitesService } from '../../sites/sites.service';
import { DatasetsService } from '../../datasets/datasets.service';

import { Site } from '../../models/site.model';
import { Dataset } from '../../models/dataset.model';

@Component({
  selector: 'app-sitelayout',
  templateUrl: './sitelayout.component.html',
  styleUrls: ['./sitelayout.component.css'],
})
export class SiteLayoutComponent implements OnInit {
  site$: Observable<Site>;
  constructor(private ref: ApplicationRef,
    private sitesService: SitesService, private datasetsService: DatasetsService, private route: ActivatedRoute) {}

  ngOnInit() {
    initStrayosJquery($);
    this.site$ = this.route.params.pipe(
      switchMap((params) => {
        const id = +params.id;
        return this.sitesService.sites.pipe(
          tap((site) => console.log('got site', site.toJS())),
          filter((sites) => !!sites.find(site => site.id() === id)),
          map((sites) => sites.find(site => site.id() === id)),
        );
      })
    );
  }
}