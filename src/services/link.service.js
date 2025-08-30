const crypto = require('crypto');
const dayjs = require('dayjs');
const { allLinks, saveLinks } = require('./order.service');

function createDownloadLink({ order_id, photo_id }) {
  const links = allLinks();
  // expire old links of the same order
  links.forEach(l => { if (l.order_id === order_id) l.status = 'expired'; });

  const link = {
    id: 'L-' + Date.now(),
    order_id,
    photo_id,
    token: crypto.randomBytes(24).toString('base64url'),
    expires_at: dayjs().add(parseInt(process.env.DOWNLOAD_TTL_HOURS||'24',10), 'hour').toISOString(),
    max_uses: parseInt(process.env.DOWNLOAD_MAX_USES||'1',10),
    uses: 0,
    status: 'valid'
  };
  links.push(link);
  saveLinks(links);
  return link;
}

function getValidLink(order_id){
  const links = allLinks()
    .filter(l=>l.order_id===order_id && l.status==='valid')
    .sort((a,b)=> new Date(b.expires_at)-new Date(a.expires_at));
  return links[0] || null;
}

module.exports = { createDownloadLink, getValidLink };