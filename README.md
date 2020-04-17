This GitHub Action syncs your current issue branch to a remote Pantheon repo, using NodeJS.

# Configuration

Pass configuration with `env` vars

- `THEME_DIRECTORY` [required]

Directory where the them to sync is located.

- `REMOTE_REPO_NAME` [required]

Remote GIT Repo Name

# Dependencies

This Github actions required that you:

- Add an private SSH key in the SSH-agent and copy the public associated SSH key into Pantheon

- Use a Github action that install Terminus E.g: https://github.com/kopepasah/setup-pantheon-terminus

# Usage

```
  - name: Rsync assets to Pantheon
      uses: irishdistillers/pantheon-sync@master
      with:
        LOCAL_THEME_DIRECTORY: 'wp-content/themes/global-theme'
        REMOTE_THEME_DIRECTORY: 'wp-content/themes'
        REMOTE_REPO_NAME: ${{ secrets.PANTHEON_SITE_ID }}
```

## Disclaimer

Use at your own risk.
