local buf = vim.api.nvim_get_current_buf()

keymap({
  name = "Flutter",
  a = { "Run", "Run" },
  c = { "Run -d chrome --web-port=5000", "Run on chrome" },
  d = { "Devices", "List devices" },
  e = { "Emulators", "List emulators" },
  r = { "Reload", "Reload" },
  R = { "Restart", "Restart" },
  q = { "Quit", "Quit" },
    -- FlutterRun - Run the current project. This needs to be run from within a flutter project.
    -- FlutterDevices - Brings up a list of connected devices to select from.
    -- FlutterEmulators - Similar to devices but shows a list of emulators to choose from.
    -- FlutterReload - Reload the running project.
    -- FlutterRestart - Restart the current project.
    -- FlutterQuit - Ends a running session.
    -- FlutterDetach - Ends a running session locally but keeps the process running on the device.
    -- FlutterOutlineToggle - Toggle the outline window showing the widget tree for the given file.
    -- FlutterOutlineOpen - Opens an outline window showing the widget tree for the given file.
    -- FlutterDevTools - Starts a Dart Dev Tools server.
    -- FlutterCopyProfilerUrl - Copies the profiler url to your system clipboard (+ register). Note that commands FlutterRun and FlutterDevTools must be executed first.
    -- FlutterLspRestart - This command restarts the dart language server, and is intended for situations where it begins to work incorrectly.
    -- FlutterSuper - Go to super class, method using custom LSP method dart/textDocument/super.
    -- FlutterReanalyze - Forces LSP server reanalyze using custom LSP method dart/reanalyze.
}, {
  prefix = "<localleader>",
  buffer = buf,
  silent = false,
  mapping_prefix = "Flutter",
  cmd = true,
})
