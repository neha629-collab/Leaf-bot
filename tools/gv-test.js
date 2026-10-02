// gv-test.js — giveaway step টেস্ট: StartAd → CompleteAd-এর কোন ফর্ম্যাট সার্ভার মানে
const path = require('path');
const { api } = require(path.join(__dirname, '..', 'lib', 'leafapi.js'));
const adsMod = require(path.join(__dirname, '..', 'lib', 'adsgram.js'));
const { id } = require('./_acc');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 0; i < 3; i++) {
    const st = await api.giveawayStatus(id);
    console.log('status: step', st.data.step, '| points', st.data.points, '| break', st.data.break_until_ms, '| cd', st.data.cooldown_until_ms);
    const sv = await api.giveawayStartAd(id);
    if (!sv.ok) { console.log('StartAd ✘', sv.code, sv.message); return; }
    console.log('StartAd ✓ →', JSON.stringify(sv.data));
    const t = sv.data;
    if (t.network === 'MONETAG') {
      // ১) 0,0 দিয়ে চেষ্টা (ফ্রন্টএন্ড এটাই পাঠায় MONETAG-এ)
      let cv = await api.giveawayCompleteAd(id, { token: t.token, ads_shown: 0, ads_clicked: 0 });
      console.log('CompleteAd(0,0) →', cv.ok ? JSON.stringify(cv.data) : cv.code + ' :: ' + cv.message);
      if (!cv.ok) {
        await sleep(1500);
        const sv2 = await api.giveawayStartAd(id);
        if (sv2.ok) {
          cv = await api.giveawayCompleteAd(id, { token: sv2.data.token, ads_shown: 1, ads_clicked: 1 });
          console.log('CompleteAd(1,1) →', cv.ok ? JSON.stringify(cv.data) : cv.code + ' :: ' + cv.message);
        }
      }
    } else {
      const show = await adsMod.doAdShow(id, t.unit || '48006');
      console.log('adsgram show (' + t.unit + ') →', show.ok ? 'ok rec=' + String(show.showRec).slice(0, 12) : (show.noFill ? 'no fill' : show.error || 'fail'));
      await sleep(3000);
      const cv = await api.giveawayCompleteAd(id, { token: t.token, ads_shown: 1, ads_clicked: 1 });
      console.log('CompleteAd(1,1) →', cv.ok ? JSON.stringify(cv.data) : cv.code + ' :: ' + cv.message);
    }
    await sleep(2000);
  }
})().catch((e) => console.error('ERR', e.message));
