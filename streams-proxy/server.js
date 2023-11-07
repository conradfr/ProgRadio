// Inspired from https://gist.github.com/sixertoy/6b5433220a45aa754354287ff54a1e2a

import { promisify } from 'node:util';
import stream from 'node:stream';
import got from 'got';

import os from 'os';
import dns from 'dns';
import express from 'express';
import cors from 'cors';

const serverPort = (process.env.PORT || process.env.PROXY_PORT || 3000);
const apiKeys = (process.env.KEYS || process.env.PROXY_KEYS || '').split(',');

const app = express();
const hostname = os.hostname();
const pipeline = promisify(stream.pipeline);

const corsOptions = {
  origin: (process.env.PROXY_CORS || '').split(',') || false,
  preflightContinue: true,
  methods: 'GET, HEAD'
}

app.options('/', cors(corsOptions));

app.get('/', cors(corsOptions), async (req, res) => {
  let apiKey = req.query.k;
  let apiKeyStatus = req.query.k ? req.query.k : 'none';

  if (apiKey) {
    if (apiKeys.indexOf(apiKey) !== -1) {
      apiKeyStatus = 'OK';
    } else {
      apiKeyStatus = 'wrong';
    }
  }

  process.stdout.write(`Request: ${req.query.stream} (key: ${apiKey}, status: ${apiKeyStatus})\n`);

  if (apiKeyStatus !== 'OK') {
    process.stdout.write(`Rejected: ${req.query.stream} (no key)\n`);
    res.status(500).send('Error');
    return;
  }

  try {
    await pipeline(
      got.stream(req.query.stream),
      res
    ).catch(() => {
      process.stdout.write(`End: ${req.query.stream}\n`);
      res.end();
    });
  }
  catch (error) {
    process.stdout.write(`Error: ${req.query.stream}\n`);
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
