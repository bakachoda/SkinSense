const http = require('http');
http.get('http://127.0.0.1:8081', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const match = d.match(/<script id="_expo-static-error"[^>]*>([\s\S]*?)<\/script>/);
    if (match) {
      const err = JSON.parse(match[1]);
      console.log('Error logs:');
      err.logs.forEach(l => {
        console.log(l.message);
        if (l.symbolicated?.stack) {
          console.log(l.symbolicated.stack.stack?.slice(0, 5));
        }
      });
    } else {
      console.log('Body:', d.slice(0, 1000));
    }
  });
});
