#!/usr/bin/env node
// quick.js — শুধু কুইক-টাস্ক (ADSGRAM_LINK / WEBSITE) বারবার চেষ্টা করে বেশি অফার তুলে আনে
//   node tools/quick.js            → ৩০ রাউন্ড (৪ রাউন্ড খালি পেলে থামে)
//   ROUNDS=60 node tools/quick.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { api } = require(path.join(ROOT, 'lib/leafapi.js'));
const adsMod = require(path.join(ROOT, 'lib/adsgram.js'));
const { id } = require('./_acc');

const QTYPES = ['ADSGRAM_LINK', 'WEBSITE'];
const ROUNDS = Number(process.env.ROUNDS || 30);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const H = {
  referer: 'https://leafearn.site/',
  'user-agent': 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36',
};
const stamp = () => new Date().toISOString().slice(11, 19);

(async () => {
  let ok = 0, empties = 0, nextT = null;
  const KEEP = process.env.KEEP === '1';   // KEEP=1 → খালি পেলেও থামে না (অফার র‍্যান্ডম আসে)
  for (let round = 0; round < ROUNDS && (KEEP || empties < 4); round++) {
    let t = nextT && QTYPES.includes(nextT.type) ? nextT : null;
    nextT = null;
    if (!t) {
      for (const ty of QTYPES) {
        const qo = await api.quickOffer(id, ty);
        const tt = qo.ok && qo.data && qo.data.task;
        if (tt && tt.type === ty) { t = tt; break; }
      }
    }
    if (!t) { empties++; if (empties === 1) console.log(stamp(), '⏳ অফার নেই — অপেক্ষা…'); await sleep(KEEP ? 8000 : 5000); continue; }
    empties = 0;
    if (t.type === 'ADSGRAM_LINK') await adsMod.doAdShow(id);
    if (t.open_url) await fetch(t.open_url, { redirect: 'follow', headers: H, signal: AbortSignal.timeout(20000) }).catch(() => {});
    const slug = (t.open_url || '').replace(/\/+$/, '').split('/').pop() || '';
    const refs = [...new Set(t.type === 'ADSGRAM_LINK' ? [slug, t.ref_id || ''] : [t.ref_id || '', slug])].filter((x, i) => x || i === 0);
    await sleep(((t.wait_sec || 5) + 1) * 1000);
    if (t.reward_url) await fetch(t.reward_url, { redirect: 'follow', headers: H, signal: AbortSignal.timeout(20000) }).catch(() => {});
    let done = false, lastMsg = '';
    for (const refId of refs) {
      for (let k = 0; k < (t.reward_url ? 4 : 3) && !done; k++) {
        const cl = await api.quickClaim(id, t.type, refId);
        if (cl.ok) {
          done = true; ok++;
          console.log(stamp(), `✔ ${t.type} +${cl.data.credited} ✓ (bal ${cl.data.balance})`);
          nextT = cl.data.has_next ? cl.data.next : null;
          break;
        }
        lastMsg = cl.message;
        if (/limit_reached|done all of these/i.test(lastMsg)) break;
        await sleep(3000);
      }
      if (done) break;
    }
    if (!done) { console.log(stamp(), `⚠ ${t.type}: ${lastMsg}`); if (/safety/i.test(lastMsg)) { console.log(stamp(), '🛡 safety গেট — কোড দিন (Safety Console / node tools/safety.js <CODE>)'); await sleep(60000); } }
    await sleep(1500);
  }
  const q = await api.quickStatus(id);
  console.log(stamp(), `শেষ — quick ✓${ok} · disponible/quota: ${JSON.stringify(q.data && q.data.available)}`);
})().catch((e) => console.error('ERR', e.message));
