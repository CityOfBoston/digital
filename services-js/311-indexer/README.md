<img src="https://cloud.githubusercontent.com/assets/9234/19400090/8c20c53c-9222-11e6-937c-02bce55e5301.png" alt="City of Boston" width="150" />

# 311-indexer

[![Build Status](https://travis-ci.org/CityOfBoston/311-indexer.svg?branch=develop)](https://travis-ci.org/CityOfBoston/311-indexer)
[![codecov](https://codecov.io/gh/CityOfBoston/311-indexer/branch/develop/graph/badge.svg)](https://codecov.io/gh/CityOfBoston/311-indexer)
[![Greenkeeper badge](https://badges.greenkeeper.io/CityOfBoston/311-indexer.svg)](https://greenkeeper.io/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Pulls 311 updates from Salesforce and indexes them in Elasticsearch

## Developers

### Setup

Copy `.env.default` to `.env` and modify any necessary values.

### Scripts

 * **Development Server**: `npm run-script dev`

### Code Policies

 * ESLint / Prettier styling enforced on commit. Use `npm run-script lint` to
   auto-fix style when possible.
 * Tests (Jest) and types (Flow) are enforced on push.

### Elasticsearch

 1. Install [Docker](https://www.docker.io/)
 1. Run `npm run-script elasticsearch-start`
 1. Run `npx babel-node server/scripts/elasticsearch-init.js`

### Bulk Import

Local: `npx babel-node server/scripts/import-cases.js 20170501 20171016`

Container Task: `node,./build/server/scripts/import-cases.js,20170501,20171016`
