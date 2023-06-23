import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as ol from 'openlayers';
import * as us from 'us';

import { SitesService } from '../../sites/sites.service';

import { countryStyle, stateStyle, siteMarkerStyle } from '../../util/layerStyles';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.css']
})
export class SitemapComponent implements OnInit {
  map: ol.Map;
  @ViewChild('map', { read: ElementRef }) mapElement: ElementRef;
  @ViewChild('popover', { read: ElementRef }) popoverElement: ElementRef;
  popover: ol.Overlay;
  markers: ol.Collection<ol.Feature>;
  hoverInteraction: ol.interaction.Select;
  selectInteraction: ol.interaction.Select;
  constructor(private sitesService: SitesService, private router: Router) {
  }

  ngOnInit() {
    const styleFunc = (feature) => {
      countryStyle.getText().setText(feature.get('name'));
      return countryStyle;
    };
    const countryLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: '/assets/world-geojson/countries.geo.json',
        format: new ol.format.GeoJSON()
      }),
      style: styleFunc,
    });

    const stateLayers = us.STATES.map((state) => {
      return new ol.layer.Vector({
        source: new ol.source.Vector({
          url: `/assets/world-geojson/countries/USA/${state.abbr}.geo.json`,
          format: new ol.format.GeoJSON()
        }),
        style: stateStyle,
      });
    });

    this.markers = new ol.Collection<ol.Feature>([]);

    const markerLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: this.markers,
      }),
      style: siteMarkerStyle
    });

    this.hoverInteraction = new ol.interaction.Select({
      condition: ol.events.condition.pointerMove,
      layers: [markerLayer],
    });

    this.selectInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click,
      layers: [markerLayer],
    });

    // create popover
    this.popover = new ol.Overlay({
      positioning: 'center-center',
      element: this.popoverElement.nativeElement,
    });

    this.map = new ol.Map({
      layers: [
        countryLayer,
        ...stateLayers,
        markerLayer
      ],
      controls: [],
      target: this.mapElement.nativeElement,
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4,
      })
    });

    this.map.addInteraction(this.hoverInteraction);
    this.map.addInteraction(this.selectInteraction);
    this.map.addOverlay(this.popover);

    this.hoverInteraction.on('select', (event) => {
      const features = event.selected;
      const element = this.popover.getElement();
      if (!features.length) {
        ($(element) as any).popover('destroy');
        return;
      }
      const feature = features[0];
      const site = feature.get('site');
      const circle = ((feature as ol.Feature).getGeometry() as ol.geom.Circle);
      const coordinate = circle.getCenter();
      this.popover.setPosition([coordinate[0], coordinate[1] - (2 * circle.getRadius())]);
      ($(element) as any).popover({
        'placement': 'bottom',
        'animation': 'false',
        'html': true,
        'template': '<div class="bxTooltip"><div class="popover-content"></div></div>',
        'content': `<h6>${site.name()}</h6><p>${site.location()}</p>`
      });
      ($(element) as any).popover('show');
    });

    this.selectInteraction.on('select', (event) => {
      if (!event.selected.length) return;
      const site = event.selected[0].get('site');
      this.router.navigate([`sites/${site.id()}`]);
    });


    // Subscribe to changes
    this.sitesService.sites.subscribe(
      (sites) => {
        this.markers.clear();
        this.markers.extend(sites.map((site) => {
          const dataset = site.getPhantomDataset();
          return new ol.Feature({
            geometry: new ol.geom.Circle(ol.proj.fromLonLat([dataset.long(), dataset.lat()]), 50000),
            name: site.name,
            site,
          });
        }).toJS());
        // Update view
        const points = this.markers.getArray().map(f => (f.getGeometry() as ol.geom.Circle).getCenter());
        if (points.length > 0) {
          if (points.length > 1) {
            const extent = ol.extent.boundingExtent(points);
            this.map.getView().setCenter(ol.extent.getCenter(extent));
          } else {
            this.map.getView().setCenter(points[0]);
          }
        }
        console.log('points', points);
      }
    );
  }

}