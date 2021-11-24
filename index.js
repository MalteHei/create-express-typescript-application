#!/usr/bin/env node

'use strict';

const { Command } = require('commander');
const { version } = require('./package.json');
const generateApp = require('./helper');

const program = new Command();
program.version(version);
program.parse(process.argv);

const options = program.opts();
if (options.debug) console.log(options);

if (program.args.length !== 1) {
    console.error('Wrong number of arguments!');
    process.exit(1);
}

console.log('Creating app...');

const projectName = program.args[0];

generateApp(projectName).then(() => {
    console.log(`${projectName} has been created!`);
    console.log(`Edit ${projectName}/src/index.ts to add routes to your application.`);
});
