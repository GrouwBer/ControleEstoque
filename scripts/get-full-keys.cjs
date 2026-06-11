const SUPABASE_PAT = require('fs').readFileSync('supabase/.temp/pat.txt', 'utf8').trim();
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Authorization': `Bearer ${SUPABASE_PAT}` } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const keys = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/api-keys');
  const anon = keys.find(k => k.name === 'anon').api_key;
  const service = keys.find(k => k.name === 'service_role').api_key;
  
  console.log('ANON:', anon);
  console.log('ANON len:', anon.length);
  console.log('SERVICE:', service);
  console.log('SERVICE len:', service.length);
  
  // Save to env file
  const env = [
    `NEXT_PUBLIC_SUPABASE_URL=https://aigzjdtktqntkouzcmyf.supabase.co`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
    `SUPABASE_SERVICE_ROLE_KEY=${service}`,
  ].join('\n');
  require('fs').writeFileSync('supabase/.temp/full-env.txt', env);
  console.log('\n--- ENV ---');
  console.log(env);
}

main().catch(console.error);
