#!/usr/bin/env node

const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const child_process = require('child_process');

const {
    LOCAL_THEME_DIRECTORY,
    REMOTE_REMOTE_REPO_NAME,
    GITHUB_WORKSPACE,
    HOME
} = process.env;
console.log('GITHUB_WORKSPACE', GITHUB_WORKSPACE);

const pantheonSync = (() => {

    const init = ({
        localThemeDirectory,
        remoteThemeDirectory,
        pantheonRepoName,
        pullRequest
    }) => {
        setupRsync();
        rsyncAssets(localThemeDirectory, remoteThemeDirectory, pantheonRepoName, pullRequest);
    };

    const setupRsync = () => {

        console.log('Downloading Rsync Plugin.');
        child_process.execSync('mkdir -p $HOME/.terminus/plugins');
        child_process.execSync('git clone https://github.com/pantheon-systems/terminus-rsync-plugin.git $HOME/.terminus/plugins/terminus-rsync-plugin');
        console.log("\n ✅ Rsync plugin downloaded.");

    };

    async function rsyncAssets(localThemeDirectory, remoteThemeDirectory, pantheonRepoName, pullRequest) {
        try {

            console.log('reponame is : ' + pantheonRepoName);
            console.log('branchname is : ' + pullRequest.head.ref);
            console.log('Sending assets via Rsync');
            await exec.exec('terminus', ['rsync', '$GITHUB_WORKSPACE/' + localThemeDirectory, pantheonRepoName + '.' + pullRequest.head.ref + ':' + remoteThemeDirectory, '-y', '-vvv', '-n' ]);
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
        localThemeDirectory: core.getInput('LOCAL_THEME_DIRECTORY'),
        remoteThemeDirectory: core.getInput('REMOTE_THEME_DIRECTORY'),
        pantheonRepoName: core.getInput('REMOTE_REPO_NAME'),
        pullRequest: github.context.payload.pull_request,
    });
};

run();