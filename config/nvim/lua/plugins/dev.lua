return {
  {
    "rafcamlet/nvim-luapad",
    cmd = { "Luapad" },
    ft = "lua",
    opts = { eval_on_change = false },
    config = function(_, opts)
      require("which-key").register({
        ["<localleader>"] = {
          p = { "<cmd>Luapad<cr>", "Luapad" },
          r = { "<cmd>LuaRun<cr>", "LuaRun" },
          w = { "<cmd>echo win_getid()<cr>", "win_getid" },
        },
      })
      require("luapad").setup(opts)
    end,
  },
}
