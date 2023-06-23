import { Component, OnInit, ViewChild, ElementRef, Input, NgZone, OnDestroy, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatasetsService } from '../../datasets/datasets.service';
import { TerrainProviderService } from '../../services/terrainprovider/terrain-provider.service';
import { Dataset } from '../../models/dataset.model';
import { Annotation } from '../../models/annotation.model';

import { switchMap, map } from 'rxjs/operators';
import { Map } from 'immutable';
import { TerrainProvider } from '../../models/terrainProvider.model';
import { Map3dService } from '../../services/map-3d.service';

@Component({
  selector: 'app-map-3d',
  templateUrl: './map-3d.component.html',
  styleUrls: ['./map-3d.component.css']
})
export class Map3dComponent implements OnInit, OnDestroy {
  @ViewChild('openlayers', { read: ElementRef }) map2D: ElementRef;
  @ViewChild('osgjs', { read: ElementRef }) map3D: ElementRef;
  @ViewChild('three', { read: ElementRef }) three: ElementRef;
  @ViewChild('tooltip', { read: ElementRef }) tooltip: ElementRef;
  @Input() show = 'map2D';
  viewer: string;

  constructor(private http: HttpClient, private map3DService: Map3dService) { }

  ngOnInit() {
    this.changeView('openlayers');
    this.map3DService.toolTip = this.tooltip;
  }

  @HostListener('mousemove', ['$event']) onmousemove(event) {
    const tooltip = this.map3DService.toolTip;
    if (!tooltip) return;
    $(tooltip.nativeElement).offset({
      left: event.clientX + 15,
      top: event.clientY + 15
    });
  }

  changeView(viewer: string) {
    if (this.viewer === viewer) return;
    this.viewer = viewer;
    this.map3DService.destroy();
    setTimeout(() => {
      switch (this.viewer) {
        case 'openlayers':
          this.map3DService.initOpenlayers(this.map2D.nativeElement);
          break;
        case 'osgjs':
          this.map3DService.initOsgjs(this.map3D.nativeElement);
      }
    }, 100);
  }

  ngOnDestroy() {
    this.map3DService.destroyOpenlayers();
    this.map3DService.destroyOsgjs();
  }
}