import * as Treeize from 'treeize';

export default function nest(results: any[]): any[] {
    const tree = new Treeize();
    tree.grow(results, {
        input: {
            delimiter: ':',
            detectCollections: true,
            uniformRows: true
        },
        output: {
            prune: false,
            objectOverwrite: false,
            resultsAsObject: false
        }
    });
    return tree.getData();
}
