# Tutero dotfiles

## Getting started

Before dotfiles are installed, a few dependencies are required:

- [GitHub CLI](https://docs.github.com/en/github-cli/github-cli/quickstart)
- [Go](https://go.dev/doc/install)

## Installation

First, we install the GitHub CLI `gh` and authenticate with GitHub.

```bash
gh auth login
```

Now, we create a dotfiles repository on your GitHub account, from the Tutero `dotfiles` template.

```bash
cd ~
gh repo create <github-username>/dotfiles --private --template=MathGaps/dotfiles
gh repo clone <github-username>/dotfiles dotfiles
cd dotfiles
git remote add template https://github.com/MathGaps/dotfiles.git
git fetch template
git submodule update --remote
```

With the dotfiles repository created, we can now install the dotfiles.

```bash
go run .
```

## Pulling updates from the template

In order to pull updates from this repository when others make improvements, we need to merge your upstream branch with the template branch. We cannot assume equivalent histories given upstream changes can be made.

```bash
git fetch template
git merge template/main --allow-unrelated-histories
# Resolve any conflicts
```
