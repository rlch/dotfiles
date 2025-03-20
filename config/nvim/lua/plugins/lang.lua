return {
  -- Golang
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        gopls = {
          settings = {
            gopls = {
              gofumpt = true,
              codelenses = {
                gc_details = false,
                generate = true,
                regenerate_cgo = true,
                run_govulncheck = true,
                test = true,
                tidy = true,
                upgrade_dependency = true,
                vendor = true,
              },
              hints = {
                assignVariableTypes = true,
                compositeLiteralFields = true,
                compositeLiteralTypes = false,
                constantValues = false,
                functionTypeParameters = true,
                parameterNames = true,
                rangeVariableTypes = true,
              },
              analyses = {
                fieldalignment = false,
                nilness = true,
                unusedparams = true,
                unusedwrite = true,
                useany = true,
              },
              completeUnimported = true,
              staticcheck = true,
              directoryFilters = { "-.git", "-.vscode", "-.idea", "-.vscode-test", "-node_modules" },
              semanticTokens = true,
              usePlaceholders = false,
            },
          },
        },
      },
    },
  },

  {
    "mfussenegger/nvim-lint",
    init = function()
      require("lint").linters.golangcilint.args = {
        "--module-download-mode=vendor",
      }
    end,
    opts = {
      linters_by_ft = {
        go = { "golangcilint" },
      },
    },
  },

  -- Flutter/Dart
  {
    "akinsho/flutter-tools.nvim",
    ft = { "dart" },
    requires = {
      "nvim-lua/plenary.nvim",
    },
    opts = {
      ui = {
        border = "rounded",
      },
      decorations = {
        statusline = {
          device = true,
        },
      },
      debugger = {
        enabled = true,
        run_via_dap = false,
        exception_breakpoints = { "raised", "uncaught" },
        register_configurations = function(_)
          require("dap").configurations.dart = {
            {
              type = "dart",
              request = "launch",
              name = "Debug on Chrome",
              program = "${file}",
              cwd = "${workspaceFolder}",
              toolArgs = { "-d", "chrome" },
              args = { "--web-port=5000" },
              deviceId = "chrome",
              flutterMode = "debug",
            },
            {
              type = "dart",
              request = "launch",
              name = "Debug",
              program = "${file}",
              cwd = "${workspaceFolder}",
              flutterMode = "debug",
            },
          }
        end,
      },
      fvm = true,
      dev_log = {
        enabled = true,
        open_cmd = "tabedit",
      },
      lsp = {
        color = {
          enabled = true,
          background = false,
          foreground = false,
          virtual_text = true,
          virtual_text_str = "■",
        },
        init_options = {
          onlyAnalyzeProjectsWithOpenFiles = true,
        },
        settings = {
          lineLength = 100,
          completeFunctionCalls = true,
          renameFilesWithClasses = "always",
        },
      },
    },
    config = function(_, opts)
      local map = vim.keymap.set
      local dap = require("dap")
      require("flutter-tools").setup(opts)

      map("n", "<localleader>a", "<cmd>FlutterReanalyze<cr>", { desc = "Flutter reanalyze" })
      map("n", "<localleader>d", "<cmd>FlutterDevices<cr>", { desc = "Flutter devices" })
      map("n", "<localleader>D", function()
        local lazy = require("flutter-tools.lazy")
        local config = lazy.require("flutter-tools.config")
        local notify = require("notify")
        local run_via_dap = not config.debugger.run_via_dap
        local dev_log_enabled = not config.dev_log.enabled
        config.debugger.run_via_dap = run_via_dap
        config.dev_log.enabled = dev_log_enabled
        if run_via_dap then
          notify("Run via DAP enabled", "info", { title = "Flutter Tools" })
        else
          notify("Run via DAP disabled", "info", { title = "Flutter Tools" })
        end
      end, { desc = "Flutter toggle run via DAP" })
      map("n", "<localleader>e", "<cmd>FlutterEmulators<cr>", { desc = "Flutter emulators" })
      map("n", "<localleader>o", "<cmd>FlutterOutlineOpen<cr>", { desc = "Flutter outline open" })
      map("n", "<localleader>l", ":tabedit | buffer __FLUTTER_DEV_LOG__<CR>", { desc = "Flutter logs" })
      map("n", "<localleader>L", "<cmd>FlutterLspRestart<cr>", { desc = "Flutter lsp restart" })
      map("n", "<localleader>p", "<cmd>FlutterCopyProfilerUrl<cr>", { desc = "Flutter copy profiler url" })
      map("n", "<localleader>q", "<cmd>FlutterQuit<cr>", { desc = "Flutter quit" })
      map("n", "<localleader>r", function()
        local commands = require("flutter-tools.commands")
        if commands.is_running() then
          commands.reload(false)
        else
          commands.run({})
        end
      end, { desc = "Flutter run/reload" })
      map("n", "<localleader>R", "<cmd>FlutterRestart<cr>", { desc = "Flutter restart" })
      map("n", "<localleader>t", "<cmd>FlutterOutlineToggle<cr>", { desc = "Flutter outline toggle" })
      map("n", "<localleader>v", "<cmd>FlutterDevTools<cr>", { desc = "Flutter dev tools" })
      map("n", "<localleader>V", "<cmd>FlutterDevToolsActivate<cr>", { desc = "Flutter dev tools activate" })
      map("n", "<localleader>s", "<cmd>FlutterSuper<cr>", { desc = "Flutter super" })
      map("n", "<localleader>n", "<cmd>FlutterRename<cr>", { desc = "Flutter rename" })

      map("n", "<localleader>xa", function()
        dap.set_exception_breakpoints({ "All" })
      end, { desc = "Stop on all exceptions" })
      map("n", "<localleader>xu", function()
        dap.set_exception_breakpoints({ "Unhandled" })
      end, { desc = "Stop on unhandled exceptions" })
      map("n", "<localleader>xx", function()
        dap.set_exception_breakpoints({})
      end, { desc = "Clear exception breakpoints" })
    end,
  },

  -- Markdown
  -- {
  --   "lukas-reineke/headlines.nvim",
  --   ft = { "markdown", "norg", "rmd", "org", "Avante", "codecompanion" },
  --   opts = function()
  --     return {
  --       markdown = {
  --         headline_highlights = {
  --           "Headline1",
  --           "Headline2",
  --         },
  --       },
  --     }
  --   end,
  --   config = function(_, opts)
  --     -- PERF: schedule to prevent headlines slowing down opening a file
  --     vim.schedule(function()
  --       require("headlines").setup(opts)
  --       require("headlines").refresh()
  --     end)
  --   end,
  -- },
  {
    "MeanderingProgrammer/render-markdown.nvim",
    opts = {
      render_modes = true,
      heading = {
        sign = false,
        icons = {},
      },
    },
    ft = { "markdown", "codecompanion", "Avante" },
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

  -- YAML
  {
    "neovim/nvim-lspconfig",
    opts = {
      -- make sure mason installs the server
      servers = {
        yamlls = {
          capabilities = {
            textDocument = {
              foldingRange = {
                dynamicRegistration = false,
                lineFoldingOnly = true,
              },
            },
          },
          settings = {
            redhat = { telemetry = { enabled = false } },
            yaml = {
              keyOrdering = false,
              format = {
                enable = true,
              },
              validate = true,
              schemaStore = {
                -- Must disable built-in schemaStore support to use
                -- schemas from SchemaStore.nvim plugin
                enable = false,
                -- Avoid TypeError: Cannot read properties of undefined (reading 'length')
                url = "",
              },
              schemas = vim.tbl_deep_extend(
                "force",
                require("schemastore").yaml.schemas({
                  -- select subset from the JSON schema catalog
                  select = {
                    "kustomization.yaml",
                    "docker-compose.yml",
                    "GitHub Workflow",
                    "Helm Chart.yaml",
                    "Helm Chart.lock",
                  },
                }),
                {
                  ["https://raw.githubusercontent.com/fluxcd-community/flux2-schemas/refs/heads/main/helmrelease-helm-v2.json"] = "release.yaml",
                }
              ),
            },
          },
          on_new_config = function(new_config)
            new_config.settings.yaml.schemas = vim.tbl_deep_extend(
              "force",
              new_config.settings.yaml.schemas or {},
              require("schemastore").yaml.schemas()
            )
          end,
        },
      },
    },
  },
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      vim.list_extend(opts.ensure_installed, { "helm-ls" })
    end,
  },

  -- Polar
  {
    "osohq/polar.vim",
    ft = { "polar" },
  },

  -- Nix
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        nix = { "alejandra" },
      },
    },
  },

  -- PHP
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      vim.list_extend(opts.ensure_installed, { "phpactor" })
    end,
  },

  -- HTTP
  {
    "rest-nvim/rest.nvim",
    ft = { "http" },
    keys = {
      {
        "<localleader>o",
        "<cmd>Rest open",
        desc = "Open result pane",
        mode = { "n" },
      },
      {
        "<localleader>r",
        "<cmd>Rest run",
        desc = "Run request under the cursor.",
        mode = { "n" },
      },
      {
        "<localleader>",
        "<cmd>Rest run {name}",
        "Run request with name {name}",
        mode = { "n" },
      },
      {
        "<localleader>h",
        "<cmd>Rest last",
        desc = "Run last request",
        mode = { "n" },
      },
      {
        "<localleader>l",
        "<cmd>Rest logs",
        desc = "Edit logs file",
        mode = { "n" },
      },
      {
        "<localleader>c",
        "<cmd>Rest cookies",
        desc = "Edit cookies file",
        mode = { "n" },
      },
      {
        "<localleader>eo",
        "<cmd>Rest env show",
        desc = "Show dotenv file registered to current .http file",
        mode = { "n" },
      },
      {
        "<localleader>es",
        "<cmd>Rest env select ",
        desc = "Select & register .env file with vim.ui.select()",
        mode = { "n" },
      },
      { "<localleader>er", "<cmd>Rest env set ", desc = "Register .env file to current .http file", mode = { "n" } },
    },
  },

  -- Neotest
  {
    "nvim-neotest/neotest",
    dependencies = {
      "marilari88/neotest-vitest",
    },
    opts = {
      adapters = {
        ["neotest-vitest"] = {},
      },
    },
  },

  -- TypeScript

  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        vtsls = {
          root_dir = function(fname)
            local node = vim.fs.root(fname, { "package.json", "node_modules" })
            if node then
              local deno = vim.fs.root(fname, { "deno.json" })
              if not deno or #deno > #node then
                return node
              end
            end
          end,
        },
      },
    },
  },
}
