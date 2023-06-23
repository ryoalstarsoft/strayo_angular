import * as ol from 'openlayers';
import * as moment from 'moment';

export interface IResource {
    created_at: Date | string;
    id: number;
    url: string;
    type: string;
    status: string;
    updated_at: string;
}

export class Resource extends ol.Object {
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

    public id(): number;
    public id(id: number): this;
    public id(id?: number): number | this {
        if (id !== undefined) {
            this.set('id', +id);
            return this;
        }
        return this.get('id');
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

    public type(): string;
    public type(type: string): this;
    public type(type?: string): string | this {
        if (type !== undefined) {
            this.set('type', type);
            return this;
        }
        return this.get('type');
    }

    public url(): string;
    public url(url: string): this;
    public url(url?: string): string | this {
        if (url !== undefined) {
            this.set('url', url);
            return this;
        }
        return this.get('url');
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
}