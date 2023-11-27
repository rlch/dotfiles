# `dotfiles`

<!--toc:start-->

- [`dotfiles`](#dotfiles)
  - [Getting started](#getting-started)
  - [Installation](#installation)
  - [Making changes](#making-changes)
    - [Tracking configuration for new software](#tracking-configuration-for-new-software)
  - [Updating](#updating)
  - [Contribution](#contribution)
  <!--toc:end-->

## Getting started

Before `dotfiles` can be setup, install a few dependencies:

- [`brew`](https://brew.sh/)
- [`gh`](https://docs.github.com/en/github-cli/github-cli/quickstart)
- [`go`](https://go.dev/doc/install)
- [`jq`](https://jqlang.github.io/jq/download/)

After installing `brew`, install the remaining dependencies using:

```bash
brew install gh go jq
```

Also install the terminal definitions for `wezterm` in a `bash/zsh` shell (this isn't valid `fish`):

```bash
bash
tempfile=$(mktemp) \
  && curl -o $tempfile https://raw.githubusercontent.com/wez/wezterm/main/termwiz/data/wezterm.terminfo \
  && tic -x -o ~/.terminfo $tempfile \
  && rm $tempfile
```

## Installation

First, install the GitHub command-line tool `gh` and authenticate with GitHub.

```bash
gh auth login
```

Now, create a `dotfiles` repository on your GitHub account, from the Tutero `dotfiles` template.

```bash
GH_USER=$(gh api user | jq -r '.login')
cd ~
gh repo create $GH_USER/dotfiles --private --template=MathGaps/dotfiles
gh repo clone $GH_USER/dotfiles dotfiles
cd dotfiles
git remote add template https://github.com/MathGaps/dotfiles.git
git fetch template
git submodule update --remote
```

With the `dotfiles` repository created, run the installation process. First, modify the `baseDir` in `config.yaml` to `/Users/<home-user>` (no trailing `/`) or whichever directory you would like to install your `dotfiles` to. You may also customize the default folder locations.

```bash
go run .
```

> [!NOTE]
> If the installation process hangs when installing dependencies for longer than 20-30 seconds, try cancelling with `<Ctrl-C>` and run `go run .` again. The script is idempotent.

After the installation process completes, it's recommended to logout and login again to ensure system changes (like key repeat) have been applied.

> [!IMPORTANT]
> If you already had `<baseDir>/.config/*` files, they will be moved to `<baseDir>/.config.bak/*`. Ensure any files you want to keep in your `dotfiles` are moved back to `<baseDir>/.config/*`.

## Making changes

### Updating your own `dotfiles`

Simply make changes to `<repository clone dir>/config/*` or equivalently the symbolic links inside `<baseDir>/.config/*` and push to git as normal. This will make changes to your own `dotfiles` repository, **not the template**.

### Updating template `dotfiles`

Once you've made changes as above, you can:

1. Create a new branch based off `template/main`, inside `origin` with `git fetch template && git checkout -b <new-branch-name> template/main`
2. Make changes to this branch / cherry-pick from your other commits in `origin`.
3. Push your changes to `template` with `git push template HEAD`
4. Create a PR to `MathGaps/dotfiles` with `gh pr create -B main -R MathGaps/dotfiles`; and follow the process.
5. Once merged, let everyone know via Slack if necessary.

### Tracking configuration for new software

If you want to add and track changes to new software, then:

1. Add your configuration to `<repository clone dir>/config/<name>`.

> [!IMPORTANT]
> Make sure your configuration is copied over from `<baseDir>/.config/<name>` before continuing. Any `links` in `install.dotfiles.yaml` will replace existing configuration with the source-of-truth in the repository.

2. Add `$BASE_DIR/.config/<name>: config/<name>` to `install.dotfiles.yaml` so that the CLI knows to symbolically link these directories.
3. Run `go run .` to create the symbolic link.
4. _If you make a PR to the template, make sure to let everyone know. Anyone wanting these changes should also run `go run .`_

## Updating

In order to pull updates from this repository when others make improvements, we need to merge your upstream branch with the template branch. We cannot assume equivalent histories given upstream changes can be made.

```bash
git fetch template
git merge template/main --allow-unrelated-histories
# Resolve any conflicts
```

## Contribution

If you have any improvements, features, fixes, or new software that you think benefit everyone in the team,
