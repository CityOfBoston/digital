import { Request as HapiRequest, RequestQuery, ResponseToolkit } from 'hapi';

const SERVICE_ID_MAP = {
  '4f389210e75084437f0001ce': 'litter', // Litter
  '4f38920fe75084437f0001ba': 'EMPLITBSKT', // Overflowing Trash Can
  '56c2dc2a601827d70f000006': 'IMPSTRTRSH', // Residential Trash out Illegally
  '4f389210e75084437f0001c4': 'PUDEADANML', // Dead Animal Pick-up
  '55563da904853fde08a10507': 'NEEDRMVL', // Needle Clean-up
  '4f38920fe75084437f000188': 'RODENTACT', // Rodent Sighting
  '51f6012a2debc151cb9b5672': 'EQUIPREPR', // Broken Park Equipment
  '4f389210e75084437f0001d3': 'SDWRPR', // Broken Sidewalk
  '4f389210e75084437f0001ec': 'MISDMGSGN', // Damaged Sign
  '4f389210e75084437f0001ca': 'REQPOTHL', // Pothole
  '4f38920fe75084437f00019c': 'ABNDBIKE', // Abandoned Bicycle
  '4f389210e75084437f0001de': 'ABNDVHCL', // Abandoned Vehicle
  '4f389210e75084437f0001e5': 'PRKGENFORC', // Illegal Parking
  '51f6012b2debc151cb9b5675': 'LGHTELEC', // Park Lights
  '4f389210e75084437f0001d8': 'STRLGTOUT', // Street Lights
  '549d8f0b0485971e64c7b37b': 'TFCSGNINSP', // Traffic Signal
  '4f38920fe75084437f0001b3': 'GENERALGRAFFITI', // Illegal Graffiti
  '4f38920fe75084437f0001a9': 'NWTRREQ', // New Tree Requests
  '55c2aa7a601827411b000001': 'TREEMAINT', // Dead Tree Removal
  '4f38920fe75084437f0001b2': 'TREEMAINT', // Tree Pruning
  '4f38920fe75084437f0001a0': 'BOS311GEN', // Other
};

export default function legacyServiceRedirectHandler(
  request: HapiRequest,
  h: ResponseToolkit
) {
  const code =
    SERVICE_ID_MAP[(request.query as RequestQuery).service_id as string];

  if (code) {
    return h.redirect(`/request/${code}`);
  } else {
    return h.redirect('/services');
  }
}
