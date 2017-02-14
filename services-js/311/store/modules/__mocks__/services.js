// @flow

import type { Service } from '../services';

const services = require.requireActual('../services');

const MOCK_SERVICES_RESPONSE: { services: Service[] } = {
  services: [{
    name: 'Needle Pickup',
    code: 'needles',
    hasMetadata: true,
  }],
};

services.loadServices = () => ({
  type: 'SERVICES_LOAD',
  promise: Promise.resolve(MOCK_SERVICES_RESPONSE),
});

module.exports = services;
