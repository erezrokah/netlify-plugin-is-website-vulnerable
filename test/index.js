const test = require('ava');
const path = require('path');
const netlifyBuild = require('@netlify/build');

const NETLIFY_CONFIG = path.join(__dirname, '../netlify.toml');

test('Netlify Build fail due to vulnerabilities', async (t) => {
  const { success, logs } = await netlifyBuild({
    config: NETLIFY_CONFIG,
    buffer: true,
  });

  // Check that build failed as the example site has
  t.false(success);

  // Netlify Build output
  const output = [logs.stdout.join('\n'), logs.stderr.join('\n')]
    .filter(Boolean)
    .join('\n\n');
  t.true(output.includes('[2] Total vulnerabilities'));
});
