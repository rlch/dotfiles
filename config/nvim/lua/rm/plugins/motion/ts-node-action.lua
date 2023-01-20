require("ts-node-action").setup {}
vim.keymap.set(
  "n",
  "<localleader>a",
  require("ts-node-action").node_action,
  { desc = "Trigger Node Action" }
)
