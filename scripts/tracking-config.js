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
    url: 'https://dcs.adobedc.net/collection/dd630444a88a6bf96dadeb0fb5d5adcbc9a2adb5219b6e0c419ff1df61dbe314',
    datasetId: '6abfaf89d2d8d9adbd2991ac',
    schemaId: 'https://ns.adobe.com/acsultimatesupport/schemas/c040468296658526c81f3ca218e3c76428f269456abf7dfc',
  },
  // reference (created by Coworker):
  // event dataset "POC-Kapoor Web Events" 6abfaf7e367544cf7b89689c
  // event schema https://ns.adobe.com/acsultimatesupport/schemas/
  //   24efeb2c1f598841fde7788993b9b94d21ea3366b2c15a10
};
