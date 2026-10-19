// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The knowledge profile, on 4478, beside coding (~/.config/abyme, 4477): notes and learning. Its
// own state (~/.local/state/abyme-knowledge), agents and processes; launchd job
// com.rjm.abymed.knowledge. What every profile shares is ../abyme-common.

import abyme from "@abyme/plugin";
import learn from "@abyme/learn";
import pluginApi from "@abyme/plugin-api";
import designSystem from "@abyme/design-system";
import codemirror from "@abyme/codemirror";
import react from "@abyme/react";
import connection from "@abyme/connection";
import state from "@abyme/state";
import storage from "@abyme/storage";
import shell from "@abyme/shell";
import layoutPanes from "@abyme/layout-panes";
import rail from "@abyme/rail";
import titlebar from "@abyme/titlebar";
import desktop from "@abyme/desktop";
import status from "@abyme/status";
import spaces from "@abyme/spaces";
import loading from "@abyme/loading";
import commands from "@abyme/commands";
import keys from "@abyme/keys";
import palette from "@abyme/palette";
import menus from "@abyme/menus";
import gestures from "@abyme/gestures";
import notifications from "@abyme/notifications";
import settings from "@abyme/settings";
import pluginManager from "@abyme/plugin-manager";
import catppuccin from "@abyme/catppuccin";
import dracula from "@abyme/dracula";
import everforest from "@abyme/everforest";
import githubTheme from "@abyme/github-theme";
import gruvbox from "@abyme/gruvbox";
import kanagawa from "@abyme/kanagawa";
import nord from "@abyme/nord";
import oneDark from "@abyme/one-dark";
import rosePine from "@abyme/rose-pine";
import solarized from "@abyme/solarized";
import tokyoNight from "@abyme/tokyo-night";
import texts from "@abyme/texts";
import editor from "@abyme/editor";
import viewers from "@abyme/viewers";
import explorer from "@abyme/explorer";
import search from "@abyme/search";
import documents from "@abyme/documents";
import markdown from "@abyme/markdown";
import openui from "@abyme/openui";
import d2 from "@abyme/d2";
import tabs from "@abyme/tabs";
import references from "@abyme/references";
import selection from "@abyme/selection";
import mcp from "@abyme/mcp";
import transcripts from "@abyme/transcripts";
import claude from "@abyme/claude";
import agents from "@abyme/agents";
import acp from "@abyme/acp";
import chat from "@abyme/chat";
import questions from "@abyme/questions";
import plan from "@abyme/plan";
import agentList from "@abyme/agent-list";
import newTab from "@abyme/new-tab";
import remote from "@abyme/remote";
import voice from "@abyme/voice";
import dictation from "@abyme/dictation";
import conversation from "@abyme/conversation";
import devices from "@abyme/devices";
import push from "@abyme/push";
import share from "@abyme/share";
import browser from "@abyme/browser";
import triggers from "@abyme/triggers";
import packages from "@abyme/packages";
import { common } from "../abyme-common/index.ts";

abyme.server({ port: 4478, stateDir: "~/.local/state/abyme-knowledge" });
// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Knowledge", color: "green", icon: "book" });
// The address devices reach it at: `tailscale serve` on 4446 in front of 127.0.0.1:4478.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4446" });

common({ lead: false });

// Not the standard set: what a vault of notes and learning needs, and nothing for code (no git,
// terminals, language servers or worktrees). Each line is its own setup; a plugin a kept one
// imports must be here too.
// The libraries every view draws with.
pluginApi.setup();
designSystem.setup();
codemirror.setup();
react.setup();
// The link to abymed, state every device shares, and what one device keeps.
connection.setup();
state.setup();
storage.setup();
// The frame: the layout, the rail, the title bar and status bar, and the app's window.
shell.setup();
layoutPanes.setup();
rail.setup();
titlebar.setup();
desktop.setup();
status.setup();
spaces.setup();
loading.setup();
// Driving it: commands, keys, quick open, menus, gestures (vim is common's).
commands.setup();
keys.setup();
palette.setup();
menus.setup();
gestures.setup();
// Telling me things, Settings, what runs, and the colours (every scheme, as each device chose one).
notifications.setup();
settings.setup();
pluginManager.setup();
catppuccin.setup();
dracula.setup();
everforest.setup();
githubTheme.setup();
gruvbox.setup();
kanagawa.setup();
nord.setup();
oneDark.setup();
rosePine.setup();
solarized.setup();
tokyoNight.setup();
// The vault's files: the tree, search across notes, images and PDFs.
texts.setup();
editor.setup();
viewers.setup();
explorer.setup();
search.setup();
// Notes as pages, with charts, diagrams, tabs, abyme: links and asking about a block.
documents.setup();
markdown.setup();
openui.setup();
d2.setup();
tabs.setup();
references.setup();
selection.setup();
// Agents that write, summarise and quiz from notes, and their tools.
mcp.setup();
transcripts.setup();
claude.setup();
agents.setup();
acp.setup();
chat.setup();
questions.setup();
plan.setup();
agentList.setup();
newTab.setup();
remote.setup();
// Voice, the phone (pairing, pushes, its share sheet), a browser for research, a daily nudge.
voice.setup();
dictation.setup();
conversation.setup();
devices.setup();
push.setup();
share.setup();
browser.setup();
triggers.setup();
packages.setup();

// Learning from documents (`.md`, the `documents` plugin's): the vault's documents are things
// to learn, its log (.learn/log.jsonl) the truth FSRS is computed from (docs/learning.md). Beside
// the Obsidian vault in ~/Knowledge/vault, not inside it.
learn.setup({ vault: "~/Knowledge/learn" });
