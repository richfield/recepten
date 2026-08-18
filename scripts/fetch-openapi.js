const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/richfield/receptenApi/main/openapi.json';
const out = path.join(process.cwd(), 'src', 'api', 'openapi.json');

fs.mkdirSync(path.dirname(out), { recursive: true });

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to fetch openapi.json, status', res.statusCode);
    process.exit(1);
  }
  const file = fs.createWriteStream(out);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Saved openapi.json to', out);
  });
}).on('error', (err) => {
  console.error('Error fetching openapi.json:', err);
  process.exit(1);
});
