import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Dataset } from '../../../../models/dataset.model';
import { listenOn } from '../../../../util/listenOn';
import { Annotation } from '../../../../models/annotation.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TerrainProvider } from '../../../../models/terrainProvider.model';
import { TerrainProviderService } from '../../../../services/terrainprovider/terrain-provider.service';
import { Map } from 'immutable';
import { Map3dService } from '../../../../services/map-3d.service';

interface IAnnotationOption {
  annotation: Annotation;
  provider?: TerrainProvider;
  checked: boolean;
}

@Component({
  selector: 'app-dataset-annotations',
  templateUrl: './dataset-annotations.component.html',
  styleUrls: ['./dataset-annotations.component.css']
})
export class DatasetAnnotationsComponent implements OnInit, OnDestroy {
  @Input() dataset: Dataset;
  providers: Map<number, TerrainProvider>;
  private optionsSource = new BehaviorSubject<IAnnotationOption[]>([]);
  options$ = this.optionsSource.asObservable();
  off: Function;
  @ViewChild('annotationList', { read: ElementRef }) annotationList: ElementRef;
  constructor(private map3DService: Map3dService, private terrainProviderService: TerrainProviderService) { }

  ngOnInit() {
    this.terrainProviderService.providers.subscribe((providers) => {
      if (this.off) this.off();
      this.providers = providers;
      this.off = listenOn(this.dataset, 'change:annotations', () => {
        this.optionsSource.next(this.dataset.annotations()
          .filter(a => a.type() === 'annotation')
          .map((annotation) => ({ annotation, checked: false, provider: providers.get(this.dataset.id()) })));
      });
    });
  }

  ngOnDestroy() {
    if (this.off) this.off();
  }

  onChecked(option: IAnnotationOption) {
    console.log('checked', option);
    const provider = this.providers.get(this.dataset.id());
    if (!provider) { // retrevie provider
      this.map3DService.updateTerrainProviderFromAnnotations(this.dataset, this.dataset.annotations());
    }
  }

  toggle(show) {
    if (show) {
      $(this.annotationList.nativeElement).slideDown(300);
    } else {
      $(this.annotationList.nativeElement).slideUp(300);
    }
  }
}