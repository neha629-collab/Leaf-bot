// safety.js — Quick Safety Check হেল্পার
//   node tools/safety.js            → স্টেটাস দেখাও (কোড না থাকলে নতুন কোড চেয়ে পাঠাও)
//   node tools/safety.js 1234       → কোড ভেরিফাই করো
const { api } = require('../lib/leafapi');
const { id } = require('./_acc');
(async () => {
  const st = await api.safetyStatus(id);
  console.log('safety:', JSON.stringify(st.data || st));
  if (process.argv[2]) {
    const v = await api.verifySafetyCheck(id, process.argv[2]);
    console.log('verify:', JSON.stringify(v.data || v));
  } else if (!st.data || (!st.data.passed && !(st.data.code_left_sec > 0))) {
    const sd = await api.sendSafetyCheck(id);
    console.log('sent:', JSON.stringify(sd.data || sd));
  }
})().catch((e) => console.error('ERR', e.message));
