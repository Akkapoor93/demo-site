/**
 * Experience Platform settings for the Kapoor Jewellers POC (see docs/tracking-spec.md).
 * Until `datastreamId` is set, events are built and logged but not sent (dry run).
 */
export default {
  orgId: '0B6930256441790E0A495FFE@AdobeOrg',
  sandbox: 'general-dev-sandbox',
  // Data Collection → Datastreams → "POC-Kapoor Web"
  datastreamId: '',
  // XDM tenant namespace for the "POC-Kapoor Site Context" field group
  tenant: '_acsultimatesupport',
  // Web SDK library (Adobe CDN)
  sdkUrl: 'https://cdn1.adoberesources.net/alloy/2.35.1/alloy.min.js',
  // HTTP API streaming source into "POC-Kapoor Profile" (signup / checkout opt-in)
  profileStreaming: {
    url: '',
    datasetId: '',
    schemaId: '',
  },
};
