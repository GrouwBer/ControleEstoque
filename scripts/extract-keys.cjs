const fs = require('fs');
const keys = JSON.parse(fs.readFileSync('supabase/.temp/keys.json', 'utf8'));
const anon = keys.find(k => k.name === 'anon').api_key;
const service = keys.find(k => k.name === 'service_role').api_key;
console.log(`NEXT_PUBLIC_SUPABASE_URL=https://aigzjdtktqntkouzcmyf.supabase.co`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=${service}`);
