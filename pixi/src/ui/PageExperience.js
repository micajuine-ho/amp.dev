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

import PageExperienceCheck from '../checks/PageExperienceCheck.js';
import SafeBrowsingCheck from '../checks/SafeBrowsingCheck.js';
import ValidationCheck from '../checks/ValidationCheck.js'

import CoreWebVitalsReportView from './report/CoreWebVitalsReportView.js';
import BooleanCheckReportView from './report/BooleanCheckReportView.js';

export default class PageExperience {
  constructor() {
    this.input = document.getElementById('input-field');
    this.submit = document.getElementById('input-submit');
    this.submit.addEventListener('click', this.onSubmitUrl.bind(this));

    this.banner = document.getElementById('status-banner');
    this.bannerTitle = this.banner.querySelector('h3');
    this.bannerText = this.banner.querySelector('p');

    this.reportViews = {};

    this.pageExperienceCheck = new PageExperienceCheck();
    this.safeBrowsingCheck = new SafeBrowsingCheck();
    this.validationCheck = new ValidationCheck();
  }

  isValidURL(inputUrl) {
    try {
      const url = new URL(inputUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  async onSubmitUrl() {
    const inputUrl = this.input.value;
    this.bannerTitle.textContent = 'Analyzing your website...';

    if (!this.isValidURL(inputUrl)) {
      // TODO: Initialize lab data reports
      throw new Error('Please enter a valid URL');
    } else {
      this.toggleLoading(true);

      // Gather errors from all test runs
      const errors = [];
      const checkRuns = [];

      // Core Web Vitals
      checkRuns.push(this.pageExperienceCheck.run(inputUrl).then((pageExperienceReport) => {
        const error = pageExperienceReport[0];
        if (error) {
          errors.push(error);
          return;
        }

        const data = pageExperienceReport[1];
        for (const [id, metric] of Object.entries(
          data.coreWebVitals.fieldData
        )) {
          this.reportViews[id] =
            this.reportViews[id] || new CoreWebVitalsReportView(document, id);
          this.reportViews[id].render(metric);
        }
      }));

      // Additional checks
      checkRuns.push(this.safeBrowsingCheck.run(inputUrl).then((safeBrowsingReport) => {
        const [error, data] = safeBrowsingReport;
        if (error) {
          errors.push(error);
        }
        this.reportViews['safeBrowsing'] = new BooleanCheckReportView(
          document,
          'safe-browsing'
        );
        this.reportViews['safeBrowsing'].render(data);
      }));

      // AMP linter check
      checkRuns.push(this.validationCheck.run(inputUrl).then((validationCheckReport) => {
        const [error, data] = validationCheckReport;
        console.log('error', error);
        if (error) {
          errors.push(error);
        }
      }));


      Promise.all(checkRuns).then(() => this.renderBanner(errors));
    }

    this.toggleLoading(false);
  }

  toggleLoading(force) {
    this.submit.classList.toggle('loading', force);
    for (const report of Object.keys(this.reportViews)) {
      this.reportViews[report].toggleLoading(force);
    }
  }

  /**
   * Check error array and render banner
   * @param  {array} errors List of errors occurred in the checks
   */
  renderBanner(errors) {
    if (!errors.length) {
      this.banner.classList.add('pass');
      this.bannerTitle.textContent = 'Wow! Your AMP page has a great page experience!';
      this.bannerText.textContent = 'This page creates a great page experience!';
    } else {
      this.banner.classList.add('fail');
      this.bannerTitle.textContent = 'Oops! Looks like something went wrong.';
      this.bannerText.textContent = 'It seems like we weren\'t able to get reliable results. Please rerun the test.';
    }
  }
}

new PageExperience();
