const { Audit, RenderJson } = require('is-website-vulnerable');
const puppeteer = require('puppeteer');

module.exports = {
  name: 'erezrokah/netlify-plugin-is-website-vulnerable',
  onSuccess: async () => {
    try {
      const url = process.env.DEPLOY_URL;
      if (!url) {
        throw new Error('Empty url');
      }

      const browserFetcher = puppeteer.createBrowserFetcher();
      const revisions = await browserFetcher.localRevisions();
      if (revisions.length <= 0) {
        throw new Error('Could not found local browser');
      }
      const info = await browserFetcher.revisionInfo(revisions[0]);
      process.env.CHROME_PATH = info.executablePath;

      console.log('Scanning URL', url);
      const audit = new Audit();
      const results = await audit.scanUrl(url);
      if (results.lhr.runtimeError) {
        throw new Error(results.lhr.runtimeError.message);
      }

      const json = JSON.parse(new RenderJson(results, true).format());

      console.log(JSON.stringify(json.vulnerabilities, null, 2));

      if (audit.hasVulnerabilities(results)) {
      }
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
    }
  },
};
