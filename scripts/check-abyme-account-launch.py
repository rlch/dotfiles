#!/usr/bin/env python3
"""Check the real account launch hook on a scratch abymed, without real credentials.

Run with an Abyme checkout at the installed version:
  python3 scripts/check-abyme-account-launch.py /path/to/abyme-checkout
"""
import json
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request


checkout = Path(sys.argv[1]).resolve()
source = Path(__file__).resolve().parents[1]
subprocess.run([str(checkout / "scripts/abymed-fresh")], cwd=checkout, check=True)
binary = checkout / "target/check/abymed"
cli = checkout / "target/check/abyme"
client = cli.resolve().parent.parent / "client"
if not (client / "index.html").is_file():
    client = checkout / "web/app/dist"
assert (client / "index.html").is_file(), "the checkout needs a built client"

with tempfile.TemporaryDirectory(prefix="abyme-accounts-check-") as folder:
    root = Path(folder)
    shutil.copytree(source / "dot_config/abyme-common/accounts", root / "accounts")
    security = root / "security"
    security.write_text("""#!/bin/sh
case "$1" in
  dump-keychain) printf '%s\\n' '"svce"<blob>="abyme-accounts-check"' ;;
  find-generic-password)
    [ ! -f "$(dirname "$0")/missing" ] || exit 44
    printf '%s\\n' 'fake-account-launch-check-token'
    ;;
  *) exit 1 ;;
esac
""")
    security.chmod(0o700)
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    (root / "init.ts").write_text(f"""
import abyme from "@abyme/cell";
import code from "@abyme/code";
import accounts from "./accounts";
abyme.server({{ port: {port}, bind: ["127.0.0.1"], stateDir: {json.dumps(str(root / 'state'))}, clientDir: {json.dumps(str(client))} }});
code.setup();
accounts.setup({{ security: {json.dumps(str(security))}, home: {json.dumps(str(root / 'home'))} }});
""")
    url = f"http://127.0.0.1:{port}"

    def call(service, method, arguments):
        return subprocess.run(
            [str(cli), "--url", url, "call", service, method,
             json.dumps(arguments), "--timeout", "15", "--json"],
            capture_output=True, text=True, timeout=20,
        )

    with (root / "server.log").open("w") as log:
        server = subprocess.Popen([str(binary), str(root)], stdout=log, stderr=log)
        try:
            end = time.monotonic() + 30
            while True:
                try:
                    with urllib.request.urlopen(url + "/api/config", timeout=1) as response:
                        config = json.load(response)
                    if not config.get("running"):
                        assert not config.get("threw"), config
                        assert not config.get("problems"), config
                        break
                except OSError:
                    if time.monotonic() >= end:
                        raise RuntimeError((root / "server.log").read_text()[-4000:])
                if time.monotonic() >= end:
                    raise RuntimeError("scratch config did not become ready")
                time.sleep(0.1)
            own = call("remote", "run", [{"code": 'import abyme from "@abyme/cell"; export default abyme.machines.own().id'}])
            assert own.returncode == 0, own.stderr + (root / "server.log").read_text()[-2000:]
            machine = json.loads(own.stdout)["value"]
            assert machine.startswith("m_"), machine
            launch = {"provider": "acp", "harness": "claude", "kind": "claude",
                      "config": {"model": {"value": "sonnet", "category": "model"}},
                      "cwd": str(root), "machine": machine, "probe": True,
                      "command": "never-run-this-command", "env": {}}
            result = call("agents", "prepared", [launch])
            assert result.returncode == 0, result.stderr
            prepared = json.loads(result.stdout)
            assert prepared.get("account") == "check", "account hook did not select an account for a machine ID"
            assert prepared.get("secret", {}).get("CLAUDE_CODE_OAUTH_TOKEN") == "fake-account-launch-check-token", "account hook did not attach its credential"
            print("PASS: machine-ID launch receives its selected account and credential")
            (root / "missing").touch()
            result = call("agents", "prepared", [launch])
            assert result.returncode != 0, "missing credential silently fell through to another login"
            assert "setup-token is not in the keychain" in result.stderr, result.stderr
            print("PASS: missing credential refuses the launch instead of falling back")
            (root / "missing").unlink()
            entry = root / "accounts/server.ts"
            text = entry.read_text()
            old = "const HERE = abyme.machine === abyme.machines.own().id;"
            assert old in text, "update the identity-failure injection for the account selector"
            entry.write_text(text.replace(old, "const HERE = false;"))
            end = time.monotonic() + 15
            while True:
                result = call("agents", "prepared", [launch])
                if result.returncode and "accounts cannot attach credentials" in result.stderr:
                    break
                assert time.monotonic() < end, "disabled account selector silently allowed a launch"
                time.sleep(0.2)
            print("PASS: an unavailable account selector refuses instead of silently skipping its hook")
            for changed in [{"kind": "other-harness"}, {"machine": "m_1111111111111111"}]:
                result = call("agents", "prepared", [launch | changed])
                assert result.returncode == 0, result.stderr
                prepared = json.loads(result.stdout)
                assert "account" not in prepared
                assert "CLAUDE_CODE_OAUTH_TOKEN" not in prepared.get("secret", {})
            print("PASS: other harnesses and machines receive no pooled credential")
        finally:
            server.terminate()
            server.wait(timeout=15)
            subprocess.run([str(binary), "process-host", "stop", str(root / "state")],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15)
