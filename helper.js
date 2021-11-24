/**
 * Copyright (c) 2020-present, Prawira Genestonlia.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const editJsonFile = require('edit-json-file');
const childProcess = require('child_process');
const execSync = require('child_process').execSync;
const ncp = require('ncp').ncp;

const handleExit = () => {
    process.exit(0);
};

const handleError = e => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

const copyProjectFiles = (folderDestination) => {
    const originalFolder = './template';

    const source = path.join(__dirname, originalFolder);
    return new Promise((resolve, reject) => {
        ncp.limit = 16;
        ncp(source, folderDestination, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    })
}

const updatePackageJson = (projectName) => {
    let file = editJsonFile(projectName + '/package.json', { autosave: true });
    file.set('name', path.basename(projectName));
}

const getDepStrings = () => {
    const dependencies = 'cors express';
    const devDependencies = '@types/cors @types/express @types/node nodemon ts-node typescript';
    return { dependencies, devDependencies };
}

const downloadNodeModules = (folderPath, deps) => {
    const options = { cwd: folderPath };
    childProcess.execSync('npm i -s ' + deps.dependencies, options);
    childProcess.execSync('npm i -D ' + deps.devDependencies, options);
    childProcess.execSync('npm i', options);
}

const checkGitIgnore = (appPath) => {
    const gitignoreExists = fs.existsSync(path.join(appPath, '.gitignore'));
    if (gitignoreExists) {
        // Append if there's already a `.gitignore` file there
        const data = fs.readFileSync(path.join(appPath, 'gitignore'));
        fs.appendFileSync(path.join(appPath, '.gitignore'), data);
        fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
        // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
        // See: https://github.com/npm/npm/issues/1862
        fs.moveSync(
            path.join(appPath, 'gitignore'),
            path.join(appPath, '.gitignore'),
            []
        );
    }
}

const isInGitRepository = (folderPath) => {
    try {
        const options = { cwd: folderPath, stdio: 'ignore' };
        execSync('git rev-parse --is-inside-work-tree', options);
        return true;
    } catch (e) {
        return false;
    }
}

const tryGitInit = (folderPath) => {
    try {
        const options = { cwd: folderPath, stdio: 'ignore' };
        execSync('git --version', options);
        if (isInGitRepository(folderPath)) {
            return false;
        }

        execSync('git init', options);
        return true;
    } catch (e) {
        console.warn('Git repo not initialized', e);
        return false;
    }
}

const tryGitCommit = (folderPath) => {
    try {
        const options = { cwd: folderPath, stdio: 'ignore' };
        execSync('git add .', options);
        execSync('git commit -m "initial commit"', options);
        return true;
    } catch (e) {
        console.warn('Git commit not created', e);
        console.warn('Removing .git directory...');
        try {
            fs.removeSync(path.join(appPath, '.git'));
        } catch (removeErr) {
            // ignore
        }
        return false;
    }
}

const generateApp = async (folderName) => {
    try {
        await copyProjectFiles(folderName);
        updatePackageJson(folderName);
        downloadNodeModules(folderName, getDepStrings());
        checkGitIgnore(folderName);
        tryGitInit(folderName);
        tryGitCommit(folderName);
    } catch (err) {
        console.error(err);
    }
}

// Export entry point
module.exports = generateApp;
