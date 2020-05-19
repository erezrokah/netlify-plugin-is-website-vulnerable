const { Audit, RenderJson } = require('is-website-vulnerable');

module.exports = {
  name: '@erezrokah/netlify-plugin-is-website-vulnerable',
  // users will be tempted to use semver, but we really don't care
  onPostDeploy: async ({ pluginConfig = {} } = {}) => {
    const { site = process.env.SITE } = pluginConfig;

    try {
      if (!site) {
        throw new Error('Empty site');
      }
      const audit = new Audit();
      const results = await audit.scanUrl(site);
      if (results.lhr.runtimeError) {
        throw new Error(results.lhr.runtimeError.message);
      }

      const json = JSON.parse(new RenderJson(results, true).format());

      console.log(JSON.stringify(json.vulnerabilities, null, 2));

      if (audit.hasVulnerabilities(results)) {
        process.exit(2);
      }

      process.exit(0);
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
      process.exit(1);
    }
  },
};
