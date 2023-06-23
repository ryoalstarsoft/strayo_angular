import { Component, OnInit, Input } from '@angular/core';

import { Site } from '../../models/site.model';
import { Dataset } from '../../models/dataset.model';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-dataset-details',
  templateUrl: './dataset-details.component.html',
  styleUrls: ['./dataset-details.component.css']
})
export class DatasetDetailsComponent implements OnInit {
  @Input() dataset: Dataset;
  @Input() site: Site;
  color: SafeStyle;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.color = this.sanitizer.bypassSecurityTrustStyle(`background: ${this.dataset.color()}`);
  }

}
