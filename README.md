# Tutero dotfiles

## Installation

First, we install the GitHub CLI `gh` and authenticate with GitHub.

```bash
brew install gh
gh auth login
```

Now, we create a dotfiles repository on your GitHub account, from the Tutero `dotfiles` template.

```bash
cd ~
gh repo create <github-username>/dotfiles --private --template=MathGaps/dotfiles
git remote add template https://github.com/MathGaps/dotfiles.git
git fetch all
```
