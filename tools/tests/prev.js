const fs = require('fs');
const { api } = require('../../lib/leafapi');
const id = fs.readFileSync(__dirname + '/prev_init.txt', 'utf8').trim();
(async () => {
  const ad = Number(new URLSearchParams(id).get('auth_date')) * 1000;
  console.log('পুরনো (setinit-এর আগের) initData — auth_date:', new Date(ad).toISOString(), '·', Math.round((Date.now() - ad) / 3600e3), 'ঘণ্টা পুরনো');
  const r = await api.init(id, '1692540458');
  console.log('init →', r.ok ? '✅ কাজ করছে! leaf=' + r.data.user.leaf : '❌ ' + r.code + ' :: ' + r.message);
  if (r.ok) {
    const gv = await api.giveawayStatus(id);
    console.log('giveaway →', gv.ok ? '✅ step ' + gv.data.step + ' · points ' + gv.data.points : '❌');
    const a = await api.activity(id, 1);
    console.log('activity →', a.ok ? '✅' : '❌');
  }
})().catch(e => console.error('ERR', e.message));
