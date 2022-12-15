# markdownlint-rule-enhanced-proper-names

[![npm](https://img.shields.io/npm/v/markdownlint-rule-enhanced-proper-names?color=blue)](https://www.npmjs.com/package/markdownlint-rule-enhanced-proper-names)

Enhanced [`MD044/proper-names`](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md#md044---proper-names-should-have-the-correct-capitalization) rule for [markdownlint](https://github.com/DavidAnson/markdownlint). The difference from the original version is:

- Add `heading_id` parameter (default `true`): set to `false` to disable the rule for custom heading ID (e.g. `# Heading {#custom-heading-id}`)

## Installation

```shell
yarn add markdownlint-rule-enhanced-proper-names
```

## Usage

Edit `.markdownlint-cli2.jsonc`, add `markdownlint-rule-enhanced-proper-names` to `customRules`:

```json
{
  "customRules": [
    "markdownlint-rule-enhanced-proper-names/src/enhanced-proper-names.js"
  ],
  "config": {
    "enhanced-proper-names": {
      "code_blocks": true,
      "html_elements": true,
      "heading_id": true,
      "names": [
        ...
      ]
    }
  }
}
```
