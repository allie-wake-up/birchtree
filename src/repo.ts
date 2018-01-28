import * as Knex from 'knex';
import { BirchTree } from './birchtree';

export interface ModelConstructor {
    new (): Model;
}

export class Model {
    static tableName: string;
    id: number | string;
    toJSON() {
        return { id: this.id };
    }
}

export default abstract class Repo<T extends Model> {
    protected birch: BirchTree;
    protected type: any;

    constructor(type: ModelConstructor, birch: BirchTree) {
        this.birch = birch;
        this.type = type;
    }

    async create(model: T, trx: Knex.Transaction): Promise<T> {
        const ids = await this.createQuery(trx).insert(model.toJSON());
        model.id = ids[0];
        return model;
    }

    async exterminate(model: T, trx: Knex.Transaction): Promise<number> {
        return this.createQuery(trx).where('id', model.id).del();
    }

    async find(attrs: any, trx: Knex.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where(attrs);
        return rows.map(row => new this.type(row));
    }

    async findOne(attrs: any, trx: Knex.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where(attrs);
        if (!rows[0]) {
            return null;
        }
        return new this.type(rows[0]);
    }

    async findOneById(id: number, trx: Knex.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where('id', id);
        if (!rows[0]) {
            return null;
        }
        return new this.type(rows[0]);
    }

    async findByIds(ids: number[], trx: Knex.Transaction): Promise<T[]> {
        const rows = await this.createQuery(trx).whereIn('id', ids);
        return rows.map(row => new this.type(row));
    }

    async save(model: T, trx: Knex.Transaction): Promise<T> {
        if (model.id) {
            return this.update(model, trx);
        } else {
            return this.create(model, trx);
        }
    }

    async update(model: T, trx: Knex.Transaction): Promise<T> {
        await this.createQuery(trx).update(model.toJSON());
        return model;
    }

    createQuery(trx: Knex.Transaction) {
        const query = this.birch(this.type.tableName);
        if (trx) {
            query.transacting(trx);
        }
        return query;
    }
}
