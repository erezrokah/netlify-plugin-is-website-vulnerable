# Is Site Vulnerable Netlify Plugin

This plugin uses [is-website-vulnerable](https://github.com/lirantal/is-website-vulnerable) to detect vulnerable JavaScript frameworks in your site.

An example PR that adds a vulnerable jQuery library:
https://github.com/erezrokah/netlify-plugin-is-website-vulnerable/pull/3/files#diff-3ec40a1e2a924ba4ba6521185d17b0f2R8

A failed deploy preview build as a result of above PR:
https://app.netlify.com/sites/nostalgic-hamilton-c4070a/deploys/5ece572d61bac50006e22da0

## Usage

To install, add the following lines to your `netlify.toml` file:

```toml
[[plugins]]
package = "netlify-plugin-is-website-vulnerable"
```
