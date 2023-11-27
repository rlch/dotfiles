return {
  -- Markdown
  {
    "lukas-reineke/headlines.nvim",
    ft = { "markdown", "norg", "rmd", "org" },
    opts = function()
      return {
        markdown = {
          headline_highlights = {
            "Headline1",
            "Headline2",
          },
        },
      }
    end,
    config = function(_, opts)
      -- PERF: schedule to prevent headlines slowing down opening a file
      vim.schedule(function()
        require("headlines").setup(opts)
        require("headlines").refresh()
      end)
    end,
  },
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      vim.list_extend(opts.ensure_installed, { "vale" })
    end,
  },
  {
    "mfussenegger/nvim-lint",
    init = function()
      require("lint").linters.markdownlint.args = {
        "--disable",
        "MD013",
      }
    end,
    opts = {
      linters_by_ft = {
        markdown = { "markdownlint" },
      },
    },
  },

  -- Scala
  {
    "scalameta/nvim-metals",
    ft = {
      "scala",
      "java",
      "sbt",
    },
    opts = function()
      local opts = require("metals").bare_config()
      opts.settings = {
        showImplicitArguments = true,
        excludedPackages = { "akka.actor.typed.javadsl", "com.github.swagger.akka.javadsl" },
      }
      return opts
    end,
    config = function(_, opts)
      local dap = require("dap")
      dap.configurations.scala = {
        {
          type = "scala",
          request = "launch",
          name = "Run Or Test",
          metals = {
            runType = "runOrTestFile",
          },
        },
        {
          type = "scala",
          request = "launch",
          name = "Test Target",
          metals = {
            runType = "testTarget",
          },
        },
      }
      opts.on_attach = require("lazyvim.util").lsp.on_attach(function()
        require("metals").setup_dap()
      end)
      require("metals").initialize_or_attach(opts)
    end,
  },
}
