const fs = require('fs');
const https = require('https');
const dest = 'C:\\Users\\rog\\.expo\\android-apk-cache\\Expo-Go-2.32.20-real.apk';

console.log('Downloading real Expo-Go-2.32.20.apk...');
function get(url) {
  https.get(url, { headers: { 'User-Agent': 'node.js' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location.slice(0, 100));
      get(res.headers.location);
      return;
    }
    const file = fs.createWriteStream(dest);
    let downloaded = 0;
    const total = parseInt(res.headers['content-length'] || '0', 10);
    res.on('data', chunk => {
      downloaded += chunk.length;
      if (Math.random() < 0.05) {
        process.stdout.write(`\rDownloaded ${(downloaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB`);
      }
    });
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('\nDownload complete! File saved to:', dest);
    });
  }).on('error', err => {
    console.error('Download error:', err.message);
  });
}

get('https://github.com/expo/expo-go-releases/releases/download/Expo-Go-2.32.20/Expo-Go-2.32.20.apk');
