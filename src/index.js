#!/usr/bin/env node

const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const child_process = require('child_process');

const {
    THEME_DIRECTORY,
    NPM_COMMAND,
    REMOTE_REPO_NAME,
    GITHUB_WORKSPACE,
    HOME
} = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const pantheonSync = (() => {

    const init = ({
        themeDirectory,
        npmCommand,
        pantheonRepoName,
        pullRequest
    }) => {
        setupRsync();
        buildAssets(themeDirectory, npmCommand);
        rsyncAssets(themeDirectory, pantheonRepoName, pullRequest);
    };
    
    const buildAssets = ({
        themeDirectory,
        npmCommand
    }) => {

        console.log('Building assets.');
        child_process.execSync(`cd $GITHUB_WORKSPACE/${ themeDirectory }`);
        child_process.execSync('composer install');
        child_process.execSync('npm install');
        child_process.execSync(`npm run ${ npmCommand }`);
        console.log("\n ✅ Assets built.");

    };

    const setupRsync = () => {

        console.log('Downloading Rsync Plugin.');
        child_process.execSync('mkdir -p $HOME/.terminus/plugins');
        child_process.execSync('git clone https://github.com/pantheon-systems/terminus-rsync-plugin.git $HOME/.terminus/plugins/terminus-rsync-plugin');
        console.log("\n ✅ Rsync plugin downloaded.");

    };

    async function rsyncAssets(themeDirectory, pantheonRepoName, pullRequest) {
        try {

            console.log('Sending assets via Rsync');
            await exec.exec('terminus', ['rsync', `$GITHUB_WORKSPACE/${ themeDirectory }`, `${ pantheonRepoName }.${ pullRequest.head.ref }:${ themeDirectory }`]);
            console.log("\n ✅ Assets synced.");

        } catch (error) {
            core.setFailed(error.message);
            process.abort();
        }
    }
    return {
        init
    }
})();

const run = () => {
    console.log('Passing parameters to init.');
    pantheonSync.init({
        themeDirectory: core.getInput('THEME_DIRECTORY'),
        npmCommand: core.getInput('NPM_COMMAND'),
        pantheonRepoName: core.getInput('REMOTE_REPO_NAME'),
        pullRequest: github.context.payload.pull_request,
    });
};

run();