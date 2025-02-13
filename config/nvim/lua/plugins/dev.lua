return {
  {
    "rafcamlet/nvim-luapad",
    cmd = { "Luapad" },
    ft = "lua",
    opts = { eval_on_change = false },
    keys = {},
    config = function(_, opts)
      require("which-key").add({
        { "<localleader>p", "<cmd>Luapad<cr>", desc = "Luapad" },
        { "<localleader>r", "<cmd>LuaRun<cr>", desc = "LuaRun" },
        { "<localleader>w", "<cmd>echo win_getid()<cr>", desc = "win_getid" },
      })
      require("luapad").setup(opts)
    end,
  },
}
