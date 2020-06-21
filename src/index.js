const httpServer = require('http-server');
const { RenderConsole } = require('is-website-vulnerable');
const { getBrowserPath, runLighthouse } = require('./lighthouse');

module.exports = {
  onSuccess: async ({ constants: { PUBLISH_DIR } = {}, utils } = {}) => {
    try {
      utils = utils || {
        build: {
          failBuild: (...args) => {
            console.error(...args);
            process.exitCode = 1;
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

      const browserPath = await getBrowserPath();

      const server = httpServer.createServer({ root: serveDir });
      const port = 5000;
      const { error, results } = await new Promise((resolve) => {
        server.listen(port, 'localhost', async () => {
          try {
            console.log(
              `Serving and scanning site from directory '${serveDir}'`,
            );
            const url = `http://localhost:${port}`;
            const results = await runLighthouse({
              browserPath,
              url,
              onlyAudits: ['no-vulnerable-libraries', 'js-libraries'],
            });
            resolve({ error: false, results });
          } catch (error) {
            resolve({ error });
          } finally {
            server.close();
          }
        });
      });
      if (error) {
        throw error;
      } else {
        const vulnerableLibraries =
          results.lhr.audits['no-vulnerable-libraries'];

        const siteVulnerable =
          vulnerableLibraries.details &&
          vulnerableLibraries.details.items &&
          vulnerableLibraries.details.items.length > 0;

        if (siteVulnerable) {
          new RenderConsole(results, true).print();
          utils.build.failBuild('site is vulnerable');
        } else {
          const summary = 'No vulnerable JavaScript libraries detected';
          console.log(summary);
          utils.status.show({
            summary,
          });
        }
      }
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
      utils.build.failBuild(`failed with error: ${error.message}`, { error });
    }
  },
};
