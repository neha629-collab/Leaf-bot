#!/usr/bin/env node
// safety-console.js — 🛡 Quick Safety Check কনসোল (ওয়েব UI)
// Leaf-এর অ্যান্টি-বট গেট (৪-ডিজিট OTP) এলে এই পেজ খুলে কোডটা টাইপ করলেই বট আবার চালু।
//   চালাও:  node tools/safety-console.js          (ডিফল্ট পোর্ট 8099)
//           PORT=9000 node tools/safety-console.js
//
// ⚠️ কী সম্ভব আর কী সম্ভব নয়:
//   • সার্ভার কোডটা আপনার Telegram-এ (@LeafEarnBot) পাঠায় — শুধু আপনি পড়তে পারেন।
//     বট কল করা, অটো-রিড করা বা OTP বাইপাস করা সম্ভব নয় (আর চেষ্টা করলে অ্যাকাউন্ট ব্যান ঝুঁকি)।
//   • যা করা যায়: চাহিদা এলে সাথে সাথে জানানো, এক ক্লিকে নতুন কোড চাওয়া, আর কোড দিন → সাথে সাথে resume।
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { api } = require(path.join(ROOT, 'lib/leafapi.js'));

const PORT = Number(process.env.PORT || 8099);
const ACC_FILE = path.join(ROOT, 'config/accounts/main.json');
const STATE_FILE = path.join(ROOT, 'config/console-state.json');

function acc() { try { return JSON.parse(fs.readFileSync(ACC_FILE, 'utf8')); } catch { return {}; } }
function id() { return acc().initData || ''; }
function readState() { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; } }
function writeState(o) { try { fs.writeFileSync(STATE_FILE, JSON.stringify(o, null, 2)); } catch {} }

async function snapshot() {
  const initData = id();
  const out = { ok: false, at: new Date().toISOString() };
  if (!initData) return { ...out, error: 'initData নেই (config/accounts/main.json)' };
  try {
    const [st, sy, ms] = await Promise.all([
      api.safetyStatus(initData).catch(() => null),
      api.sync(initData).catch(() => null),
      api.mineStatus(initData).catch(() => null),
    ]);
    const d = (st && st.ok && st.data) || {};
    out.ok = true;
    out.safety = { passed: !!d.passed, code_left_sec: d.code_left_sec || 0, resend_in_sec: d.resend_in_sec || 0, reward: d.reward || 0 };
    out.balance = sy && sy.ok ? sy.data.user.leaf : null;
    out.mine = ms && ms.ok ? { gift: ms.data.gift, mined: ms.data.mined, taps: Math.floor((ms.data.mined || 0) / 12), next_mine_at_ms: Number(ms.data.next_mine_at_ms || 0) } : null;
    out.lastVerify = readState().lastVerify || '';
    // INITDATA_POOL_V1: লিংকের বয়স (TTL ~২৪-৪৮ঘ পরীক্ষিত) — সময়মতো নতুন লিংক নেওয়ার জন্য
    try {
      const adMs = Number(new URLSearchParams(initData).get('auth_date')) * 1000;
      const ageH = (Date.now() - adMs) / 3600e3;
      out.link = { ageH: Number(ageH.toFixed(1)), warn: ageH > 24, dead: ageH > 46, poolSize: (acc().initDatas || []).length + 1 };
    } catch {}

  } catch (e) { out.error = e.message; }
  return out;
}

const html = (s) => `<!doctype html><html lang="bn"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LeafEarn · Safety Console</title></head>
<body style="margin:0;background:#0f1720;color:#e8eef5;font:15px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:18px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <div style="width:38px;height:38px;border-radius:10px;background:#1d2733;display:flex;align-items:center;justify-content:center;font-size:20px">🛡</div>
    <div><div style="font-weight:700;font-size:17px">LeafEarn · Safety Console</div>
    <div style="color:#7d8b99;font-size:13px">Quick Safety Check টুল — কোড দিলেই বট সাথে সাথে চালু</div></div>
  </div>
  <div id="st" style="background:#151e27;border:1px solid #22303d;border-radius:14px;padding:14px;margin-bottom:12px">
    <div id="banner" style="font-size:16px;font-weight:700">লোড হচ্ছে…</div>
    <div id="sub" style="color:#8b98a5;font-size:13px;margin-top:4px"></div>
    <div id="info" style="margin-top:10px;font-size:13px;color:#9fb0c0"></div>
  </div>
  <div style="background:#151e27;border:1px solid #22303d;border-radius:14px;padding:14px">
    <div style="font-weight:600;margin-bottom:8px">Telegram-এ @LeafEarnBot-এর মেসেজ থেকে ৪-ডিজিট কোড দিন</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="1234"
        style="flex:1;min-width:140px;padding:12px;border-radius:10px;border:1px solid #2b3a49;background:#0c141c;color:#fff;font-size:20px;letter-spacing:6px;text-align:center">
      <button onclick="verify()" style="padding:12px 18px;border:0;border-radius:10px;background:#229af0;color:#fff;font-weight:700;font-size:15px;cursor:pointer">Verify ✓</button>
      <button onclick="send()" style="padding:12px 16px;border:1px solid #2b3a49;border-radius:10px;background:#1b2733;color:#cfe0ee;font-weight:600;cursor:pointer">নতুন কোড পাঠাও</button>
    </div>
    <div id="msg" style="margin-top:10px;font-size:14px;min-height:20px"></div>
    <div style="margin-top:10px;color:#6f7d8b;font-size:12.5px">
      কোড মেয়াদ ~৫ মিনিট। পাস হলে <b>+50 leaf</b> ও বাকি সব কাজ (মাইন/অ্যাড/গেম) নিজে থেকেই চালু হবে।
      ফোনে Leaf অ্যাপ খুলে কোড দিলেও বট resume করে — এটা বিকল্প।
    </div>
  </div>
  <div style="color:#5d6b78;font-size:12px;margin-top:12px">অটো-রিফ্রেশ প্রতি ৫s · সার্ভার: leafearn.site</div>
</div>
<script>
async function j(u,o){const r=await fetch(u,o);return r.json()}
async function load(){
  const s = await j('api/status');
  const b=document.getElementById('banner'), sub=document.getElementById('sub'), inf=document.getElementById('info');
  if(!s.ok){b.textContent='⚠ '+ (s.error||'connect সমস্যা'); sub.textContent=''; return}
  if(s.safety.passed){b.innerHTML='✅ Safety Check পাস — বট স্বাভাবিকভাবে চলছে'; b.style.color='#5ddc8a';}
  else if(s.safety.code_left_sec>0){b.innerHTML='⏳ কোড দরকার — Telegram-এ @LeafEarnBot দেখুন'; b.style.color='#ffd166';}
  else {b.innerHTML='📩 কোড পাঠানো হয়নি — “নতুন কোড পাঠাও” চাপুন'; b.style.color='#7fb3ff';}
  sub.textContent = s.safety.passed ? 'কিছু করার দরকার নেই' : (s.safety.code_left_sec>0 ? ('কোডের মেয়াদ '+s.safety.code_left_sec+'s · রিসেন্ড '+s.safety.resend_in_sec+'s পর') : '');
  let extra = [];
  if(s.balance!==null) extra.push('🌿 '+s.balance+' leaf');
  if(s.mine) extra.push('🎁 '+s.mine.gift+' '+s.mine.mined+' pts ('+s.mine.taps+'/25 taps)');
  if(s.lastVerify) extra.push('শেষ verify: '+new Date(s.lastVerify).toLocaleTimeString());
  if(s.link){ extra.push('🔑 লিংক: '+s.link.ageH+'ঘ পুরনো'+(s.link.dead?' — <b style="color:#ff8080">এক্সপায়ার! নতুন লিংক দিন</b>':(s.link.warn?' — <b style="color:#ffd166">শীঘ্রই নতুন লাগবে</b>':''))+' · pool '+s.link.poolSize+'টা'); }
  inf.textContent = extra.join('  ·  ');
}
async function verify(){
  const c=document.getElementById('code').value.trim();
  document.getElementById('msg').textContent='যাচাই করছি…';
  const r=await j('api/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:c})});
  document.getElementById('msg').innerHTML = r.ok ? '✅ পাস! +'+(r.reward||0)+' leaf — কাজ চালু' : '❌ '+(r.error||r.reason||'হয়নি');
  document.getElementById('code').value='';
  load();
}
async function send(){
  document.getElementById('msg').textContent='কোড চাওয়া হচ্ছে…';
  const r=await j('api/send',{method:'POST'});
  document.getElementById('msg').innerHTML = r.ok ? '📩 Telegram-এ কোড পাঠানো হয়েছে (@LeafEarnBot)' : '❌ '+(r.error||r.reason||'হয়নি');
  load();
}
document.getElementById('code').addEventListener('keydown',e=>{if(e.key==='Enter')verify()});
load(); setInterval(load,5000);
</script></body></html>`;

const server = http.createServer(async (req, res) => {
  const send = (code, body, type) => {
    res.writeHead(code, { 'content-type': type || 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  };
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/index'))) return send(200, html(), 'text/html; charset=utf-8');
    if (req.method === 'GET' && req.url.startsWith('/api/status')) return send(200, await snapshot());
    if (req.method === 'POST' && req.url.startsWith('/api/send')) {
      const sd = await api.sendSafetyCheck(id());
      return send(200, sd.ok ? { ok: true, ...(sd.data || {}) } : { ok: false, error: sd.message });
    }
    if (req.method === 'POST' && req.url.startsWith('/api/verify')) {
      let body = '';
      for await (const c of req) body += c;
      let code = '';
      try { code = String(JSON.parse(body || '{}').code || '').replace(/\D/g, ''); } catch {}
      if (!/^\d{4,8}$/.test(code)) return send(400, { ok: false, error: 'কোড ৪-৮ ডিজিটের হতে হবে' });
      const v = await api.verifySafetyCheck(id(), code);
      if (!v.ok) return send(200, { ok: false, error: v.message });
      const d = v.data || {};
      if (d.ok) {
        const st = readState(); st.lastVerify = new Date().toISOString(); writeState(st);
        const { clearSafety } = require(path.join(ROOT, 'lib/leafapi.js'));
        try { let uid = acc().tgId ? String(acc().tgId) : ''; if (!uid) { try { uid = String(JSON.parse(new URLSearchParams(acc().initData).get('user') || '{}').id || ''); } catch {} } if (uid) clearSafety(uid); } catch {}
        return send(200, { ok: true, reward: d.reward || 0 });
      }
      const why = d.reason === 'wrong' ? ('ভুল কোড — আর ' + (d.attempts_left || 0) + ' বার বাকি')
        : d.reason === 'locked' ? ('অনেকবার ভুল — ' + (d.resend_in_sec || 0) + 's পরে নতুন কোড')
        : 'কোডের মেয়াদ শেষ — নতুন কোড নিন';
      return send(200, { ok: false, reason: d.reason, error: why });
    }
    return send(404, { error: 'not found' });
  } catch (e) { return send(500, { error: e.message }); }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🛡 Safety Console চালু → http://0.0.0.0:' + PORT + '  (preview লিংক দিয়ে খুলুন)');
});
