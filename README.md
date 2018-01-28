# BirchTree [![Build Status](https://travis-ci.org/TheKiteEatingTree/birchtree.svg?branch=master)](https://travis-ci.org/TheKiteEatingTree/birchtree)

BirchTree is mainly a helper library for [knexjs](http://knexjs.org/).  It takes an instance of knex and adds two helper functions: grow and nest.  These functions make it easy to get nested objects as results when running join queries.

BirchTree is also a repository library built on knexjs.  It provides base `Repo` and `Model` classes that can be extended to create a basic model system.

<!-- toc -->

- [Install](#install)
- [TypeScript](#typescript)
- [Helper Functions](#helper-functions)
  * [Basic Usage](#basic-usage)
  * [Important](#important)
  * [grow](#grow)
  * [nest](#nest)
- [Repository System](#repository-system)
  * [Basic Setup](#basic-setup)
  * [Create](#create)
  * [Update](#update)
  * [Save](#save)
  * [findOneById](#findonebyid)
  * [findByIds](#findbyids)
  * [exterminate](#exterminate)
  * [findOne](#findone)
  * [find](#find)
  * [createQuery](#createquery)
  * [Transactions](#transactions)

<!-- tocstop -->

## Install

```bash
npm install --save birchtree
```

## TypeScript

BirchTree is written in typescript and should just work. You can import the type for birchtree like this

```javascript
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

### Basic Setup

```javascript
import { default as birchtree, BirchTree, Repo, Model } from 'birchtree';

// let's just pretend we set knex up
const birch = birchtree(knex);

// let's make a user repo
const userRepo = new UserRepo(birch);

class User extends Model {
    static tableName = 'users';

    private id: number;
    private email: string;
    private username: string;

    constructor(props) {
        super();
        Object.assign(this, props);
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            username: this.username
        }
    }
}

class UserRepo extends Repo<User> {
    constructor(birch) {
        super(User, birch);
    }

    async findDuplicate(user: User, trx: BirchTree.Transaction) {
        return this.createQuery(trx)
            .where({ email: user.email })
            .orWhere({ username: user.username });
    }
}
```

### Create

```javascript
const user = new User({
    email: 'fry@gmail.com',
    username: 'fry'
});
await userRepo.create(user);
```

### Update

```javascript
user.username = 'bender';
await userRepo.update(user);
```

### Save

```javascript
user.email = 'bender@gmail.com';
await userRepo.save(user);

const leela = new User({
    email: 'leela@gmail.com',
    username: 'leela'
});
await userRepo.save(leela);
```

### findOneById

```javascript
const bender = await userRepo.findOneById(user.id);
```

### findByIds

```javascript
const benderAndLeela = await userRepo.findByIds([bender.id, leela.id]);
```

### exterminate

```javascript
await userRepo.exterminate(bender);
```

### findOne

```javascript
const leelaAgain = await userRepo.findOne({ email: 'leela@gmail.com' });
```

### find

```javascript
const leelaAsAnArray = await userRepo.find({ email: 'leela@gmail.com' });
```

### createQuery

This returns a birchtree/knex querybuilder.

```javascript
const results = await userRepo.createQuery().where('email', '=', 'bender@gmail.com');
```

### Transactions

```javascript
birch.transaction(trx => {
    const bender = await userRepo.findOne({ username: 'bender' }, trx);
    bender.username = 'coilette';
    await userRepo.save(bender, trx);

    const leela = await userRepo.createQuery(trx).where({ username: 'leela' });
    leela.username = 'Turanga';
    await userRepo.save(leela, trx);
    return [ bender, leela ];
})
.then(results => console.log(results))
.catch(err => console.error(err));
```
