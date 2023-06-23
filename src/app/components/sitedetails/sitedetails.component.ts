import { Component, OnInit, Input } from '@angular/core';

import { Site } from '../../models/site.model';
import { Status } from '../../util/status';

@Component({
  selector: 'app-sitedetails',
  templateUrl: './sitedetails.component.html',
  styleUrls: ['./sitedetails.component.css']
})
export class SitedetailsComponent implements OnInit {
  @Input() site: Site;
  status: Status;
  constructor() { }

  ngOnInit() {
    this.status =
      (this.site.datasets().every(d => d.status() === Status.COMPLETED) && Status.COMPLETED)
      || (this.site.datasets().some(d => d.status() === Status.FAILED) && Status.FAILED)
      || Status.PROCESSING;
  }

}