const { Audit, RenderConsole } = require('is-website-vulnerable');
const puppeteer = require('puppeteer');
const httpServer = require('http-server');

module.exports = {
  onPostBuild: async ({ constants: { PUBLISH_DIR } = {}, utils } = {}) => {
    try {
      utils = utils || {
        build: {
          failBuild: (message) => {
            console.error(message);
            process.exit(1);
          },
        },
        status: {
          show: () => undefined,
        },
      };

      const serveDir = PUBLISH_DIR || process.env.PUBLISH_DIR;
      if (!serveDir) {
        throw new Error('Empty publish dir');
      }

      const server = httpServer.createServer({ root: serveDir });
      const port = 5000;
      const { error } = await new Promise((resolve) => {
        server.listen(port, '127.0.0.1', async () => {
          console.log(`Serving and scanning site from directory '${serveDir}'`);

          const { address, port } = server.server.address();
          const url = `http://${address}:${port}`;

          const browserFetcher = puppeteer.createBrowserFetcher();
          const revisions = await browserFetcher.localRevisions();
          if (revisions.length <= 0) {
            resolve({ error: new Error('Could not find local browser') });
          }
          const info = await browserFetcher.revisionInfo(revisions[0]);

          const audit = new Audit();
          const results = await audit.scanUrl(url, {
            lighthouseOpts: {},
            chromeOpts: { chromePath: info.executablePath },
          });

          server.close();

          if (results.lhr.runtimeError) {
            resolve({ error: new Error(results.lhr.runtimeError.message) });
          }

          if (audit.hasVulnerabilities(results)) {
            new RenderConsole(results, true).print();
            utils.build.failBuild('site is vulnerable');
          }
          resolve({ error: false });
        });
      });
      if (error) {
        throw error;
      } else {
        const summary = 'No vulnerable JavaScript libraries detected';
        console.log(summary);
        utils.status.show({
          summary,
        });
      }
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
      utils.build.failBuild(`failed with error: ${error.message}`);
    }
  },
};
