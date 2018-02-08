import { BirchTree } from './birchtree';

export interface ModelConstructor {
    new (props?: any): Model;
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

    async create(model: T, trx?: BirchTree.Transaction): Promise<T> {
        const ids = await this.createQuery(trx).insert(model.toJSON());
        model.id = ids[0];
        return model;
    }

    async exterminate(model: T, trx?: BirchTree.Transaction): Promise<number> {
        return this.createQuery(trx).where('id', model.id).del();
    }

    async find(attrs: any, trx?: BirchTree.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where(attrs);
        return rows.map(row => new this.type(row));
    }

    async findOne(attrs: any, trx?: BirchTree.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where(attrs);
        if (!rows[0]) {
            return null;
        }
        return new this.type(rows[0]);
    }

    async findOneById(id: number, trx?: BirchTree.Transaction): Promise<T> {
        const rows = await this.createQuery(trx).where('id', id);
        if (!rows[0]) {
            return null;
        }
        return new this.type(rows[0]);
    }

    async findByIds(ids: number[], trx?: BirchTree.Transaction): Promise<T[]> {
        const rows = await this.createQuery(trx).whereIn('id', ids);
        return rows.map(row => new this.type(row));
    }

    async save(model: T, trx?: BirchTree.Transaction): Promise<T> {
        if (model.id) {
            return this.update(model, trx);
        } else {
            return this.create(model, trx);
        }
    }

    async update(model: T, trx?: BirchTree.Transaction): Promise<T> {
        await this.createQuery(trx).update(model.toJSON());
        return model;
    }

    createQuery(trx?: BirchTree.Transaction): BirchTree.QueryBuilder {
        const query = this.birch(this.type.tableName);
        if (trx) {
            query.transacting(trx);
        }
        return query;
    }
}
