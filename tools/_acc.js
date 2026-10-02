const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const acc = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/accounts/main.json'), 'utf8'));
module.exports = { id: acc.initData, acc, ROOT };
