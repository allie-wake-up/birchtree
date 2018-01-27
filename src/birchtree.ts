import * as Knex from 'knex';
import growFn from './grow';
import nestFn from './nest';

export interface BirchTree extends Knex {
    grow: typeof growFn;
    nest: typeof nestFn;
}

export default function birchtree(knex: Knex, cache: Map<string, string[]> = new Map()): BirchTree {
    this.knex = knex;
    this.cache = cache;

    const grow = growFn.bind(this);
    const nest = nestFn.bind(this);

    if (knex['grow'] || knex['nest']) {
        throw new Error('You are either trying to wrap a birchtree with birchtree or the version of knex that you are using is not compatible with birchtree.  Knex should not have grow or nest functions');
    }

    const birch = <any>knex;
    birch.grow = grow;
    birch.nest = nest;

    return <BirchTree>birch;
}
