import nest from './nest';

test('2 deep', () => {
    const rows = [{
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 1,
        'albums:name': 'Rubber Soul'
    }, {
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 2,
        'albums:name': 'Revolver'
    }];

    const results = nest(rows);

    expect(results).toEqual([{
        id: 1,
        name: 'The Beatles',
        albums: [{
            id: 1,
            name: 'Rubber Soul'
        }, {
            id: 2,
            name: 'Revolver'
        }]
    }]);
});

test('4 deep', () => {
    const rows = [{
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 1,
        'albums:name': 'Rubber Soul',
        'albums:songs:id': 1,
        'albums:songs:name': 'Drive My Car',
        'albums:songs:author:id': 2,
        'albums:songs:author:name': 'Paul McCartney'
    }, {
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 1,
        'albums:name': 'Rubber Soul',
        'albums:songs:id': 2,
        'albums:songs:name': 'Norwegian Wood (This Bird has Flown)',
        'albums:songs:author:id': 1,
        'albums:songs:author:name': 'John Lennon'
    }, {
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 2,
        'albums:name': 'Revolver',
        'albums:songs:id': 3,
        'albums:songs:name': 'Taxman',
        'albums:songs:author:id': 3,
        'albums:songs:author:name': 'George Harrison'
    }, {
        'id': 1,
        'name': 'The Beatles',
        'albums:id': 2,
        'albums:name': 'Revolver',
        'albums:songs:id': 4,
        'albums:songs:name': 'Eleanor Rigby',
        'albums:songs:author:id': 2,
        'albums:songs:author:name': 'Paul McCartney'
    }];

    const results = nest(rows);

    expect(results).toEqual([{
        id: 1,
        name: 'The Beatles',
        albums: [{
            id: 1,
            name: 'Rubber Soul',
            songs: [{
                id: 1,
                name: 'Drive My Car',
                author: {
                    id: 2,
                    name: 'Paul McCartney'
                }
            }, {
                id: 2,
                name: 'Norwegian Wood (This Bird has Flown)',
                author: {
                    id: 1,
                    name: 'John Lennon'
                }
            }]
        }, {
            id: 2,
            name: 'Revolver',
            songs: [{
                id: 3,
                name: 'Taxman',
                author: {
                    id: 3,
                    name: 'George Harrison'
                }
            }, {
                id: 4,
                name: 'Eleanor Rigby',
                author: {
                    id: 2,
                    name: 'Paul McCartney'
                }
            }]
        }]
    }]);
});
