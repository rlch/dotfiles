local conf = require "lspconfig"
local illuminate_ok, illuminate = pcall(require, "illuminate")
local navic_ok, navic = pcall(require, "nvim-navic")
local navbuddy_ok, navbuddy = pcall(require, "nvim-navbuddy")
local inlay_ok, inlay = pcall(require, "lsp-inlayhints")

local neodev_ok, neodev = pcall(require, "neodev")
if neodev_ok then
  neodev.setup {}
end

if illuminate_ok then
  keymap {
    name = "Illuminate",
    ["<C-n>"] = {
      function()
        illuminate.next_reference { wrap = true }
      end,
      "Next reference",
    },
    ["<C-p>"] = {
      function()
        illuminate.next_reference { wrap = true, reverse = true }
      end,
      "Previous reference",
    },
  }
end

R.lsp.on_attach = function(client, bufnr)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
  if navic_ok then
    navic.attach(client, bufnr)
  end
  if navbuddy_ok then
    navbuddy.attach(client, bufnr)
  end
  if inlay_ok then
    vim.api.nvim_set_hl(0, "LspInlayHint", { default = true, link = "Comment" })
    inlay.on_attach(client, bufnr)
  end
end

R.lsp.capabilities = require("cmp_nvim_lsp").default_capabilities()
R.lsp.capabilities.textDocument.foldingRange = {
  dynamicRegistration = false,
  lineFoldingOnly = true,
}

---@param name string
---[@param] args table
local setup = function(name, args)
  conf[name].setup(vim.tbl_extend("keep", args or {}, {
    on_attach = R.lsp.on_attach,
    capabilities = R.lsp.capabilities,
  }))
end

setup "pyright"
setup "clojure_lsp"
setup "taplo"
setup "marksman"
setup("terraformls", {
  filetypes = { "terraform", "tf" },
})
setup("graphql", {
  filetypes = {
    "graphql",
    "gql",
    "graphqls",
    "typescriptreact",
    "javascriptreact",
  },
})
setup "dockerls"

setup("sqlls", {
  on_attach = function(client, bufnr)
    require("sqls").on_attach(client, bufnr)
    R.lsp.on_attach(client, bufnr)
    client.resolved_capabilities.document_formatting = false
  end,
})

setup "jsonls"

setup("yamlls", {
  settings = {
    yaml = {
      format = {
        enable = true,
        singleQuote = true,
      },
      schemas = {
        ["https://json.schemastore.org/chart.json"] = "Chart.yaml",
        ["https://json.schemastore.org/github-workflow.json"] = "/.github/workflows/*",
        ["https://raw.githubusercontent.com/Praqma/helmsman/master/schema.json"] = "helmsman.*.yaml",
      },
    },
  },
  on_attach = function(_, bufnr)
    local opts = vim.bo[bufnr]
    local name = vim.api.nvim_buf_get_name(bufnr)
    if opts.buftype ~= "" or name:match ".*templates/[^/]*%.yaml" then
      vim.diagnostic.disable()
    end
  end,
})

setup("tsserver", {
  on_attach = function(client, bufnr)
    require("nvim-lsp-ts-utils").setup {
      filter_out_diagnostics_by_code = { 80001, 7016 },
    }
    require("nvim-lsp-ts-utils").setup_client(client)
    R.lsp.on_attach(client, bufnr)
  end,
})

setup("tailwindcss", {
  filetypes = {
    "html",
    "css",
    "scss",
    "javascriptreact",
    "typescriptreact",
  },
})

setup("lua_ls", {
  settings = {
    Lua = {
      runtime = {
        version = "LuaJIT",
        path = vim.split(package.path, ";"),
      },
      diagnostics = {
        globals = { "vim" },
      },
      completion = {
        callSnippet = "Replace",
      },
      -- workspace = {
      --   library = {
      --     [vim.fn.expand "$VIMRUNTIME/lua"] = true,
      --     [vim.fn.expand "$VIMRUNTIME/lua/vim/lsp"] = true,
      --   },
      -- },
    },
  },
})
