export default async function grow(tables: string[]): Promise<string[]> {
    let results = [];

    let first = true;
    for (const table of tables) {
        const { alias, name } = getNameAndAlias(table);

        let columns = [];
        if (this.cache.has(name)) {
            columns = this.cache.get(name);
        } else {
            const info = await this.knex(name).columnInfo();
            columns = Object.keys(info);
            if (columns.length === 0) {
                throw new Error(`table ${name} does not exist`);
            }
            this.cache.set(name, columns);
        }

        if (first) {
            first = false;
            columns = columns.map(column => `${alias}.${column}`);
        } else {
            columns = columns.map(column => `${alias}.${column} AS ${alias}:${column}`);
        }
        results = [...results, ...columns];
    }

    return results;
}

export function getNameAndAlias(table) {
    const split = table.split(' ');
    const name = split[0];
    let alias = name;
    if (split[2]) {
        alias = split[2];
    } else if (split[1]) {
        alias = split[1];
    }

    return { alias, name };
}
