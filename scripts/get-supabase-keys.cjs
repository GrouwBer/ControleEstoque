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
  // Get project settings
  const project = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf');
  console.log('PROJECT:', JSON.stringify(project, null, 2).substring(0, 500));
  
  // Get API keys
  const keys = await get('https://api.supabase.com/v1/projects/aigzjdtktqntkouzcmyf/api-keys');
  const anon = keys.find(k => k.name === 'anon');
  console.log('\nANON_KEY:', JSON.stringify(anon, null, 2));
  
  // Write env
  const envContent = [
    `NEXT_PUBLIC_SUPABASE_URL=https://aigzjdtktqntkouzcmyf.supabase.co`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon.api_key}`,
  ].join('\n');
  require('fs').writeFileSync('supabase/.temp/env.txt', envContent);
  console.log('\nEnv written!');
  console.log(envContent);
}

main().catch(console.error);
