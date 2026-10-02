// tasks.js — সব মিশন/অ্যাড-টাস্কের অবস্থা
const { api } = require('../lib/leafapi');
const { id } = require('./_acc');
(async () => {
  const ts = await api.tasks(id);
  for (const t of ts.data.tasks || []) {
    console.log(
      String(t.type).padEnd(9), '|', String(t.title).padEnd(32),
      '| done', t.completed ? 'Y' : 'n',
      '| views', (t.views_used || 0) + '/' + (t.max_views || 0),
      '| tries', (t.tries_used || 0) + '/' + (t.tries_required || 0),
      '| locked', t.locked ? 'Y' : 'n',
      '| reset', t.next_reset_at_ms ? new Date(Number(t.next_reset_at_ms)).toISOString() : '-'
    );
  }
})().catch((e) => console.error('ERR', e.message));
