const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Betting Game</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; background-color: #f0f0f0; border-radius: 4px; margin-bottom: 20px; }
        .success { background-color: #dff0d8; color: #3c763d; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Betting Game</h1>
        <div class="status success">
          <p>Client server is running successfully!</p>
          <p>The backend API should be available at: <a href="http://localhost:3001">http://localhost:3001</a></p>
        </div>
        <div>
          <h2>Environment Variables:</h2>
          <pre>${JSON.stringify(process.env, null, 2)}</pre>
        </div>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
}); 