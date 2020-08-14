/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * This server uses WebSockets to send a constant stream of uninteresting messages,
 * suitable for a live blog.
 * The messages are chosen randomly from the messages[] array,
 * each delayed by betweeen shortestWait and longestWait milliseconds.
 */

'use strict';

const WebSocket = require('ws');
const express = require('express');

// eslint-disable-next-line new-cap
// const examples = express.Router();
/* We probably don't need this, do we? Since we're actually adding the socket server in platform.js?
 * The problem I have is that if I try to export a function like startLiveBlog below,
 * some sort of magic process wants to include that in express anyway, throwing an error.
 * But I was wondering if I still needed to create a Router and then do something like this:
 * examples.put('/live-blog', function(req, res) {
 *   // server logic here
 * }
 */

const messages = [
  'Something thrilling is happening.',
  "There's big news, of some sort.",
  'Stay tuned for more jaw-dropping updates.',
  "You'll never believe what I'm about to tell you.",
  "Wow! I can't believe what just happened.",
  "Don't you wish you were here? I would.",
  'The thing just happened again. Go figure.',
  'This just takes my breath away.',
  "One of the most astonishing things I've ever seen.",
  'Such an extraordinary moment.',
  'This changes everything.',
  'The news never stops! Or starts.',
];

const shortestWait = 5000;
const longestWait = 10000;

function getDelay() {
  return (
    Math.floor(Math.random() * (longestWait - shortestWait)) + shortestWait
  );
}

function startLiveBlog(server) {
  wss = new WebSocket.Server({server});

  wss.on('connection', (ws) => {
    sendLiveBlogEntries(ws);
  });
}

function sendLiveBlogEntries(ws) {
  const index = Math.floor(Math.random() * messages.length);
  ws.send(messages[index]);

  setTimeout(sendLiveBlogEntries, getDelay(), ws);
}

module.exports.startLiveBlog = startLiveBlog;
