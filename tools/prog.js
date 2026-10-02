// prog.js — এক নজরে সব প্রোগ্রেস (ব্যালেন্স, মাইন, স্পিন, গেম-স্লট, পেন্ডিং, কুইক)
const { api } = require('../lib/leafapi');
const { id } = require('./_acc');
(async () => {
  const sy = await api.sync(id); const u = sy.data.user;
  const ms = await api.mineStatus(id);
  const sp = await api.spinStatus(id);
  console.log('balance:', u.leaf,
    '| mine:', ms.data.mined + ' pts (' + Math.floor(ms.data.mined / 12) + '/25 taps)',
    '| next mine:', ms.data.next_mine_at_ms ? new Date(Number(ms.data.next_mine_at_ms)).toISOString().slice(11, 16) : '-',
    '| spin:', sp.data.can_spin ? 'READY' : 'done');
  for (const g of ['TIC_TAC_TOE', 'WORD_SEARCH', 'SNAKE', 'SHOOTER', 'BLOCK_BREAKER']) {
    const r = await api.runStatus(id, g);
    console.log('  ' + g.padEnd(14),
      r.ok ? 'slots ' + r.data.slots_used + '/' + r.data.slots_cap + ' · played ' + r.data.played_total +
        ' · next ' + (r.data.next_slot_at_ms ? new Date(Number(r.data.next_slot_at_ms)).toISOString().slice(11, 16) : '-')
        : r.message);
  }
  const cp = await api.claimsPending(id);
  console.log('pending claims:', JSON.stringify(cp.data.rows || []));
  const q = await api.quickStatus(id);
  console.log('quick offer:', JSON.stringify(q.data).slice(0, 220));
  const a = await api.activity(id, 5);
  for (const e of a.data.entries || []) {
    console.log('  act:', new Date(Number(e.created_at_ms)).toISOString().slice(5, 16), e.title, e.delta);
  }
})().catch((e) => console.error('ERR', e.message));
