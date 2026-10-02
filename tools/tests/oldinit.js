// oldinit.js — পুরনো initData কতদিন কাজ করে টেস্ট (২৪ ঘণ্টা+ পুরনো লিংক দিয়ে)
const { api } = require('../../lib/leafapi');

// ২৮ সেপ্টেম্বরের লিংক (আপনার প্রথম মেসেজ থেকে) — auth_date 2026-09-28
const OLD = 'query_id=AAEqHuJkAAAAACoe4mQGSdfz&user=' + encodeURIComponent(JSON.stringify({
  id: 1692540458,
  first_name: '\u{1D4D0}\u{1D4EB}\u{1D4ED}\u{1D4FE}\u{1D4FB}'.normalize(),
  username: 'Abdur081', language_code: 'en', allows_write_to_pm: true,
})) + '&auth_date=1790634196&hash=b733c32ca8973e4fddff936bcc1747ae3fee5318fec40d91c88ac290907dbe3e';

(async () => {
  const ad = Number(new URLSearchParams(OLD).get('auth_date')) * 1000;
  console.log('পুরনো initData — auth_date:', new Date(ad).toISOString(), '(' + Math.round((Date.now() - ad) / 3600e3) + ' ঘণ্টা পুরনো)');
  const r = await api.init(OLD, '1692540458');
  console.log('init  →', r.ok ? '✅ কাজ করছে! leaf=' + r.data.user.leaf : '❌ ' + r.code + ' :: ' + r.message);
  if (r.ok) {
    const ms = await api.mineStatus(OLD);
    console.log('mineStatus →', ms.ok ? '✅ ' + JSON.stringify(ms.data).slice(0, 90) : '❌ ' + ms.message);
    const gv = await api.giveawayStatus(OLD);
    console.log('giveaway →', gv.ok ? '✅ points=' + gv.data.points + ' step=' + gv.data.step : '❌ ' + gv.message);
  }
})().catch(e => console.error('ERR', e.message));
