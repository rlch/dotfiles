local conf = require "lspconfig"
local illuminate_ok, illuminate = pcall(require, "illuminate")
local navic_ok, navic = pcall(require, "nvim-navic")
local inlay_ok, inlay = pcall(require, "lsp-inlayhints")

if illuminate_ok then
  map("n", "<C-n>", function()
    illuminate.next_reference { wrap = true }
  end)
  map("n", "<C-p>", function()
    illuminate.next_reference { wrap = true, reverse = true }
  end)
end

R.lsp.on_attach = function(client, bufnr)
  if illuminate_ok then
    illuminate.on_attach(client)
  end
  if navic_ok then
    navic.attach(client, bufnr)
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

setup("sqls", {
  on_attach = function(client, bufnr)
    require("sqls").on_attach(client, bufnr)
    R.lsp.on_attach(client, bufnr)
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

-- local HOME = vim.fn.expand "$HOME"
-- local sumneko_root_path = HOME .. "/.config/lua-language-server"
-- local sumneko_binary = HOME
--   .. "/.config/lua-language-server/bin/macOS/lua-language-server"
setup("sumneko_lua", {
  -- cmd = { sumneko_binary, "-E", sumneko_root_path .. "/main.lua" },
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
