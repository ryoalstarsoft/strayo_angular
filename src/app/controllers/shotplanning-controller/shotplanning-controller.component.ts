import { Component, OnInit, Input } from '@angular/core';
import * as ol from 'openlayers';
import { Map3dService } from '../../../../services/map-3d.service';
import { DatasetsService } from '../../../../datasets/datasets.service';
import { Dataset } from '../../../../models/dataset.model';
import { listenOn } from '../../../../util/listenOn';
import { debounce } from 'lodash';
import { IShotplan, Shotplan } from '../../../../models/shotplan.model';
import { IAnnotation, Annotation } from '../../../../models/annotation.model';

@Component({
  selector: 'app-shotplanning-tool',
  templateUrl: './shotplanning-tool.component.html',
  styleUrls: ['./shotplanning-tool.component.css']
})
export class ShotplanningToolComponent implements OnInit {
  @Input() dataset: Dataset;
  constructor(private map3DService: Map3dService, private datasetsService: DatasetsService) { }

  ngOnInit() {

  }

  startDraw() {
    const draw = this.map3DService.setGlobalDraw(new ol.interaction.Draw({
      type: 'LineString',
      maxPoints: 2,
    }));
    this.map3DService.addInteraction(draw);

    draw.once('drawstart', (evt) => {
      const tooltip = $(this.map3DService.toolTip.nativeElement);
      tooltip.html(`<span>Draw two points for the AB line</span>`);
    });


    draw.once('drawend', (event) => {
      this.map3DService.removeInteraction(draw);
      const tooltip = $(this.map3DService.toolTip.nativeElement);
      tooltip.html('');

      const iAnno = this.newIShotplan(event.feature);
      const newAnnotation = new Annotation(iAnno);
      this.dataset.annotations([...(this.dataset.annotations() || []), newAnnotation]);
    });
  }

  newIShotplan(feature: ol.Feature) {
    const row = feature.getGeometry() as ol.geom.LineString;
    const hole = new ol.geom.MultiPoint([row.getFirstCoordinate(), row.getFirstCoordinate()]);

    const meta = {};
    const newIShotplan: IAnnotation = {
      created_at: new Date(),
      updated_at: new Date(),
      id: 0,
      meta,
      data: new ol.Collection<ol.Feature>([new ol.Feature({
        geometry: new ol.geom.GeometryCollection([
          row,
          hole
        ])
      })]),
      resources: null,
      type: Shotplan.ANNOTATION_TYPE,
    };
    return newIShotplan;
  }

}