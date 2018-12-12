import sm from 'sitemap';
import Open311 from './services/Open311';

export default (open311: Open311) => async (request: any, reply: any) => {
  const services = await open311.services();
  const sitemap = sm.createSitemap({
    hostname: `https://${request.info.host}`,
  });

  sitemap.add({ url: '/faq ' });
  sitemap.add({ url: '/services ' });
  sitemap.add({ url: '/search ' });

  services.forEach(service => {
    sitemap.add({ url: `/request/${service.service_code}` });
  });

  sitemap.toXML((err, xml) => {
    reply(err, xml).type('application/xml');
  });
};
