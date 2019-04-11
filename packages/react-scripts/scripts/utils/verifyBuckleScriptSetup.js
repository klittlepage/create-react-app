// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('react-dev-utils/chalk');
const fs = require('fs');
const resolve = require('resolve');
const path = require('path');
const paths = require('../../config/paths');
const os = require('os');
const globby = require('react-dev-utils/globby').sync;

function writeJson(fileName, object) {
  fs.writeFileSync(fileName, JSON.stringify(object, null, 2) + os.EOL);
}

function verifyNoBuckleScript() {
  const mlFiles = globby(['**/*.(ml|mli|re|rei)', '!**/node_modules'], { cwd: paths.appSrc });
  if (mlFiles.length > 0) {
    console.warn(
      chalk.yellow(
        `We detected BuckleScript in your project (${chalk.bold(
          `src${path.sep}${mlFiles[0]}`
        )}) and created a ${chalk.bold('bsconfig.json')} file for you.`
      )
    );
    console.warn();
    return false;
  }
  return true;
}

function verifyBuckleScriptSetup() {
  let firstTimeSetup = false;

  if (!fs.existsSync(paths.appBsConfig)) {
    if (verifyNoBuckleScript()) {
      return;
    }
    writeJson(paths.appBsConfig, {});
    firstTimeSetup = true;
  }

  const isYarn = fs.existsSync(paths.yarnLockFile);

  // Ensure bucklescript is installed
  try {
    resolve.sync('bs-platform/lib/bsb.exe', {
      basedir: paths.appNodeModules,
    });
  } catch (_) {
    console.error(
      chalk.bold.red(
        `It looks like you're trying to use BuckleScript but do not have ${chalk.bold(
          'bs-platform'
        )} installed.`
      )
    );
    console.error(
      chalk.bold(
        'Please install',
        chalk.cyan.bold('bs-platform'),
        'by running',
        chalk.cyan.bold(
          isYarn ? 'yarn add bs-platform' : 'npm install bs-platform'
        ) + '.'
      )
    );
    console.error(
      chalk.bold(
        'If you are not trying to use BuckleScript, please remove the ' +
          chalk.cyan('bsconfig.json') +
          ' file from your package root (and any BuckleScript files).'
      )
    );
    console.error();
    process.exit(1);
  }

  const compilerOptions = {
    "name": require(paths.appPackageJson).name,
    "reason": {
      "react-jsx": 3
    },
    "sources": {
      "dir" : "src",
      "subdirs" : true
    },
    "package-specs": [{
      "module": "commonjs",
      "in-source": true
    }],
    "suffix": ".bs.js",
    "namespace": false,
    "bs-dependencies": [
      "reason-react"
    ],
    "refmt": 3
  };

  const messages = [];
  let appBsConfig;
  try {
    appBsConfig = JSON.parse(fs.readFileSync(paths.appBsConfig));
  } catch (e) {
    console.error(
      chalk.red.bold(
        'Could not parse',
        chalk.cyan('bsconfig.json') + '.',
        'Please make sure it contains syntactically correct JSON.'
      )
    );
    console.error(e && e.message ? `Details: ${e.message}` : '');
    process.exit(1);
  }

  if (appBsConfig == null) {
    appBsConfig = {};
    firstTimeSetup = true;
  }

  if (appBsConfig["suffix"] && appBsConfig["suffix"] != ".bs.js") {
    appBsConfig["suffix"] = ".bs.js";
    messages.push(
      `${chalk.cyan('suffix')} ${chalk.bold('must')} be set to .bs.js`);
  }

  const packageSpec = JSON.stringify(compilerOptions["package-specs"]);

  if (appBsConfig["package-specs"] && 
      JSON.stringify(appBsConfig["package-specs"]) != packageSpec) {
    appBsConfig["package-specs"] = compilerOptions["package-specs"];
    messages.push(
      `${chalk.cyan('suffix')} ${chalk.bold('must')} be ${packageSpec}`);
  }

  for (const option of Object.keys(compilerOptions)) {
    const compilerOption = compilerOptions[option];
    if (appBsConfig[option] === undefined) {
      const coloredOption = chalk.cyan(option);
      appBsConfig[option] = compilerOption;
      messages.push(
        `${coloredOption} to be ${chalk.bold(
          'suggested'
        )} value: ${chalk.cyan.bold(compilerOption)} (this can be changed)`
      );
    }
  }

  if (messages.length > 0) {
    if (firstTimeSetup) {
      console.log(
        chalk.bold(
          'Your',
          chalk.cyan('bsconfig.json'),
          'has been populated with default values.'
        )
      );
      console.log();
    } else {
      console.warn(
        chalk.bold(
          'The following changes are being made to your',
          chalk.cyan('bsconfig.json'),
          'file:'
        )
      );
      messages.forEach(message => {
        console.warn('  - ' + message);
      });
      console.warn();
    }
    writeJson(paths.appBsConfig, appBsConfig);
  }
}

module.exports = verifyBuckleScriptSetup;
