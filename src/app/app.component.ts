import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';

import { List } from 'immutable';

import { Site } from './models/site.model';
import { SitesState } from './sites/state';
import { SitesService } from './sites/sites.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { DatasetsService } from './datasets/datasets.service';

import { initOSGJS } from './util/getosgjsworking';
import { loadProjections } from './util/projections';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'app';
  sites$: Observable<List<Site>>;

  constructor (
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private sitesService: SitesService,
    private datasetsService: DatasetsService,
  ) {}

  ngOnInit() {
    initOSGJS();
    OSG.globalify();
    loadProjections();

    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      })
      .filter(route => route.outlet === 'primary')
      .mergeMap(route => route.data)
      .subscribe((event) => this.titleService.setTitle(event['title']));

    this.sitesService.loadSites();
  }
}