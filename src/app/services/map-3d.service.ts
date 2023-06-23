import { Injectable, ElementRef } from '@angular/core';

import * as ol from 'openlayers';

import { DatasetsService } from '../datasets/datasets.service';
import { TerrainProviderService } from './terrainprovider/terrain-provider.service';
import { memoize, uniqBy } from 'lodash';

import { environment } from '../../environments/environment';
import { Dataset } from '../models/dataset.model';
import { Site } from '../models/site.model';
import { SitesService } from '../sites/sites.service';
import { isNumeric } from 'rxjs/util/isNumeric';
import { List, Map } from 'immutable';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';
import { TerrainProvider } from '../models/terrainProvider.model';
import { Annotation } from '../models/annotation.model';
import { listenOn } from '../util/listenOn';

import { stopViewer } from '../util/getosgjsworking';
import { LonLat, WebMercator } from '../util/projections/index';
import { withStyles } from '../util/layerStyles';
import { featureToNode, transformMat4 } from '../util/osgjsUtil';

// using numbers now
// Use weakmap so we don't run into garbabe collection issues.
// memoize.Cache = (WeakMap as any);

// Map3d Service handles syncing of 2D and 3D views

let GlobalDraw: ol.interaction.Draw;

@Injectable()
export class Map3dService {

  map3DViewer: osgViewer.Viewer;
  sceneRoot: osg.Node;
  map2DViewer: ol.Map;

  sateliteLayer: ol.layer.Tile;
  osmLayer: ol.layer.Tile;
  emptyLayer: ol.layer.Tile;
  baseLayers: ol.layer.Group;

  mainSite: Site;
  mainDataset: Dataset;
  datasets: List<Dataset>;
  providers: Map<number, TerrainProvider>;

  toolTip: ElementRef;

  private _groupForDataset: (id: number) => ol.layer.Group;
  private allLayers = new ol.Collection<ol.layer.Group | ol.layer.Layer>();
  private allInteractions = new ol.Collection<ol.interaction.Interaction>();
  private view = new ol.View({ center: ol.proj.fromLonLat([0, 0]), zoom: 4 });

  constructor(private sitesService: SitesService,
    private datasetsService: DatasetsService, private terrainProviderService: TerrainProviderService) {
    this.sceneRoot = new osg.Node();
    // tslint:disable-next-line:max-line-length
    const mapboxEndpoint = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=${environment.mapbox_key}'`;
    this.sateliteLayer = new ol.layer.Tile({
      visible: true,
      source: new ol.source.XYZ({
        url: mapboxEndpoint,
      })
    });

    this.sateliteLayer.set('title', 'Satelite View');
    this.sateliteLayer.set('group', 'base');

    this.osmLayer = new ol.layer.Tile({
      visible: true,
      source: new ol.source.OSM(),
    });

    this.osmLayer.set('title', 'Street View');
    this.osmLayer.set('group', 'base');

    this.emptyLayer = new ol.layer.Tile({
      source: null,
    });

    this.emptyLayer.set('title', 'No Base Map');
    this.emptyLayer.set('group', 'base');

    this.baseLayers = new ol.layer.Group({
      layers: [
        this.osmLayer,
      ]
    }
    );
    this.baseLayers.set('title', 'Base Layers');

    this.addLayer(this.baseLayers);

    // Get sites
    this.sitesService.mainSite.subscribe((mainSite) => {
      this.mainSite = mainSite;
    });
    // Get datasets
    this.datasetsService.selectedDatasets.subscribe((datasets) => {
      this.datasets = datasets;
      this.terrainProviderService.makeProvidersForDatasets(datasets.toJS());
      this.datasets.forEach((dataset) => {
        const group = this.getGroupForDataset(dataset.id());
        group.set('title', dataset.name());
        this.addLayer(group);
      });
    });
    // Get terrain providers
    let unsubProviders = [];
    this.terrainProviderService.providers.subscribe((providers) => {
      this.providers = providers;
      if (!providers) return;
      unsubProviders.forEach(off => off());
      unsubProviders = [];
      this.providers.forEach((provider) => {
        this.sceneRoot.addChild(provider.rootNode());
        unsubProviders.push(listenOn(provider, 'change:model_node', (thing1, thing2, thing3) => {
          this.sceneRoot.addChild(provider.rootNode());
        }));
      });
    });

    // Get main Dataset
    this.datasetsService.mainDataset.subscribe(async (mainDataset) => {
      this.mainDataset = mainDataset;
      if (!mainDataset) return;

      const fetchAnnotationsForMainDataset = () => {
        this.updateTerrainProviderFromAnnotations(this.mainDataset, this.mainDataset.annotations());
      };

      if (mainDataset.annotations()) {
        fetchAnnotationsForMainDataset();
      } else {
        const progress = await this.datasetsService.loadAnnotations(mainDataset);
        if (progress.isDone()) {
          console.log('already done');
        } else {
          const off = listenOn(progress, 'change:progress', () => {
            if (progress.isDone()) {
              fetchAnnotationsForMainDataset();
              off();
            }
          });
        }
      }
      // Set view
      const extent = await new Promise<ol.Extent>((resolve) => {
        if (mainDataset.mapData()) {
          return resolve(mainDataset.calcExtent());
        }
        mainDataset.once('change:map_data', () => {
          resolve(mainDataset.calcExtent());
        });
      });
      this.setExtent(extent);
      // set Orthophoto
      const orthophotoAnnotation = await new Promise<Annotation>((resolve) => {
        if (mainDataset.annotations()) {
          return resolve(mainDataset.annotations().find(a => a.type() === 'orthophoto'));
        }
        mainDataset.once('change:annotations', () => {
          resolve(mainDataset.annotations().find(a => a.type() === 'orthophoto'));
        });
      });
      if (!orthophotoAnnotation) {
        console.warn('No Orthophoto Annotation Found');
        return;
      }
      const orthophotoResource = orthophotoAnnotation.resources().find(r => r.type() === 'tiles');
      if (!orthophotoResource) {
        console.warn('No Tiles Resource Found');
        return;
      }
      const orthophotoLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
          projection: WebMercator,
          url: orthophotoResource.url()
        })
      });
      orthophotoLayer.set('title', 'Orthophoto');
      orthophotoLayer.set('group', 'visualization');
      orthophotoLayer.setVisible(true);
      this.registerLayer(orthophotoLayer, mainDataset);
    });
  }

  addInteraction(interaction: ol.interaction.Interaction) {
    const exist = this.allInteractions.getArray().includes(interaction);
    if (exist) {
      console.warn('attempting to add the same interaction twice');
      return;
    }
    this.allInteractions.push(interaction);
  }

  addLayer(layer: ol.layer.Group | ol.layer.Layer) {
    const title = layer.get('title');
    if (!title) {
      console.warn('warning layer has no title');
    }
    const layers = uniqBy([...this.allLayers.getArray(), layer], (l) => l.get('title'));
    this.allLayers.clear();
    this.allLayers.extend(layers);
  }

  deregisterLayer(layer: ol.layer.Tile | ol.layer.Vector, dataset: Dataset) {
    const group = this.getGroupForDataset(dataset.id());
    group.getLayers().remove(layer);
  }

  destroy() {
    this.destroyOpenlayers();
    this.destroyOsgjs();
  }

  destroyOpenlayers() {
    if (this.map2DViewer) {
      this.map2DViewer.setTarget(null);
      this.map2DViewer = null;
    }
  }

  destroyOsgjs() {
    if (this.map3DViewer) {
      stopViewer(this.map3DViewer);
      this.map3DViewer = null;
    }
  }

  public getGroupForDataset(dataset: Dataset | number): ol.layer.Group {
    if (!this._groupForDataset) {
      this._groupForDataset = memoize((id: number) => {
        return new ol.layer.Group({
          layers: new ol.Collection([]),
        });
      });
    }
    if (isNumeric(dataset)) {
      return this._groupForDataset(dataset);
    }
    return this._groupForDataset(dataset.id());
  }

  public setGlobalDraw(draw: ol.interaction.Draw): ol.interaction.Draw {
    if (GlobalDraw) {
      this.removeInteraction(GlobalDraw);
    }
    GlobalDraw = draw;
    return GlobalDraw;
  }

  initOpenlayers(container: HTMLElement) {
    // this.destroyOpenlayers();
    this.map2DViewer = this.map2DViewer || new ol.Map({
      target: container,
      interactions: this.allInteractions,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      layers: this.allLayers,
      view: this.view,
      controls: ol.control.defaults({ attribution: false })
    });
  }

  initOsgjs(container: HTMLElement) {
    // this.destroyOsgjs();
    if (this.map3DViewer) return;
    container.addEventListener('webglcontextlost', (event) => {
      console.log('context lost', event);
    });
    this.map3DViewer = new osgViewer.Viewer(container);
    this.map3DViewer.init();
    this.map3DViewer.setSceneData(this.sceneRoot);
    this.map3DViewer.setupManipulator();
    this.map3DViewer.run();
    this.map3DViewer.getManipulator().computeHomePosition();
  }

  registerLayer(layer: (ol.layer.Tile | ol.layer.Vector), dataset: Dataset) {
    const title = layer.get('title');
    if (!title) {
      console.warn('warning layer has no title');
    }
    if (layer instanceof ol.layer.Vector) {
      const style = layer.getStyle();
      if (style) {
        layer.setStyle(withStyles(style, dataset.overwriteStyle()));
      } else {
        layer.setStyle(dataset.overwriteStyle());
      }
    }
    const group = this.getGroupForDataset(dataset.id());
    const exist = group.getLayers().getArray().includes(layer);
    if (exist) {
      console.warn('attempting to add a layer twice');
      return;
    }
    group.getLayers().push(layer);
  }

  registerNode(node: osg.Node | osg.MatrixTransform, dataset: Dataset) {
    const provider = this.providers.get(dataset.id());
    provider.rootNode().addChild(node);
    if (this.map3DViewer) this.map3DViewer.getManipulator().computeHomePosition();
  }

  removeInteraction(interaction: ol.interaction.Interaction) {
    this.allInteractions.remove(interaction);
  }

  private _setView(coord?) {
    if (!coord) {
      if (this.map3DViewer) {
        this.map3DViewer.getManipulator().computeHomePosition();
      }
      return;
    }
    if (this.map2DViewer) {
      this.view.setCenter(coord);
    }
    if (this.map3DViewer) {
      this.map3DViewer.getManipulator().computeHomePosition();
    }
  }

  setView(coord?) {
    if (coord) {
      this._setView(coord);
    } else {
      if (this.datasets) {
        const coords = this.datasets
          .filter(d => !d.isPhantom())
          .map(d => ol.proj.fromLonLat([d.long(), d.lat()]))
          .toJS();
        const bounds = ol.extent.boundingExtent(coords);
        console.log('bounds', bounds);
        if (!bounds.some(n => !isFinite(n))) {
          this.setExtent(bounds);
        }
      } else {
        this._setView();
      }
    }
  }

  setExtent(extent: ol.Extent) {
    if (this.map2DViewer) {
      this.view.fit(extent);
    }
    if (this.map3DViewer) {
      this.map3DViewer.getManipulator().computeHomePosition();
    }
  }

  async updateTerrainProviderFromAnnotations(dataset: Dataset, annotations: Annotation[]) {
    const stereoscopeAnno = annotations.find(anno => anno.type() === 'stereoscope');
    if (!stereoscopeAnno) {
      console.warn('No stereoscope annotation found');
      return;
    }
    console.log('stereoscopeAnno', stereoscopeAnno.getProperties());
    const mtljsResource = stereoscopeAnno.resources().find(r => r.type() === 'mtljs');
    const smdjsResource = stereoscopeAnno.resources().find(r => r.type() === 'smdjs');
    if (!(mtljsResource && smdjsResource)) {
      console.warn('No mtljs/smdjs resources found');
      return;
    }
    let mtljs;
    let smdjs;
    try {
      [
        mtljs,
        smdjs
      ] = await Promise.all([
        fetch(mtljsResource.url()).then(r => r.json()),
        fetch(smdjsResource.url()).then(r => r.json()),
      ]);
    } catch (e) {
      console.error(e);
      return;
    }

    const provider = this.providers.get(dataset.id());
    const progress = this.terrainProviderService.loadTerrain(provider, smdjs, mtljs, smdjsResource.url(), 3);
  }
}