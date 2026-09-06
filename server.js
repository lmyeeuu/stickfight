/* ============================================================
   STICK BATTLE — self-hosted server (single-port mode)
   ------------------------------------------------------------
   Serves the game page AND runs the PeerJS signaling server on
   ONE port, so a single deployment gives you both:
     - https://<your-domain>/            game page
     - wss://<your-domain>/peerjs        PeerJS signaling

   Works on local LAN, VPS, or any Node.js platform (Zeabur,
   Render, Railway, Fly.io...) that injects a PORT env var.

   Usage:
     npm install
     npm start

   Local LAN test:
     open http://localhost:8080 on both devices,
     create room on one, join with the code on the other.

   ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PeerServer } = require('peer');

const PORT = process.env.PORT || process.env.WEB_PORT || 8080;
const PEER_PATH = process.env.PEER_PATH || '/peerjs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

/* PeerJS signaling attached to the SAME http server (single port) */
const peerServer = PeerServer({
  server: server,
  path: PEER_PATH,
  allow_discovery: false
});
peerServer.on('connection', () => {});
peerServer.on('disconnect', () => {});

server.listen(PORT, () => {
  console.log('──────────────────────────────────────────────');
  console.log('  STICK BATTLE server started');
  console.log('  Game page:      http://localhost:' + PORT);
  console.log('  PeerJS server:  ws(s)://<this-host>:' + PORT + PEER_PATH);
  console.log('──────────────────────────────────────────────');
});
