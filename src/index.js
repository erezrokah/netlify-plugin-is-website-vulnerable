const { Audit, RenderJson } = require('is-website-vulnerable');
const puppeteer = require('puppeteer');
const httpServer = require('http-server');

module.exports = {
  name: 'erezrokah/netlify-plugin-is-website-vulnerable',
  onSuccess: async ({ constants: { PUBLISH_DIR } = {}, utils } = {}) => {
    try {
      utils = utils || {
        build: {
          failBuild: (message) => {
            console.error(message);
            process.exit(1);
          },
        },
      };

      const serveDir = PUBLISH_DIR || process.env.PUBLISH_DIR;
      if (!serveDir) {
        throw new Error('Empty publish dir');
      }

      const server = httpServer.createServer({ root: serveDir });
      const port = 5000;
      await new Promise((resolve) => {
        server.listen(port, '127.0.0.1', async () => {
          console.log('Serving and scanning site from', serveDir);

          const url = `http://localhost:${port}`;

          const browserFetcher = puppeteer.createBrowserFetcher();
          const revisions = await browserFetcher.localRevisions();
          if (revisions.length <= 0) {
            throw new Error('Could not found local browser');
          }
          const info = await browserFetcher.revisionInfo(revisions[0]);
          process.env.CHROME_PATH = info.executablePath;

          const audit = new Audit();
          const results = await audit.scanUrl(url);
          server.close();

          if (results.lhr.runtimeError) {
            throw new Error(results.lhr.runtimeError.message);
          }

          const json = JSON.parse(new RenderJson(results, true).format());
          console.log(JSON.stringify(json, null, 2));
          if (audit.hasVulnerabilities(results)) {
            utils.build.failBuild('site is vulnerable');
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
      utils.build.failBuild('unknown error');
    }
  },
};
