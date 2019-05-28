import * as path from 'path';
import * as fs from 'fs';

import { fileExists } from '../../file-exists';
import { Process } from '../../typings.d';

interface Options {
  definitions?: string;
  template?: string;
  output?: string;
  factoryName?: string;
  uniFactoryName?: string;
  _process: Process;
}

const pathResolver = cwd => (...a) => path.resolve(cwd, ...a);

// TODO: move the source of `warningBanner` to dedicated file. make sure it gets into output unchanged
const warningBanner = (templatePath: string) =>
  `/* eslint-disable */
/*
 * DO NOT EDIT THIS FILE!
 * YOUR CHANGES WILL BE OVERWRITTEN!
 * FILE IS BASED ON ${templatePath}
 * AND GENERATED BY \`wuf export-teskits\`
 */`;

// TODO: move the source of `load` to dedicated file. make sure it gets into output unchanged
const loadUtilSource = `const load = module => {
  const MODULE_META_KEYS = ['__esModule'];

  const moduleFields = Object.keys(module).reduce((total, key) => {
    if (!MODULE_META_KEYS.includes(key)) {
      return total.concat(module[key]);
    }
    return total;
  }, []);

  let defaultOrFirstExport;
  if (module.default) {
    defaultOrFirstExport = module.default;
  } else if (moduleFields.length === 1) {
    defaultOrFirstExport = moduleFields[0];
  } else {
    defaultOrFirstExport = module;
  }
  return defaultOrFirstExport;
};`;

export const exportTestkits: (a: Options) => Promise<void> = async opts => {
  const pathResolve = pathResolver(opts._process.cwd);
  if (!opts.output) {
    throw new Error('missing --output parameter, it must be defined');
  }
  const options = {
    definitions: pathResolve(
      opts.definitions || '.wuf/testkits/definitions.js',
    ),
    template: pathResolve(opts.template || '.wuf/testkits/template.js'),
    factoryName: opts.factoryName || 'testkitFactoryCreator',
    uniFactoryName: opts.uniFactoryName || 'uniTestkitFactoryCreator',
    output: pathResolve(opts.output),
  };

  if (!(await fileExists(options.definitions))) {
    throw new Error(`Definitions file does not exist at "${opts.definitions}"`);
  }

  const definitions = require(options.definitions);
  const components = require(path.resolve(
    opts._process.cwd,
    '.wuf',
    'components.json',
  ));

  const wrapItemWithFunction = (fn, item) => `${fn}(${item})`;

  // load() is function included during build time. It comes from test/generate-testkit-exports/templates/load.js
  // It is a helper that `require`s given path and extracts export (default or only one found)
  const wrapWithLoad = requirePath =>
    wrapItemWithFunction('load', `require('${requirePath}')`);

  const shouldCreateExport = name =>
    definitions[name]
      ? ['noTestkit', 'manualExport'].every(
          property => !definitions[name][property],
        )
      : true;

  const getExportableTestkits = () =>
    Object.keys({
      ...definitions,
      ...components,
    })
      .filter(shouldCreateExport)

      .reduce((testkits, name) => {
        const definition = definitions[name] || {};
        const entryName =
          name[0].toLowerCase() + name.slice(1) + 'TestkitFactory';

        const testkitEntry = wrapItemWithFunction(
          definition.unidriver ? options.uniFactoryName : options.factoryName,
          wrapWithLoad(
            definition.testkitPath ||
              ['..', 'src', name, name + '.driver'].join('/'),
          ),
        );

        testkits[entryName] = testkitEntry;

        return testkits;
      }, {});

  const exportableTestkits = getExportableTestkits();
  const testkitImportsSource = Object.keys(exportableTestkits)
    .map(key => [key, exportableTestkits[key]])
    .map(([name, entry]) => `export const ${name} = ${entry};`)
    .join('\n');

  const templateSource = fs.readFileSync(options.template, 'utf8');
  const source = [
    warningBanner(opts.template),
    templateSource,
    loadUtilSource,
    testkitImportsSource,
  ].join('\n');

  try {
    fs.writeFileSync(options.output, source);
  } catch (e) {
    throw new Error(`Unable to generate testkits: ${e}`);
  }
};
