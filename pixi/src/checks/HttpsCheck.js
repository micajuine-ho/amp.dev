// Copyright 2020 The AMPHTML Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export default class HttpsCheck {
  async run(pageUrl) {
    try {
      const apiResult = await this.fetchJson(pageUrl);
      return this.createReportData(apiResult);
    } catch (e) {
      return [e];
    }
  }

  createReportData(apiResult) {
    return [null, !Object.keys(apiResult).length];
  }

  async fetchJson(pageUrl) {
    try {
      const response = {};
      if (!response.ok) {
        throw new Error(`Https check failed fetching from: ${this.apiUrl}`);
      }
      return response;
    } catch (e) {
      throw new Error('Https check failed:', e);
    }
  }
}
