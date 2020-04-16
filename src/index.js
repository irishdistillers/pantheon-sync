#!/usr/bin/env node

const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const child_process = require('child_process');

const {
    THEME_DIRECTORY,
    REMOTE_REPO_NAME,
    GITHUB_WORKSPACE,
    HOME
} = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const pantheonSync = (() => {

    const init = ({
        themeDirectory,
        pantheonRepoName,
        pullRequest
    }) => {
        setupRsync();
        rsyncAssets(themeDirectory, pantheonRepoName, pullRequest);
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
            await exec.exec('terminus', ['rsync', '$GITHUB_WORKSPACE/' + themeDirectory, pantheonRepoName + '.' + pullRequest.head.ref + ':' + themeDirectory]);
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
    console.log('Core theme is ' + core.getInput('THEME_DIRECTORY'));
    pantheonSync.init({
        themeDirectory: core.getInput('THEME_DIRECTORY'),
        pantheonRepoName: core.getInput('REMOTE_REPO_NAME'),
        pullRequest: github.context.payload.pull_request,
    });
};

run();