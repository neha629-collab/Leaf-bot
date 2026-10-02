#!/usr/bin/env node
// refstats.js — আপনার REAL রেফারেল স্ট্যাটাস (read-only)
//   node tools/refstats.js
// দেখায়: কতজন জয়েন করেছে, কতজন active, কমিশন কত, টপ ইনভাইটারদের সাথে তুলনা
'use strict';
const path = require('path');
const { api } = require(path.join(__dirname, '..', 'lib/leafapi.js'));
const { id } = require('./_acc');

const REF_LINK = 'https://t.me/LeafEarnBot/app?startapp=1692540458';

(async () => {
  const [sy, mr] = await Promise.all([api.sync(id).catch(() => null), api.myReferrals(id).catch(() => null)]);
  const u = (sy && sy.ok && sy.data.user) || {};
  console.log('── আপনার অ্যাকাউন্ট ──');
  console.log('  👤', u.username ? '@' + u.username : u.first_name, '· 🌿', u.leaf, 'leaf');
  console.log('  👥 মোট রেফারেল:', u.referral_count, '| ✅ active:', u.referral_active, '| ⏳ pending:', u.referral_pending);
  console.log('  💰 কমিশন আয়:', u.commission_earned, 'leaf');
  console.log('\n── রেফারেল লিস্ট ──');
  const rows = (mr && mr.ok && (mr.data.referrals || mr.data.rows)) || [];
  if (!rows.length) console.log('  (কোনো ডেটা নেই)');
  for (const r of rows) {
    console.log('  •', String(r.name ? (String(r.name).startsWith('@') ? r.name : '@' + r.name) : 'tg:' + r.tg_id).padEnd(24),
      '| active:', r.active ? '✅' : '⏳', '| আয়:', (r.earned || 0) + ' leaf',
      '| জয়েন:', r.joined_at_ms ? new Date(Number(r.joined_at_ms)).toISOString().slice(0, 10) : '-');
  }
  if (mr && mr.ok && mr.data.total !== undefined) console.log('  মোট:', mr.data.total, '| active:', mr.data.active);
  const ti = await api.topInviters(id).catch(() => null);
  const top = (ti && ti.ok && (ti.data.leaders || ti.data.inviters || ti.data.rows)) || [];
  if (top.length) {
    console.log('\n── টপ ইনভাইটার (তুলনা) ──');
    top.slice(0, 5).forEach((t, i) => console.log('  #' + (i + 1), String(t.name || t.tg_id).padEnd(24), '→', t.active_count ?? '-', 'active'));
  }
  if (ti && ti.ok && ti.data.your_rank) console.log('  📊 আপনার র‍্যাংক:', ti.data.your_rank, '(active:', ti.data.your_active_count + ')');
  console.log('\n🔗 আপনার ইনভাইট লিংক:\n  ' + REF_LINK);
  console.log('   (যে নিজে ক্লিক করে জয়েন করবে — সে-ই আপনার সেফ রেফারেল)');
  console.log('\n📄 প্রোমো পেজ: invite/index.html (কপি/শেয়ার বাটন সহ)');
})().catch((e) => console.error('ERR', e.message));
