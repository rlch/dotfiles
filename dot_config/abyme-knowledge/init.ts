// Runs inside abymed, once, before it listens; again whenever you save it or a file it imports.
// See docs/abymed.md, "Your config" and "Several abymeds".
//
// The knowledge profile, knowledge.localhost:4477 beside coding (~/.config/abyme): notes and learning. Its
// own state (~/.local/state/abyme-knowledge), agents and processes; the gateway starts it when it
// is opened (`abyme profiles add`). What every profile shares is ../abyme-common.

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
import spacesView from "@abyme/spaces-view";
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
import mermaid from "@abyme/mermaid";
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
import profiles from "@abyme/profiles";
import packages from "@abyme/packages";
import problems from "@abyme/problems";
import learnRules from "@abyme/learn-rules";
import ml from "/Users/rjm/Knowledge/subjects/ml";
import { common } from "../abyme-common/index.ts";

abyme.server({ port: 4478, stateDir: "~/.local/state/abyme-knowledge" });
// The profile, as the app's start window and the phone list it under this Mac.
abyme.server({ name: "Knowledge", color: "green", icon: "book" });
// The address devices reach it at: `tailscale serve` on 4446 in front of the gateway (127.0.0.1:4477),
// which routes it here.
abyme.server({ url: "https://richards-macbook-pro-2.tail21822e.ts.net:4446" });

common();

// No app: what a vault of notes and learning needs, and nothing for code (no git,
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
// No app gives this profile a placement: the views it keeps in the left dock.
layoutPanes.setup({
  placement: {
    spaces: { dock: "left", order: 5 }, agents: { dock: "left", order: 10 }, explorer: { dock: "left", order: 20 },
    search: { dock: "left", order: 25 }, problems: { dock: "left", order: 30 }, "settings.list": { dock: "left", order: 90 },
  },
});
rail.setup({ items: ["spaces", "agents", "explorer", "learn.study", "problems", "triggers.triggers", "settings.settings"] });
titlebar.setup();
desktop.setup();
status.setup();
spaces.setup();
spacesView.setup();
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
mermaid.setup();
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
// What keeps this profile in use, which the gateway reads before it suspends it.
profiles.setup();
packages.setup();

// Learning (docs/learning.md): ~/Knowledge's notes, each claimed by a subject in its subjects/
// folder; the log (.learn/log.jsonl) is the truth schedules are computed from. Problems in the
// notes, the subjects and the log show in the Problems view.
problems.setup();
learn.setup({ folder: "~/Knowledge" });
learnRules.setup();
ml.setup();
