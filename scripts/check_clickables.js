const fs = require('fs');
const { execSync } = require('child_process');
execSync('adb exec-out uiautomator dump /dev/tty > dump.xml', { stdio: 'ignore' });
execSync('adb pull /sdcard/window_dump.xml dump.xml', { stdio: 'ignore' });
const xml = fs.readFileSync('dump.xml', 'utf8');
const regex = /<node[^>]*?clickable="true"[\s\S]*?bounds="(\[[0-9,]+\]\[[0-9,]+\])"/g;
let m;
while ((m = regex.exec(xml)) !== null) {
  const snippet = m[0].replace(/\s+/g, ' ');
  const textMatch = snippet.match(/text="([^"]*)"/);
  const descMatch = snippet.match(/content-desc="([^"]*)"/);
  console.log(textMatch ? textMatch[1] : (descMatch ? descMatch[1] : 'NoText'), '-->', m[1]);
}
