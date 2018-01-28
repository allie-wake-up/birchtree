# birchtree [![Build Status](https://travis-ci.org/TheKiteEatingTree/birchtree.svg?branch=master)](https://travis-ci.org/TheKiteEatingTree/birchtree)

## Install

```bash
npm install --save birchtree
```

## Basic Usage

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

const select = await birch.grow('users', 'subscriptions AS subs', 'feeds AS subs:feed');
const results = await birch('users')
    .select(select)
    .leftJoin('subscriptions AS subs', 'subs.user_id', 'users.id')
    .leftJoin('feeds AS subs:feed', 'subs:feed.id', 'subs.feed_id')
    .where('users.id', '=', 1);
const nestedResults = birch.nest(results);
```


