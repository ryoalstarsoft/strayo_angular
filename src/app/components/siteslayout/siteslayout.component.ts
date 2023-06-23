import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { SitesService } from '../../sites/sites.service';
import { Site } from '../../models/site.model';

import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-siteslayout',
  templateUrl: './siteslayout.component.html',
  styleUrls: ['./siteslayout.component.css'],
})
export class SiteslayoutComponent implements OnInit {

  sites$: Observable<List<Site>>;
  searchedSites$: Observable<List<Site>>;
  searchValue$ = new BehaviorSubject<string>('');

  constructor(private sitesService: SitesService, private ref: ChangeDetectorRef) {
    this.sites$ = this.sitesService.sites;
    this.searchedSites$ = this.sites$.switchMap((sites) => {
      return this.searchValue$.map((value) => {
        if (!value) return sites;
        return sites.filter(site => site.name().toLowerCase().includes(value.toLowerCase())).toList();
      });
    });
  }

  ngOnInit() {
    initStrayosJquery($);
  }
  onSearch(value: string) {
    this.searchValue$.next(value);
  }
  // TODO Implement
  onShareSearch(value: string) {
  }

}