import * as ol from 'openlayers';
import * as moment from 'moment';

import { Resource, IResource } from './resource.model';

export interface IAnnotation {
    created_at: Date | string;
    data: string | ol.Collection<ol.Feature>;
    id: number;
    meta: string | {};
    resources: IResource[];
    type: string;
    updated_at: Date | string;
}

export class Annotation extends ol.Object {
    constructor (props: IAnnotation) {
        super(props);
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

    public data(): ol.Collection<ol.Feature>;
    public data(data: string| ol.Collection<ol.Feature>): this;
    public data(data?: string | ol.Collection<ol.Feature> | ol.Feature): ol.Collection<ol.Feature> | this {
        if (data !== undefined) {
            if (data === 'string') {
                data = new ol.Collection((new ol.format.GeoJSON()).readFeatures(data as string));
            }
            this.set('data', data);
            return this;
        }
        return this.get('data');
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

    public meta(): {};
    public meta(meta: string | {}): this;
    public meta(meta?: string | {}): {} | this {
        if (meta !== undefined) {
            if (typeof meta === 'string') {
                meta = JSON.parse(meta);
            }
            this.set('meta', meta);
            return this;
        }
        return this.get('meta');
    }

    public resources(): Resource[];
    public resources(resources: Resource[]): this;
    public resources(resources?: Resource[]): Resource[] | this {
        if (resources !== undefined) {
            this.set('resources', resources);
            return this;
        }
        return this.get('resources');
    }

    public type(): string;
    public type(type: string): this;
    public type(type?: string): string | this {
        if (type !== undefined) {
            this.set('type', type);
            return this;
        }
        return this.get('type');
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

    updateFromInterface() {
        this.id(this.id());
        this.createdAt(this.createdAt());
        this.updatedAt(this.updatedAt());
        this.data(this.data());
        this.meta(this.meta());
    }
}