local conf = require "lspconfig"
local illuminate_ok, illuminate = pcall(require, "illuminate")

if illuminate_ok then
  map("n", "<C-n>", function()
    illuminate.next_reference { wrap = true }
  end)
  map("n", "<C-p>", function()
    illuminate.next_reference { wrap = true, reverse = true }
  end)
end

R.lsp.on_attach = function(client, _)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
end

R.lsp.capabilities = require("cmp_nvim_lsp").update_capabilities(
  vim.lsp.protocol.make_client_capabilities()
)
R.lsp.capabilities.textDocument.foldingRange = {
  dynamicRegistration = false,
  lineFoldingOnly = true,
}

---@param name string
---@param args table
local setup = function(name, args)
  conf[name].setup(vim.tbl_extend("keep", args or {}, {
    on_attach = R.lsp.on_attach,
    capabilities = R.lsp.capabilities,
  }))
end

setup "pyright"
setup "clojure_lsp"
setup "taplo"
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

setup("sqls", {
  on_attach = function(client, bufnr)
    require("sqls").on_attach(client, bufnr)
    R.lsp.on_attach(client)
    client.resolved_capabilities.document_formatting = false
  end,
})

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
      },
    },
  },
  on_attach = function(_, bufnr)
    local opts = vim.bo[bufnr]
    if opts.buftype ~= "" or opts.filetype == "helm" then
      vim.diagnostic.disable()
    end
  end,
})

setup("tsserver", {
  on_attach = function(client, _)
    require("nvim-lsp-ts-utils").setup {
      filter_out_diagnostics_by_code = { 80001, 7016 },
    }
    require("nvim-lsp-ts-utils").setup_client(client)
    R.lsp.on_attach(client)
  end,
})

local HOME = vim.fn.expand "$HOME"
local sumneko_root_path = HOME .. "/.config/lua-language-server"
local sumneko_binary = HOME
  .. "/.config/lua-language-server/bin/macOS/lua-language-server"
setup("sumneko_lua", {
  cmd = { sumneko_binary, "-E", sumneko_root_path .. "/main.lua" },
  settings = {
    Lua = {
      runtime = {
        version = "LuaJIT",
        path = vim.split(package.path, ";"),
      },
      diagnostics = {
        globals = { "vim" },
      },
      workspace = {
        library = {
          [vim.fn.expand "$VIMRUNTIME/lua"] = true,
          [vim.fn.expand "$VIMRUNTIME/lua/vim/lsp"] = true,
        },
      },
    },
  },
})
