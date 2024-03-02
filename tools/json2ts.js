/**
 * Generate Typescript types for extension configuration.
 */

const fs = require('fs');
const path = require('path');
const { compile } = require('json-schema-to-typescript');
const traverse = require('json-schema-traverse');
const jsonpointer = require('jsonpointer');

const pkg = require('../package.json');

// We don't want to recurse into `$defs`
const { configuration: { $defs, ...configuration } } = pkg.contributes;

traverse(configuration, ({ title, markdownDescription, description }, pointer) => {
    // Copy VS Code's nonstandard `markdownDescription` to JSON schema's standard `description`.
    if (markdownDescription && !description) {
        jsonpointer.set(configuration, `${pointer}/description`, markdownDescription);
    }

    // `json-schema-to-typescript` must use `$defs` and `$ref` to avoid type duplication,
    // but VS Code does't support these keywords (see https://code.visualstudio.com/api/references/contribution-points#contributes.configuration),
    if (title && $defs[title]) {
        jsonpointer.set(configuration, pointer, { $ref: `#/$defs/${title}` });
    }
});

// Restore `$defs` to `configuration`
configuration.$defs = $defs;

compile(configuration)
    .then((ts) => fs.writeFileSync(
        path.resolve(__dirname, '../interface/configuration.d.ts'),
        ts,
    ));
