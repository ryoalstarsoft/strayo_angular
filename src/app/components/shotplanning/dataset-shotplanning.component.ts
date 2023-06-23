import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as ol from 'openlayers';
import { filter, first } from 'rxjs/operators';

import { Shotplan, IShotplan } from '../../../../models/shotplan.model';
import { Dataset } from '../../../../models/dataset.model';
import { listenOn } from '../../../../util/listenOn';
import { subscribeOn } from '../../../../util/subscribeOn';
import { TerrainProvider } from '../../../../models/terrainProvider.model';
import { TerrainProviderService } from '../../../../services/terrainprovider/terrain-provider.service';
import { IAnnotation } from '../../../../models/annotation.model';
import { Map3dService } from '../../../../services/map-3d.service';
import { shotplanStyle } from '../../../../util/layerStyles';

@Component({
  selector: 'app-dataset-shotplanning',
  templateUrl: './dataset-shotplanning.component.html',
  styleUrls: ['./dataset-shotplanning.component.css']
})
export class DatasetShotplanningComponent implements OnInit, OnDestroy {
  @Input() dataset: Dataset;
  provider: TerrainProvider;
  shotplan: Shotplan;
  shotplanLayer: ol.layer.Vector;
  off: Function[] = [];

  selectedRow = -1;
  selectedHole = -1;
  constructor(private map3dService: Map3dService, private terrainProviderService: TerrainProviderService) {}

  ngOnInit() {
    const sub = this.terrainProviderService.providers.pipe(
      filter(providers => !!providers.get(this.dataset.id())),
      first()
    ).subscribe(async (providers) => {
      this.provider = providers.get(this.dataset.id());
      const shotplanAnnotation = await this.dataset.waitForAnnotations(Shotplan.ANNOTATION_TYPE);
      console.log('found a shotplan');
      const iShotplan: IShotplan = {
        ...(shotplanAnnotation[0].getProperties() as IAnnotation),
        terrain_provider: this.provider,
      };
      this.shotplan = new Shotplan(iShotplan);
      this.shotplan.updateFromInterface();
      if (this.shotplanLayer) {
        this.map3dService.deregisterLayer(this.shotplanLayer, this.dataset);
      }
      this.shotplanLayer = this.makeLayerFromShotplan(this.shotplan);
      this.map3dService.registerLayer(this.shotplanLayer, this.dataset);
    });

    this.off.push(subscribeOn(sub));
  }

  makeLayerFromShotplan(shotplan: Shotplan) {
    const makeSource = () => {
      return new ol.source.Vector({
        features: shotplan.data(),
      });
    };

    const layer = new ol.layer.Vector({
      source: makeSource(),
      style: shotplanStyle,
    });
    layer.set('title', 'Shotplan');
    this.off.push(listenOn(shotplan, 'change:data', () => {
      layer.setSource(makeSource());
    }));

    console.log('style ', shotplanStyle);

    return layer;
  }

  selectRow(row: number) {
    if (this.selectedRow === row) {
      this.selectedRow = -1;
    } else {
      this.selectedRow = row;
    }
  }

  selectHole(hole: number) {
    if (this.selectedHole === hole) {
      this.selectedHole = -1;
    } else {
      this.selectedHole = hole;
    }
  }

  ngOnDestroy() {
    this.off.forEach(off => {
      off();
    })
  }

}