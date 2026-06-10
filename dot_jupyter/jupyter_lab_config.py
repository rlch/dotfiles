# JupyterLab server config. Launch notebooks in Google Chrome (the manual
# web-dev browser) instead of the macOS default (Firefox). webbrowser parses
# the `%s` command with shlex, so the quoted app name survives.
c = get_config()  # noqa: F821
c.ServerApp.browser = 'open -a "Google Chrome" %s'
