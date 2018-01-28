# BirchTree [![Build Status](https://travis-ci.org/TheKiteEatingTree/birchtree.svg?branch=master)](https://travis-ci.org/TheKiteEatingTree/birchtree)

BirchTree is mainly a helper library for [knexjs](http://knexjs.org/).  It takes an instance of knex and adds two helper functions: grow and nest.  These functions make it easy to get nested objects as results when running join queries.

BirchTree is also a repository library built on knexjs.  It provides a base `Repo` class and `Model` interface that can be extended and implemented to create a basic model system.

## Install

```bash
npm install --save birchtree
```

## TypeScript

BirchTree is written in typescript and should just work. You can import the type for birchtree like this

```typescript
import { BirchTree } from 'birchtree'
```

## Helper Functions

### Basic Usage

```javascript
import birchtree from 'birchtree';
import * as Knex from 'knex';

const knex = Knex({
    client: 'mysql',
    debug: false,
    connection,
    pool
});

const birch = birchtree(knex);

const songs = 'albums:songs';
const author = 'albums:songs:author';
const select = await birch.grow('artists', 'albums', `songs AS ${songs}`, `authors AS ${author}`);
const results = await birch('users')
    .select(select)
    .leftJoin('albums', 'albums.artist_id', 'artists.id')
    .leftJoin(`songs AS ${songs}`, `${songs}.album_id`, `albums.id`)
    .leftJoin(`authors as ${author}`, `${author}.id`, `${songs}.author_id`)
    .where('artists.id', '=', 1);
const nestedResults = birch.nest(results);
```

Results will look like

```javascript
[{
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
}]
```

### Important

There are some important things to note from the example.  

- In order for things more than 1 layer deep to nest they must be aliased in a nested way. The delimiter is `:`
- If a name or alias is plural than the results will form an array correctly
- If the name or alias is singular than it will not form a collection
- **You will only get 1 result if you use a singular alias for something you want multiple results for**

### grow

Asynchronous: Takes any number of table names with or without aliases as arguments and returns an array for knex's select function that will make sure columns don't get overwritten. It will select every column in each table given.

### nest

Takes the results from a select query and nests them using [treeize](https://github.com/kwhitley/treeize)

## Repository System
