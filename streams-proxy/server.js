// Inspired from https://gist.github.com/sixertoy/6b5433220a45aa754354287ff54a1e2a

import { promisify } from 'node:util';
import stream from 'node:stream';
import got from 'got';

import os from 'os';
import dns from 'dns';
import express from 'express';
import cors from 'cors';

const serverPort = (process.env.PORT || process.env.PROXY_PORT || 3000);

const app = express();
const hostname = os.hostname();
const pipeline = promisify(stream.pipeline);

const corsOptions = {
  origin: process.env.PROXY_CORS || false,
  preflightContinue: true,
  methods: 'GET, HEAD'
}

app.options('/', cors(corsOptions));

app.get('/', cors(corsOptions), async (req, res) => {
  process.stdout.write(`Request: ${req.query.stream}\n`);

  try {
    await pipeline(
      got.stream(req.query.stream),
      res
    ).catch(() => {
      res.end();
    });
  }
  catch (error) {
    res.status(500).send('Error');
  }
});

app.listen(serverPort, () => {
  dns.lookup(hostname, (err, ip) => {
    // retrieve network local ip
    process.stdout.write('Audio Proxy Server runs under\n');
    process.stdout.write(`  Local:        http://localhost:${serverPort}\n`);
    process.stdout.write(`  Home Network: http://${ip}:${serverPort}\n`);
  });
});
