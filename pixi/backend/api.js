/**
 * Copyright 2020 The AMPHTML Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {dummyApiResponse} = require('./constants.js');
const express = require('express');
const {lint, LintMode} = require('@ampproject/toolbox-linter');
const cheerio = require('cheerio');
const log = require('@lib/utils/log')('Pixi API');
const RateLimitedFetch = require('@lib/utils/rateLimitedFetch');

const rateLimitedFetch = new RateLimitedFetch({
  requestHeaders: {
    'Referer': 'https://amp.dev/page-experience/',
  },
});

const COMPONENT_SRC_MATCHER = /\/v0\/([^.]+)-(\d+(?:\.\d+)*)\.m?js/;
const findAmpComponents = ($) => {
  const versionMap = {};
  $('script[src]').each((i, script) => {
    const match = COMPONENT_SRC_MATCHER.exec($(script).attr('src'));
    if (match) {
      versionMap[match[1]] = match[2];
    }
  });
  return versionMap;
};

const execChecks = async (url) => {
  const res = await rateLimitedFetch.fetchHtmlResponse(url);
  const body = await res.text();
  const $ = cheerio.load(body);
  const context = {
    $,
    headers: {},
    raw: {
      headers: res.headers,
      body,
    },
    url,
    mode: LintMode.Amp,
  };
  const lintResults = await lint(context);
  return {
    https: res.url.startsWith('https://'),
    redirected: res.redirected,
    url: res.url,
    components: findAmpComponents($),
    data: lintResults,
  };
};

// eslint-disable-next-line new-cap
const api = express.Router();
api.get('/page-experience-dummy', async (request, response) => {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 2000);
  });
  response.json(dummyApiResponse);
});

api.get('/lint', async (request, response) => {
  log.info('lint endpoint called.');
  response.setHeader('Content-Type', 'application/json');

  const fetchUrl = request.query.url;
  try {
    const checkResult = await execChecks(fetchUrl);
    const result = {
      status: 'ok',
      ...checkResult,
    };
    response.json(result);
  } catch (e) {
    log.error('Unable to lint', fetchUrl, e.stack);
    const result = {status: 'error'};
    if (e.errorId) {
      // The messages for the special RemoteFetchError can be shown in the response
      result.errorId = e.errorId;
      result.message = e.message;
    }
    response.json(result);
  }
});

module.exports = api;
