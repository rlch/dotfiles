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
        "run",
        "--module-download-mode=vendor",
        "--output.json.path=stdout",
        "--show-stats=false",
        "--output.text.print-issued-lines=false",
        "--output.text.print-linter-name=false",
        function()
          return vim.fn.fnamemodify(vim.api.nvim_buf_get_name(0), ":h")
        end,
      }
      require("lint").linters["markdownlint-cli2"].args = {
        "--config",
        "~/.markdownlint-cli2.jsonc",
      }
    end,
    opts = {
      linters_by_ft = {
        go = { "golangcilint" },
        markdown = { "markdownlint-cli2" },
      },
    },
  },

  -- Flutter/Dart
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        dart = { "dart_format" },
      },
    },
  },
  {
    "akinsho/flutter-tools.nvim",
    ft = { "dart" },
    main = "flutter-tools",
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
          enabled = false,
          background = false,
          foreground = false,
          virtual_text = true,
          virtual_text_str = "■",
        },
        init_options = {
          onlyAnalyzeProjectsWithOpenFiles = false,
        },
        settings = {
          lineLength = 100,
          completeFunctionCalls = true,
          renameFilesWithClasses = "always",
        },
      },
    },
    -- Every one of these used to be a bare `vim.keymap.set` inside `config`,
    -- i.e. global — opening a single Dart file stole `<localleader>r` (and a
    -- dozen other keys) in every buffer for the rest of the session. Same keys,
    -- now buffer-local to Dart via lazy's `keys.ft`.
    -- stylua: ignore start
    keys = {
      { "<localleader>a", "<cmd>FlutterReanalyze<cr>",         ft = "dart", desc = "Flutter reanalyze" },
      { "<localleader>d", "<cmd>FlutterDevices<cr>",           ft = "dart", desc = "Flutter devices" },
      { "<localleader>e", "<cmd>FlutterEmulators<cr>",         ft = "dart", desc = "Flutter emulators" },
      { "<localleader>o", "<cmd>FlutterOutlineOpen<cr>",       ft = "dart", desc = "Flutter outline open" },
      { "<localleader>l", ":tabedit | buffer __FLUTTER_DEV_LOG__<cr>", ft = "dart", desc = "Flutter logs" },
      { "<localleader>L", "<cmd>FlutterLspRestart<cr>",        ft = "dart", desc = "Flutter lsp restart" },
      { "<localleader>p", "<cmd>FlutterCopyProfilerUrl<cr>",   ft = "dart", desc = "Flutter copy profiler url" },
      { "<localleader>q", "<cmd>FlutterQuit<cr>",              ft = "dart", desc = "Flutter quit" },
      { "<localleader>R", "<cmd>FlutterRestart<cr>",           ft = "dart", desc = "Flutter restart" },
      { "<localleader>t", "<cmd>FlutterOutlineToggle<cr>",     ft = "dart", desc = "Flutter outline toggle" },
      { "<localleader>v", "<cmd>FlutterDevTools<cr>",          ft = "dart", desc = "Flutter dev tools" },
      { "<localleader>V", "<cmd>FlutterDevToolsActivate<cr>",  ft = "dart", desc = "Flutter dev tools activate" },
      { "<localleader>s", "<cmd>FlutterSuper<cr>",             ft = "dart", desc = "Flutter super" },
      { "<localleader>n", "<cmd>FlutterRename<cr>",            ft = "dart", desc = "Flutter rename" },
      {
        "<localleader>r",
        function()
          local commands = require("flutter-tools.commands")
          if commands.is_running() then
            commands.reload(false)
          else
            commands.run({})
          end
        end,
        ft = "dart",
        desc = "Flutter run/reload",
      },
      {
        "<localleader>D",
        function()
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
        end,
        ft = "dart",
        desc = "Flutter toggle run via DAP",
      },
      {
        "<localleader>xa",
        function() require("dap").set_exception_breakpoints({ "All" }) end,
        ft = "dart", desc = "Stop on all exceptions",
      },
      {
        "<localleader>xu",
        function() require("dap").set_exception_breakpoints({ "Unhandled" }) end,
        ft = "dart", desc = "Stop on unhandled exceptions",
      },
      {
        "<localleader>xx",
        function() require("dap").set_exception_breakpoints({}) end,
        ft = "dart", desc = "Clear exception breakpoints",
      },
    },
    -- stylua: ignore end
  },

  -- Markdown
  -- LazyVim's lang.markdown extra ships render-markdown.nvim + markdown-preview.nvim;
  -- markview is the chosen renderer, so disable the extras to avoid double-render.
  { "MeanderingProgrammer/render-markdown.nvim", enabled = false },
  { "iamcco/markdown-preview.nvim", enabled = false },
  {
    "OXY2DEV/markview.nvim",
    -- Lazy-load on the filetypes markview actually previews. `lazy = false`
    -- caused treesitter.start() failures on the startup no-filetype buffer.
    ft = { "markdown", "md", "norg", "rmd", "org", "vimwiki", "typst", "latex", "quarto" },
    dependencies = { "saghen/blink.cmp" },
    ---@class mkv.config
    config = function()
      local presets = require("markview.presets")
      require("markview").setup({
        experimental = { check_rtp = false },
        preview = {
          filetypes = {
            "md",
            "markdown",
            "norg",
            "rmd",
            "org",
            "vimwiki",
            "typst",
            "latex",
            "quarto",
          },
          ignore_buftypes = { "nofile", "terminal", "quickfix", "prompt", "help" },
          -- "i" (insert) deliberately omitted: markview conceals surround
          -- markup (** / * / ~~ / `) which makes editing impossible to follow
          -- in insert mode. Normal / operator-pending / command get preview;
          -- insert reverts to raw markdown so what you type is what you see.
          modes = { "n", "no", "c" },
          debounce = 0,
          -- No `condition` override: returning `true` makes markview attach
          -- without checking the filetype list, and BufAdd (fired by neo-tree
          -- before filetype detection) hits treesitter.start() with no lang
          -- → "Parser not found, language could not be determined". Letting
          -- markview fall back to its default ignore_buftypes + filetypes
          -- check skips those bare buffers correctly.
        },
        ---@diagnostic disable-next-line: missing-fields
        markdown = {
          headings = presets.headings.marker,
        },
      })
    end,
  },
  {
    "davidmh/mdx.nvim",
    event = "BufEnter *.mdx",
    dependencies = "nvim-treesitter/nvim-treesitter",
    config = true,
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
      opts.on_attach = LazyVim.lsp.on_attach(function()
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
    "mason-org/mason.nvim",
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

  -- HTTP
  {
    "rest-nvim/rest.nvim",
    ft = { "http" },
    -- Two fixes over the original: `ft` keeps these buffer-local (without it
    -- they went global the moment rest.nvim loaded, fighting Flutter's and
    -- luapad's `<localleader>` maps), and every `<cmd>` payload now ends in
    -- `<cr>` — without it Neovim raises E5520 and the mapping never ran. The
    -- two that take an argument use a plain `:` so the cmdline stays open.
    -- stylua: ignore
    keys = {
      { "<localleader>o",  "<cmd>Rest open<cr>",     ft = "http", mode = { "n" }, desc = "Open result pane" },
      { "<localleader>r",  "<cmd>Rest run<cr>",      ft = "http", mode = { "n" }, desc = "Run request under the cursor" },
      { "<localleader>R",  ":Rest run ",             ft = "http", mode = { "n" }, desc = "Run request by name" },
      { "<localleader>h",  "<cmd>Rest last<cr>",     ft = "http", mode = { "n" }, desc = "Run last request" },
      { "<localleader>l",  "<cmd>Rest logs<cr>",     ft = "http", mode = { "n" }, desc = "Edit logs file" },
      { "<localleader>c",  "<cmd>Rest cookies<cr>",  ft = "http", mode = { "n" }, desc = "Edit cookies file" },
      { "<localleader>eo", "<cmd>Rest env show<cr>", ft = "http", mode = { "n" }, desc = "Show dotenv file registered to current .http file" },
      { "<localleader>es", "<cmd>Rest env select<cr>", ft = "http", mode = { "n" }, desc = "Select & register .env file with vim.ui.select()" },
      { "<localleader>er", ":Rest env set ",         ft = "http", mode = { "n" }, desc = "Register .env file to current .http file" },
    },
  },

  -- Neotest
  {
    "nvim-neotest/neotest",
    dependencies = {
      "marilari88/neotest-vitest",
      "MisanthropicBit/neotest-busted",
      "fredrikaverpil/neotest-golang",
      "sidlatau/neotest-dart",
    },
    opts = {
      output = {
        enabled = true,
        open_on_run = "short",
      },
      output_panel = {
        enabled = true,
        open = "botright split | resize 15",
      },
      adapters = {
        ["neotest-vitest"] = {},
        ["neotest-golang"] = {
          -- runner = "gotestsum",
          warn_test_name_dupes = false,
          warn_test_not_executed = false,
        },
        ["neotest-dart"] = {
          command = vim.fn.expand("~/fvm/default/bin/flutter"),
          use_lsp = true,
        },
        -- require("rustaceanvim.neotest"),
      },
    },
  },
  {
    "fredrikaverpil/neotest-golang",
  },

  -- TypeScript: vtsls is configured via lsp/vtsls.lua + vim.lsp.enable("vtsls")
  -- in init.lua (Neovim 0.11+ pattern). Don't double-register here under
  -- opts.servers — LazyVim would overwrite the lsp/ config with empty {}.

  -- Alloy
  {
    "grafana/vim-alloy",
    ft = { "alloy" },
  },

  -- GraphQL
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        -- graphql = {},
      },
    },
  },

  -- CSV
  {
    "hat0uma/csvview.nvim",
    ft = "csv",
    ---@module "csvview"
    ---@type CsvView.Options
    opts = {
      parser = { comments = { "#", "//" } },
      keymaps = {
        -- Text objects for selecting fields
        textobject_field_inner = { "if", mode = { "o", "x" } },
        textobject_field_outer = { "af", mode = { "o", "x" } },
        -- Excel-like navigation:
        -- Use <Tab> and <S-Tab> to move horizontally between fields.
        -- Use <Enter> and <S-Enter> to move vertically between rows and place the cursor at the end of the field.
        -- Note: In terminals, you may need to enable CSI-u mode to use <S-Tab> and <S-Enter>.
        jump_next_field_end = { "<Tab>", mode = { "n", "v" } },
        jump_prev_field_end = { "<S-Tab>", mode = { "n", "v" } },
        jump_next_row = { "<Enter>", mode = { "n", "v" } },
        jump_prev_row = { "<S-Enter>", mode = { "n", "v" } },
      },
      view = {
        display_mode = "border",
        min_column_width = 3,
      },
    },
    cmd = { "CsvViewEnable", "CsvViewDisable", "CsvViewToggle" },
  },

  -- SQL
  {
    "stevearc/conform.nvim",
    optional = true,
    opts = function(_, opts)
      opts.formatters.sqlfluff = {
        args = { "format", "--dialect=postgres", "-" },
      }
      return opts
    end,
  },

  -- Rust
  {
    "mason-org/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
    end,
  },
  {
    "jay-babu/mason-nvim-dap.nvim",
    dependencies = { "mason-org/mason.nvim", "mfussenegger/nvim-dap" },
    lazy = false,
    opts = {
      -- Exclude `chrome`: mason-nvim-dap's mapping for it points at the
      -- `chrome-debug-adapter` package, which mason's registry no longer ships.
      -- js debugging still works via `js-debug-adapter` (installed elsewhere).
      automatic_installation = { exclude = { "chrome" } },
      ensure_installed = {
        "codelldb",
      },
    },
  },
  {
    "mrcjkb/rustaceanvim",
    lazy = false,
    version = "^9",
    build = "rustup component add rust-analyzer",
    -- rust-analyzer resolves the actual bin/test/example under the cursor, so
    -- these beat a generic `cargo run` from overseer — and being ft-scoped,
    -- they shadow the global overseer `<localleader>r`/`R` inside Rust buffers.
    -- The `!` variants replay the last runnable/debuggable with no picker.
    -- stylua: ignore
    keys = {
      { "<localleader>r", "<cmd>RustLsp runnables<cr>",    ft = "rust", desc = "Runnables" },
      { "<localleader>R", "<cmd>RustLsp! runnables<cr>",   ft = "rust", desc = "Run last runnable" },
      { "<localleader>d", "<cmd>RustLsp debuggables<cr>",  ft = "rust", desc = "Debuggables" },
      { "<localleader>D", "<cmd>RustLsp! debuggables<cr>", ft = "rust", desc = "Debug last debuggable" },
      { "<localleader>t", "<cmd>RustLsp testables<cr>",    ft = "rust", desc = "Testables" },
      { "<localleader>e", "<cmd>RustLsp explainError<cr>", ft = "rust", desc = "Explain error" },
      { "<localleader>m", "<cmd>RustLsp expandMacro<cr>",  ft = "rust", desc = "Expand macro" },
    },
    init = function()
      vim.g.rustaceanvim = {
        tools = {},
        server = {
          default_settings = {
            ["rust-analyzer"] = {
              -- RA gets its own <target>/rust-analyzer subdir so its cargo check
              -- doesn't share/thrash the CLI's target-dir (e.g. modality's
              -- .shared-target) and lock Cargo.lock against a terminal build.
              cargo = { targetDir = true },
              inlayHints = {
                -- Burn's inferred tensor types overwhelm the source; retain
                -- parameter, generic-parameter, and other focused hints.
                typeHints = { enable = false },
              },
            },
          },
        },
      }
    end,
  },
}
