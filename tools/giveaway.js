#!/usr/bin/env node
// giveaway.js — 🎁 Telegram Premium Giveaway অটো-রানার (নতুন ফিচার, 2026-10-02)
//
// সার্ভার ফ্লো (ফ্রন্টএন্ড-হুবহু, leaf.v1.GiveawayService):
//   Status → StartAd{token, step, network, format, unit} → অ্যাড শো (Adsgram/Monetag)
//   → CompleteAd{token, ads_shown, ads_clicked} → points_added / cycle_done / elite_unlocked
//
// যত বেশি অ্যাড = তত বেশি points = তত বেশি chance (elite tier আনলক হলে বোনাস)।
// সার্ভার নিজেই break/cooldown দেয় (break_until_ms / cooldown_until_ms) — তার আগে আর অ্যাড চলবে না।
//
// ব্যবহার:
//   node tools/giveaway.js                 # স্ট্যাটাস + যখন যা পারবে অ্যাড দেখবে (ডিফল্ট ৩০)
//   ADS=60 node tools/giveaway.js          # সর্বোচ্চ ৬০টা অ্যাড
//   LEADER=1 node tools/giveaway.js        # লিডারবোর্ডও দেখাও
//   BUY=BOOST node tools/giveaway.js       # (ঐচ্ছিক) বুস্টার কেনো — 2× points, পরের advertising-এ
//   BUY=RESET node tools/giveaway.js       # (ঐচ্ছিক) wait skip
//   WATCH=1 node tools/giveaway.js         # কেবল স্ট্যাটাস, অ্যাড না দেখে
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { api } = require(path.join(ROOT, 'lib/leafapi.js'));
const adsMod = require(path.join(ROOT, 'lib/adsgram.js'));
const { notifyTelegram } = require(path.join(ROOT, 'lib/leafapi.js'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toISOString().slice(11, 19);
const fmtLeft = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + ss + 's';
};
const WHEN = (ms) => (ms > 0 ? new Date(Number(ms)).toISOString().slice(5, 16).replace('T', ' ') : '-');

function printStatus(st, log) {
  const L = log || ((m) => console.log(m));
  if (!st || !st.has_event) { L('⚠ এই মুহূর্তে কোনো giveaway ইভেন্ট নেই (has_event=false)'); return; }
  L('🎁 ' + (st.title || 'Telegram Premium Giveaway') + '  [event #' + st.event_id + ']');
  L('   ⏱ ' + WHEN(st.starts_at_ms) + ' → ' + WHEN(st.ends_at_ms) + ' UTC');
  L('   ⭐ points: ' + st.points + ' · rank #' + st.rank + ' / ' + st.participants + ' জন');
  L('   🔁 cycles: ' + st.cycles + ' · step: ' + st.step + (st.elite ? ' · 🏆 ELITE active (cycles ' + st.elite_cycles + ')' : ''));
  if (st.break_until_ms > 0) L('   ⏸ break চলছে → ' + fmtLeft(Number(st.break_until_ms) - Date.now()) + ' পরে খুলবে');
  if (st.cooldown_until_ms > 0) L('   🕒 cooldown → ' + fmtLeft(Number(st.cooldown_until_ms) - Date.now()) + ' পরে');
  if (st.boost_cycles > 0) L('   ⚡ booster active — বাকি ' + st.boost_cycles + ' cycle');
  L('   💰 reset price: ' + (st.reset_price || 0) + ' leaf (বাকি ' + (st.resets_left || 0) + ') · boost price: ' + (st.boost_price || 0) + ' leaf (বাকি ' + (st.boosts_left || 0) + ')');
  const steps = st.steps || [];
  if (steps.length) L('   📋 cycle-এর ধাপ: ' + steps.map((x, i) => (i + 1) + ') ' + x.network + '/' + x.format + ' +' + x.points).join('  '));
  return st;
}

async function runGiveaway(id, opts = {}, log) {
  const L = log || ((m) => console.log(m));
  const maxAds = Number(opts.maxAds || process.env.ADS || 30);
  let st = (await api.giveawayStatus(id)).data || {};
  const okSt = await api.giveawayStatus(id);
  if (!okSt.ok) { L('⚠ Giveaway status ব্যর্থ: ' + okSt.code + ' ' + okSt.message); return { ok: false, message: okSt.message }; }
  st = okSt.data;
  printStatus(st, L);
  if (!st.has_event) return { ok: true, ads: 0, points: 0 };
  if (opts.statusOnly) return { ok: true, ads: 0, points: 0, status: st };

  // WAITBREAK=1: সার্ভারের break/cooldown শেষ হওয়া পর্যন্ত অপেক্ষা করে তারপর অ্যাড দেখে
  if (process.env.WAITBREAK === '1') {
    let guard = 0;
    while ((st.break_until_ms > Date.now() || st.cooldown_until_ms > Date.now()) && guard++ < 40) {
      const until = Math.max(Number(st.break_until_ms || 0), Number(st.cooldown_until_ms || 0));
      L('⏳ ' + fmtLeft(until - Date.now()) + ' অপেক্ষা… (break শেষ হলে অ্যাড শুরু)');
      await sleep(Math.min(90e3, Math.max(15e3, until - Date.now() + 3000)));
      const stx = await api.giveawayStatus(id);
      if (stx.ok && stx.data) st = stx.data;
    }
  }

  // ঐচ্ছিক পার্ক কেনাকাটা
  if (opts.buy) {
    const b = await api.giveawayBuy(id, String(opts.buy).toUpperCase());
    if (b.ok) { st = b.data.status || st; L('🛒 ' + String(opts.buy).toUpperCase() + ' কেনা হলো · balance ' + b.data.balance + ' leaf'); printStatus(st, L); }
    else L('⚠ buy ব্যর্থ: ' + (b.message || b.code));
  }

  // GV_WAIT=1 → MONETAG স্টেপে আটকালে অপেক্ষা করবে (আপনি ফোনে popup-টা দেখলেই সার্ভার স্টেপ এগিয়ে দেবে,
  // তারপর বট বাকি ADSGRAM স্টেপগুলো নিজেই করবে)। MONETAG-এর impression সার্ভার-সাইডে ভেরিফাই হয় —
  // ডেটাসেন্টার IP-তে Monetag ফিল দেয় না (yoszi.com/4/<zone> → 204), তাই ওই ২টা স্টেপে ফোন লাগে।
  const GV_WAIT = process.env.GV_WAIT === '1';
  const waitMin = Number(process.env.GV_WAIT_MIN || 45);
  let ads = 0, points = 0, noFill = 0, humanNudged = false;
  const deadline = Date.now() + waitMin * 60000;
  for (let i = 0; i < maxAds; i++) {
    if (st.break_until_ms > Date.now()) { L('⏸ break — ' + fmtLeft(Number(st.break_until_ms) - Date.now()) + ' পরে আবার চালান'); break; }
    if (st.cooldown_until_ms > Date.now()) { L('🕒 cooldown — ' + fmtLeft(Number(st.cooldown_until_ms) - Date.now()) + ' পরে'); break; }
    const sv = await api.giveawayStartAd(id);
    if (!sv.ok) {
      if (/no_ad/i.test(sv.message || '')) noFill++;
      L('⚠ StartAd ব্যর্থ: ' + sv.message + (noFill >= 2 ? ' — অ্যাড ইনভেন্টরি নেই, পরে চেষ্টা করুন' : ''));
      if (noFill >= 2) break;
      await sleep(4000); continue;
    }
    const t = sv.data;
    if (t.network === 'MONETAG') {
      // ফোনে দেখতে হবে — কয়েকবার চেষ্টা করে তারপর অপেক্ষা
      const cv0 = await api.giveawayCompleteAd(id, { token: t.token, ads_shown: 0, ads_clicked: 0 }).catch(() => ({ ok: false }));
      if (!cv0.ok) {
        if (!humanNudged || ads === 0) {
          humanNudged = true;
          if (!global.__gvNotifyAt || Date.now() - global.__gvNotifyAt > 30 * 60e3) {
            global.__gvNotifyAt = Date.now();
            notifyTelegram && notifyTelegram('🎁 <b>Leaf Giveaway: ফোনে ২টা popup দেখুন</b>\nসাইকেলের ধাপ ' + (t.step + 1) + ' MONETAG — ডেটাসেন্টার থেকে ফিল আসে না।\nফোনে Leaf → 🎁 Giveaway → "Watch ad" ২বার চাপুন; বাকি ১২টা Adsgram ভিউ বট নিজেই করবে।').catch(() => {});
          }
          L('📱 এই স্টেপটা (' + (t.step + 1) + ') MONETAG popup — সার্ভার ফোনের impression ছাড়া মানে না।');
          L('   👉 ফোনে Leaf অ্যাপ → 🎁 Giveaway → "Watch ad" চেপে popup-টা ২-৩ সেকেন্ড দেখুন।');
          L('   ⏳ বট ' + waitMin + ' মিনিট অপেক্ষা করবে — আপনি দেখলেই স্টেপ এগিয়ে যাবে, তারপর Adsgram-এর ১২টা স্টেপ বট নিজেই করবে।');
        }
        if (!GV_WAIT || Date.now() > deadline) { L('   (GV_WAIT=1 দিলে বট অপেক্ষা করে অটো এগিয়ে যাবে)'); break; }
        await sleep(15000);
        const st2 = await api.giveawayStatus(id);
        if (st2.ok && st2.data) {
          st = st2.data;
          if (st.step > t.step) { L('✅ স্টেপ এগোলো → step ' + (st.step + 1) + ' (points ' + st.points + ')'); humanNudged = false; noFill = 0; continue; }
        }
        i--; continue;   // লুপ-কাউন্ট ফেরত
      }
      ads++; points += Number(cv0.data.points_added || 0);
      if (cv0.data.status) st = cv0.data.status;
      L('  [' + ads + '/' + maxAds + '] +' + cv0.data.points_added + ' pts (MONETAG) · total ' + st.points + ' · rank #' + st.rank);
      await sleep(1200); continue;
    }
    const show = await adsMod.doAdShow(id, t.unit || '48006');
    if (!show.ok) {
      L('📵 অ্যাড শো ব্যর্থ (' + (show.noFill ? 'no fill' : (show.error || 'fail')) + ') — ' + t.network + '/' + t.format + ', পরে আবার');
      noFill++;
      if (noFill >= 2) break;
      await sleep(5000); continue;
    }
    noFill = 0;
    const cv = await api.giveawayCompleteAd(id, { token: t.token, ads_shown: 1, ads_clicked: 1 });
    if (!cv.ok) {
      L('⚠ CompleteAd ব্যর্থ: ' + cv.message);
      if (cv.safety) { L('🛡 safety গেট — কোড দিন (Safety Console / node tools/safety.js <CODE>)'); }
      if (/safety/i.test(cv.message || '')) break;
      await sleep(3000); continue;
    }
    ads++; points += Number(cv.data.points_added || 0);
    if (cv.data.status) st = cv.data.status;
    const tags = [];
    if (cv.data.cycle_done) {
      tags.push('✅ CYCLE DONE');
      notifyTelegram && notifyTelegram('🎉 <b>Giveaway সাইকেল সম্পূর্ণ!</b>\npoints ' + st.points + ' · rank #' + st.rank + '/' + st.participants + '\nনতুন সাইকেল শুরু — প্রথম ২টা popup আবার ফোনে দেখতে হবে।').catch(() => {});
    }
    if (cv.data.elite_unlocked) tags.push('🏆 ELITE UNLOCKED!');
    L('  [' + ads + '/' + maxAds + '] +' + cv.data.points_added + ' pts (' + t.network + '/' + t.format + ') · total ' + st.points + ' · rank #' + st.rank +
      (st.boost_cycles > 0 ? ' ⚡' + st.boost_cycles : '') + (tags.length ? '  ' + tags.join(' ') : ''));
    await sleep(1200 + Math.random() * 1200);
  }
  L('🎁 giveaway রান শেষ — অ্যাড ' + ads + 'টা · points +' + points + ' · মোট ' + (st.points || 0) + ' · rank #' + st.rank + ' / ' + st.participants);
  if (st.break_until_ms > Date.now()) L('   পরের সুযোগ: ' + fmtLeft(Number(st.break_until_ms) - Date.now()) + ' পরে');
  return { ok: true, ads, points, status: st };
}

module.exports = { runGiveaway, printStatus };

// ── CLI ──
if (require.main === module) {
  (async () => {
    const { id } = require('./_acc');
    if (process.env.LEADER === '1') {
      const lb = await api.giveawayLeaderboard(id);
      if (lb.ok) {
        console.log('🏅 লিডারবোর্ড — আপনি #' + lb.data.my_rank + ' (' + lb.data.my_points + ' pts) / ' + lb.data.participants + ' জন');
        for (const r of (lb.data.rows || []).slice(0, 10)) console.log('   #' + String(r.rank).padEnd(4), String(r.name).padEnd(20), r.points + ' pts', r.me ? '  ← আপনি' : '');
      } else console.log('leaderboard ব্যর্থ:', lb.message);
    }
    await runGiveaway(id, { maxAds: process.env.ADS, buy: process.env.BUY, statusOnly: process.env.WATCH === '1' });
  })().catch((e) => console.error('ERR', e.message));
}
