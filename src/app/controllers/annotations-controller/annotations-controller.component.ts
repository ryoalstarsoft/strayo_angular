import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';
import { Dataset } from '../../models/dataset.model';
import { DatasetsService } from '../../datasets/datasets.service';

@Component({
  selector: 'app-annotations-controller',
  templateUrl: './annotations-controller.component.html',
  styleUrls: ['./annotations-controller.component.css']
})
export class AnnotationsControllerComponent implements OnInit {
  datasets$: Observable<List<Dataset>>;
  mainDataset$: Observable<Dataset>;
  constructor(private datasetsService: DatasetsService) { }

  ngOnInit() {
    this.mainDataset$ = this.datasetsService.mainDataset;
    this.datasets$ = this.datasetsService.selectedDatasets;
  }

}