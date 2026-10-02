#!/usr/bin/env node
// newlink.js — 🔑 নতুন Telegram লিংক এক কমান্ডে বসাও (+ কতক্ষণ চলবে দেখায়)
//   node tools/newlink.js "https://leafearn.site/#tgWebAppData=..."
//   node tools/newlink.js --status          → এখনকার লিংকের বয়স/স্ট্যাটাস
//
// কেন লাগে: initData ~২৪-৪৮ ঘণ্টা পর এক্সপায়ার হয় (সার্ভার UNAUTHENTICATED দেয়)।
// Leaf খোলা অবস্থায় Telegram-এর "share/copy" দিলে যে লিংক আসে, সেটাই এখানে দিন —
// পুরনো জেনারেশনগুলোও pool-এ জমা থাকে (একটা মরে গেলে পরেরটা অটো চলে)।
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { api } = require(path.join(ROOT, 'lib/leafapi.js'));

const ACC_FILE = path.join(ROOT, 'config/accounts/main.json');
const acc = () => JSON.parse(fs.readFileSync(ACC_FILE, 'utf8'));
const save = (a) => fs.writeFileSync(ACC_FILE, JSON.stringify(a, null, 2));

function parseLink(raw) {
  raw = String(raw || '').trim().replace(/&amp;/g, '&');
  const m = raw.match(/tgWebAppData=([^&#\s]+)/);
  let v = m ? decodeURIComponent(m[1]) : raw;
  if (!/query_id=|user=/.test(v)) { try { v = decodeURIComponent(v); } catch {} }
  return /user=/.test(v) && /hash=/.test(v) ? v : '';
}
const ttlStr = (authMs) => {
  const ageH = (Date.now() - authMs) / 3600e3;
  // পরীক্ষিত: ~২৫ ঘণ্টা পুরনো লিংক কাজ করেছে, ~৪৭ ঘণ্টায় মৃত
  const left = Math.max(0, 46 - ageH);
  return `বয়স ${ageH.toFixed(1)}ঘ · আনুমানিক আরও ~${left.toFixed(0)}ঘ চলবে (পরীক্ষিত: ২৫ঘ ✓ / ৪৭ঘ ✗)`;
};

(async () => {
  if (process.argv[2] === '--status') {
    const a = acc();
    const ad = Number(new URLSearchParams(a.initData).get('auth_date')) * 1000;
    console.log('🔑 এখনকার লিংক:', new Date(ad).toISOString(), '·', ttlStr(ad));
    console.log('   pool-এ সংরক্ষিত:', (a.initDatas || []).length + (a.initDataPrev ? 1 : 0), 'টা পুরনো জেনারেশন');
    const r = await api.init(a.initData, a.start_param || a.tgId);
    console.log('   লগইন টেস্ট:', r.ok ? '✅ work করছে (🌿 ' + r.data.user.leaf + ')' : '❌ ' + r.message);
    return;
  }

  const raw = process.argv.slice(2).join(' ') || (fs.existsSync(path.join(ROOT, 'initdata.txt')) ? fs.readFileSync(path.join(ROOT, 'initdata.txt'), 'utf8') : '');
  const initData = parseLink(raw);
  if (!initData) return console.log('❌ লিংক পড়া গেল না। Usage: node tools/newlink.js "<leafearn.site/#tgWebAppData=... link>"');

  const uid = (() => { try { return String(JSON.parse(new URLSearchParams(initData).get('user') || '{}').id || ''); } catch { return ''; } })();
  const adMs = Number(new URLSearchParams(initData).get('auth_date')) * 1000;

  const a = acc();
  // Login test আগে
  const r = await api.init(initData, a.start_param || uid || a.tgId);
  console.log('🔑 নতুন লিংক:', uid ? 'tg ' + uid : '?', '·', new Date(adMs).toISOString(), '·', ttlStr(adMs));
  console.log('   লগইন টেস্ট:', r.ok ? '✅ পাস (🌿 ' + r.data.user.leaf + ' leaf)' : '⚠ ' + r.code + ' :: ' + r.message);
  if (!r.ok && !/reopen Leaf/i.test(r.message || '')) return console.log('   → লিংকটা আবার কপি করুন (পুরনো/অসম্পূর্ণ হতে পারে)');

  const pool = [...new Set([acc().initData, ...(a.initDatas || []), a.initDataPrev].filter((x) => x && x !== initData))];
  a.initDatas = pool.slice(0, 4);
  a.initDataPrev = pool[0] || '';
  a.initData = initData;
  a.tgId = uid || a.tgId;
  a.start_param = a.start_param || uid;
  a.updatedAt = new Date().toISOString();
  save(a);
  console.log('   💾 সেভ ✓ (pool: ' + (a.initDatas.length + 1) + ' জেনারেশন)');
  console.log('   ▶ চালাও:  SAFETY_WAIT=1 GV_WAIT=1 node leafmine.js autopilot');
})().catch((e) => console.error('ERR', e.message));
