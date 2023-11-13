return {
  {
    "smjonas/inc-rename.nvim",
    config = function()
      require("inc_rename").setup()
    end,
    keys = {
      { "n", "gr", "<cmd>IncRename " },
    },
  },
}
