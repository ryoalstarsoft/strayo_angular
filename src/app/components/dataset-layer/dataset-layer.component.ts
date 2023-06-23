import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as ol from 'openlayers';
import { Dataset } from '../../../../models/dataset.model';
import { WebMercator } from '../../../../util/projections/index';
import { Map3dService } from '../../../../services/map-3d.service';
import { listenOn } from '../../../../util/listenOn';
import { Annotation } from '../../../../models/annotation.model';

@Component({
  selector: 'app-dataset-layer',
  templateUrl: './dataset-layer.component.html',
  styleUrls: ['./dataset-layer.component.css']
})
export class DatasetLayerComponent implements OnInit, OnDestroy {
  @Input() dataset: Dataset;
  orthophotoLayer: ol.layer.Tile;
  orthophotoVisible = true;
  setOrthophotoVisible: (visible: boolean) => void;

  unsubscribe: Function[] = [];
  constructor(private map3DService: Map3dService) {
  }

  async ngOnInit() {

  }

  ngOnDestroy() {
    this.unsubscribe.forEach(off => off());
  }

}