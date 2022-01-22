import test from 'ava';
import { fileURLToPath } from 'url';

import netlifyBuild from '@netlify/build';

const NETLIFY_CONFIG = fileURLToPath(
  new URL('../netlify.toml', import.meta.url),
);

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
  console.log(output);
  t.true(output.includes('[2] Total vulnerabilities'));
});
