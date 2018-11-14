module.exports = {
  appId: process.env.OPBEAT_APP_ID,
  organizationId: process.env.OPBEAT_ORGANIZATION_ID,
  secretToken: process.env.OPBEAT_SECRET_TOKEN,
  active: process.env.NODE_ENV === 'production',
};
