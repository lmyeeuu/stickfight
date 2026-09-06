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
const path = require('path');
const express = require('express');
const { ExpressPeerServer } = require('peer');

const PORT = process.env.PORT || process.env.WEB_PORT || 8080;
const PEER_PATH = process.env.PEER_PATH || '/peerjs';

const app = express();

/* static game files */
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json');
  }
}));

const server = http.createServer(app);

/* PeerJS signaling attached to the SAME http server (single port) */
const peerServer = ExpressPeerServer(server, {
  allow_discovery: false,
  proxied: true
});
app.use(PEER_PATH, peerServer);

server.listen(PORT, () => {
  console.log('──────────────────────────────────────────────');
  console.log('  STICK BATTLE server started');
  console.log('  Game page:      http://localhost:' + PORT);
  console.log('  PeerJS server:  ws(s)://<this-host>:' + PORT + PEER_PATH);
  console.log('──────────────────────────────────────────────');
});
