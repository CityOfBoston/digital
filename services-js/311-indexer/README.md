<img src="https://cloud.githubusercontent.com/assets/9234/19400090/8c20c53c-9222-11e6-937c-02bce55e5301.png" alt="City of Boston" width="150" />

# 311-indexer

[![Build Status](https://travis-ci.org/CityOfBoston/311-indexer.svg?branch=develop)](https://travis-ci.org/CityOfBoston/311-indexer)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Pulls 311 updates from Salesforce and indexes them in Elasticsearch

## Developers

### Setup

Copy `.env.default` to `.env` and modify any necessary values.

### Scripts

 * **Development Server**: `yarn dev`

### Elasticsearch

 1. Install [Docker](https://www.docker.io/)
 1. Run `yarn elasticsearch-start`
 1. Run `npx ts-node server/scripts/elasticsearch-init.ts`

### Debugging

 * With Charles: `env NODE_TLS_REJECT_UNAUTHORIZED=0 http_proxy=http://localhost:8888/ npm run dev`

### Bulk Import

Local: `npx ts-node server/scripts/import-cases.ts 20170501 20171016`

Container Task: `node,./build/server/scripts/import-cases.js,20170501,20171016`
