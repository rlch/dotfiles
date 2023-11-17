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

Now, we create a `dotfiles` repository on your GitHub account, from the Tutero `dotfiles` template.

```bash
GH_USER=$(gh api user | jq -r '.login')
cd ~
gh repo create $GH_USER/dotfiles --private --template=MathGaps/dotfiles
cd dotfiles
gh repo clone $GH_USER/dotfiles dotfiles
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

After the installation process completes, it is recommended to logout and login again to ensure system changes (like key repeat) have been applied.

> [!IMPORTANT]
> If you already had `<baseDir>/.config/*` files, they will be moved to `<baseDir>/.config.bak/*`. Ensure any files you want to keep in your `dotfiles` are moved back to `<baseDir>/.config/*`.

## Making changes

### Tracking configuration for new software

## Updating

In order to pull updates from this repository when others make improvements, we need to merge your upstream branch with the template branch. We cannot assume equivalent histories given upstream changes can be made.

```bash
git fetch template
git merge template/main --allow-unrelated-histories
# Resolve any conflicts
```

## Contribution

If you have any improvements, features, fixes, or new software that you think benefit everyone in the team,
