const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Triple_A',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

