const { api, loadSigner } = require('../lib/leafapi');
const { id, acc } = require('./_acc');
(async () => {
  let r = await api.init(id, acc.start_param || acc.tgId || '');
  console.log('init:', r.ok ? 'OK leaf=' + r.data.user.leaf : r.code + ' :: ' + r.message);
  if (!r.ok && /reopen|close/i.test(r.message || '')) {
    console.log('signer রিফ্রেশ করছি…');
    await loadSigner(true).catch(e => console.log('refresh err', e.message));
    const m = require('fs').existsSync(require('path').join(__dirname,'..','config','tone.meta.json')) ? JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'..','config','tone.meta.json'),'utf8')) : {};
    console.log('নতুন wasm:', m.url || '?');
    r = await api.init(id, acc.start_param || acc.tgId || '');
    console.log('init retry:', r.ok ? 'OK leaf=' + r.data.user.leaf : r.code + ' :: ' + r.message);
  }
})();
