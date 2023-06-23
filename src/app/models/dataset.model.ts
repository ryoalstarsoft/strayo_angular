import * as ol from 'openlayers';
import * as moment from 'moment';
import proj4 from 'proj4';
import { Annotation, IAnnotation } from './annotation.model';
import { MapData } from './mapdata.model';
import { LonLat, WebMercator } from '../util/projections/index';
import { listenOn } from '../util/listenOn';


export interface IDataset {
    annotations: IAnnotation[];
    created_at: Date | string;
    id: number;
    is_phantom: boolean;
    lat: number;
    long: number;
    name: string;
    status: string;
    updated_at: string;
}

export class Dataset extends ol.Object {
    public annotations(): Annotation[];
    public annotations(annotations: Annotation[]): this;
    public annotations(annotations?: Annotation[]): Annotation[] | this {
        if (annotations !== undefined) {
            this.set('annotations', annotations);
            return this;
        }
        return this.get('annotations');
    }

    public createdAt(): Date;
    public createdAt(createdAt: Date | string): this;
    public createdAt(createdAt?: Date | string): Date | this {
        if (createdAt !== undefined) {
            if (typeof createdAt === 'string') {
                createdAt = moment(createdAt).toDate();
            }
            this.set('created_at', createdAt);
            return this;
        }
        return this.get('created_at');
    }

    public color(): string;
    public color(color: string): this;
    public color(color?: string): string | this {
        if (color !== undefined) {
            this.set('color', color);
            return this;
        }
        return this.get('color');
    }

    public id(): number;
    public id(id: number): this;
    public id(id?: number): number | this {
        if (id !== undefined) {
            this.set('id', +id);
            return this;
        }
        return this.get('id');
    }

    public isPhantom(): boolean;
    public isPhantom(isPhantom: boolean): this;
    public isPhantom(isPhantom?: boolean): boolean | this {
        if (isPhantom !== undefined) {
            this.set('is_phantom', isPhantom);
            return this;
        }
        return this.get('is_phantom');
    }

    public lat(): number;
    public lat(lat: number): this;
    public lat(lat?: number): number | this {
        if (lat !== undefined) {
            this.set('lat', +lat);
            return this;
        }
        return this.get('lat');
    }

    public long(): number;
    public long(long: number): this;
    public long(long?: number): number | this {
        if (long !== undefined) {
            this.set('long', +long);
            return this;
        }
        return this.get('long');
    }


    public name(): string;
    public name(name: string): this;
    public name(name?: string): string | this {
        if (name !== undefined) {
            this.set('name', name);
            return this;
        }
        return this.get('name');
    }

    public status(): string;
    public status(status: string): this;
    public status(status?: string): string | this {
        if (status !== undefined) {
            this.set('status', status);
            return this;
        }
        return this.get('status');
    }

    public updatedAt(): Date;
    public updatedAt(updatedAt: Date | string): this;
    public updatedAt(updatedAt?: Date | string): Date | this {
        if (updatedAt !== undefined) {
            if (typeof updatedAt === 'string') {
                updatedAt = moment(updatedAt).toDate();
            }
            this.set('updated_at', updatedAt);
            return this;
        }
        return this.get('updated_at');
    }

    public mapData(): MapData;
    public mapData(mapData: MapData): this;
    public mapData(mapData?: MapData): MapData | this {
        if (mapData !== undefined) {
            this.set('map_data', mapData);
            const lonlatCenter = ol.proj.transform(mapData.Center, mapData.Projection, LonLat);
            const projection = `Strayos Dataset ${this.id()}`;
            const transformation =
                `+proj=ortho +datum=WGS84 +lat_0=${lonlatCenter[1]} +lon_0=${lonlatCenter[0]} +x_0=0 +y_0=0 +units=m no_defs`;
            proj4.defs(projection, transformation);
            this.projection(projection);
            return this;
        }
        return this.get('map_data');
    }

    public projection(): ol.ProjectionLike;
    public projection(projection: ol.ProjectionLike): this;
    public projection(projection?: ol.ProjectionLike): ol.ProjectionLike | this {
        if (projection !== undefined) {
            this.set('projection', projection);
            return this;
        }
        return this.get('projection');
    }
    // Actual methods

    calcExtent(): [number, number, number, number] {
        const mapData = this.mapData();
        const bb = mapData.BoundingBox;
        const extmin = ol.proj.fromLonLat([bb[1], bb[0]]);
        const extmax = ol.proj.fromLonLat([bb[3], bb[2]]);
        return [extmin[0], extmin[1], extmax[0], extmax[1]];
    }

    overwriteStyle(): ol.style.Style[] {
        const lineStringStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: this.color(),
                width: 2,
            }),
        });
        return [
            lineStringStyle
        ];
    }

    async updateFromAnnotations() {
        // Check if you have mapdata
        const mapdataAnno = this.annotations().find(anno => anno.type() === 'mapdata');
        if (!mapdataAnno) {
            console.warn('No mapddata annotation found');
            return;
        }
        const mapdataResource = mapdataAnno.resources().find(r => r.type() === 'mapdata');
        if (!mapdataResource) {
            console.warn('No mapdata resource found');
            return;
        }
        const mapdata = await fetch(mapdataResource.url()).then(r => r.json());
        this.mapData(mapdata);
    }

    async waitForAnnotations(type?: string): Promise<Annotation[]> {
        if (this.annotations()) {
            return waitAndFind.bind(this)(type);
        } else {
            return new Promise<Annotation[]>((resolve) => {
                this.once('change:annotations', () => {
                    resolve(waitAndFind.bind(this)(type));
                });
            });
        }

        async function waitAndFind(type2?: string): Promise<Annotation[]> {
            if (type2) {
                let found = this.annotations().find(a => a.type() === type2);
                if (found) {
                    return [found];
                }
                found = await new Promise<Annotation>((resolve) => {
                    const off = listenOn(this, 'change:annotations', () => {
                        const f = this.annotations().find(a => a.type() === type2);
                        if (f) {
                            off();
                            resolve(f);
                        }
                    });
                });
                return [found];
            } else {
                return this.annotations();
            }
        }
    }

}