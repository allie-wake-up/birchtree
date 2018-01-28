import { getNameAndAlias, default as growFn } from './grow';

describe('getNameAndAlias', () => {
    test('gets users for both', () => {
        const { alias, name } = getNameAndAlias('users');
        expect(alias).toBe('users');
        expect(name).toBe('users');
    });

    test('gets users for name and u for alias with AS', () => {
        const { alias, name } = getNameAndAlias('users AS u');
        expect(alias).toBe('u');
        expect(name).toBe('users');
    });

    test('gets users for name and u for alias without AS', () => {
        const { alias, name } = getNameAndAlias('users u');
        expect(alias).toBe('u');
        expect(name).toBe('users');
    });
});

describe('grow', () => {
    let columnInfo, grow;

    beforeEach(() => {
        columnInfo = jest.fn();
        const mock = {
            cache: new Map(),
            knex: function(name = '') {
                return {
                    columnInfo
                }
            }
        }

        grow = growFn.bind(mock);
    });

    test('works with one table', async () => {
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            name: true,
            email: true
        }));
        const results = await grow(['users']);
        expect(columnInfo.mock.calls.length).toBe(1);
        expect(results).toEqual([
            'users.id',
            'users.name',
            'users.email'
        ]);
    });

    test('works with two tables', async () => {
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            name: true
        }));
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            artist_id: true,
            name: true
        }));
        const results = await grow(['artists', 'albums']);
        expect(columnInfo.mock.calls.length).toBe(2);
        expect(results).toEqual([
            'artists.id',
            'artists.name',
            'albums.id AS albums:id',
            'albums.artist_id AS albums:artist_id',
            'albums.name AS albums:name'
        ]);
    });

    test('works with two tables with aliases', async () => {
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            name: true
        }));
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            artist_id: true,
            name: true
        }));
        const results = await grow(['artists AS as', 'albums abms']);
        expect(columnInfo.mock.calls.length).toBe(2);
        expect(results).toEqual([
            'as.id',
            'as.name',
            'abms.id AS abms:id',
            'abms.artist_id AS abms:artist_id',
            'abms.name AS abms:name'
        ]);
    });

    test('cache works', async () => {
        columnInfo.mockReturnValueOnce(Promise.resolve({
            id: true,
            name: true
        }));
        const results = await grow(['users', 'users u']);
        expect(columnInfo.mock.calls.length).toBe(1);
        expect(results).toEqual([
            'users.id',
            'users.name',
            'u.id AS u:id',
            'u.name AS u:name'
        ]);
    });
});
