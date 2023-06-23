import * as ol from 'openlayers';
import * as moment from 'moment';
import * as d3 from 'd3';
import { IDataset, Dataset } from './dataset.model';

export interface ISite {
    created_at: Date | string;
    datasets: IDataset[];
    id: number;
    location: string;
    name: string;
    status: string;
    updated_at: Date | string;
}

export class Site extends ol.Object {
    colorScale = d3.scaleOrdinal<number, string>(d3.schemeCategory20);
    constructor(props) {
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

    public datasets(): Dataset[];
    public datasets(datasets: Dataset[]): this;
    public datasets(datasets?: Dataset[]): Dataset[] | this {
        if (datasets !== undefined) {
            this.set('datasets', datasets);
            this.recalculateColors();
            return this;
        }
        return this.get('datasets');
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

    public location(): string;
    public location(location: string): this;
    public location(location?: string): string | this {
        if (location !== undefined) {
            this.set('location', location);
            return this;
        }
        return this.get('location');
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


    // Actual Methods
    getPhantomDataset(): Dataset {
        return this.datasets().find(d => d.isPhantom());
    }

    recalculateColors() {
        if (this.datasets()) {
            this.datasets().forEach((dataset, i) => {
                if (!dataset.color()) {
                    dataset.color(this.colorScale(i % 20))
                }
            });
        }
    }
}