local ok, navic = pcall(require, "nvim-navic")
if not ok then
  return
end

-- Suppress error messages
vim.g.navic_silence = true

local icons = R.icons
local space = ""
if vim.fn.has "mac" == 1 then
  space = " "
end
local pad = function(icon)
  return icon .. space
end
navic.setup {
  icons = {
    File = pad(icons.lsp.File),
    Module = pad(icons.lsp.Module),
    Namespace = pad(icons.lsp.Module),
    Package = pad(icons.lsp.Module),
    Class = pad(icons.lsp.Class),
    Method = pad(icons.lsp.Method),
    Property = pad(icons.lsp.Property),
    Field = pad(icons.lsp.Field),
    Constructor = pad(icons.lsp.Constructor),
    Enum = pad(icons.lsp.Enum),
    Interface = pad(icons.lsp.Interface),
    Function = pad(icons.lsp.Function),
    Variable = pad(icons.lsp.Variable),
    Constant = pad(icons.lsp.Color),
    String = pad(icons.lsp.Text),
    Number = pad(icons.lsp.Number),
    Boolean = pad(icons.lsp.Boolean),
    Array = pad(icons.lsp.Array),
    Object = pad(icons.lsp.Object),
    Key = pad(icons.lsp.Key),
    Null = pad(icons.lsp.Null),
    EnumMember = pad(icons.lsp.EnumMember),
    Struct = pad(icons.lsp.Struct),
    Event = pad(icons.lsp.Event),
    Operator = pad(icons.lsp.Operator),
    TypeParameter = pad(icons.lsp.Operator),
    Unit = pad(icons.lsp.Unit),
  },
  highlight = true,
  separator = " " .. icons.ui.ChevronRight .. " ",
  depth_limit = 0,
  depth_limit_indicator = "..",
  safe_output = true,
}

local hls = {
  { "NavicIconsFile", "CmpItemKindFile" },
  { "NavicIconsModule", "CmpItemKindModule" },
  { "NavicIconsNamespace", "CmpItemKindModule" },
  { "NavicIconsPackage", "CmpItemKindModule" },
  { "NavicIconsClass", "CmpItemKindClass" },
  { "NavicIconsMethod", "CmpItemKindMethod" },
  { "NavicIconsProperty", "CmpItemKindProperty" },
  { "NavicIconsField", "CmpItemKindField" },
  { "NavicIconsConstructor", "CmpItemKindConstructor" },
  { "NavicIconsEnum", "CmpItemKindEnum" },
  { "NavicIconsInterface", "CmpItemKindInterface" },
  { "NavicIconsFunction", "CmpItemKindFunction" },
  { "NavicIconsVariable", "CmpItemKindVariable" },
  { "NavicIconsConstant", "CmpItemKindConstant" },
  { "NavicIconsString", "CmpItemKindValue" },
  { "NavicIconsNumber", "CmpItemKindValue" },
  { "NavicIconsBoolean", "CmpItemKindValue" },
  { "NavicIconsArray", "CmpItemKindValue" },
  { "NavicIconsObject", "CmpItemKindStruct" },
  { "NavicIconsKey", "CmpItemKindValue" },
  { "NavicIconsNull", "CmpItemKindValue" },
  { "NavicIconsEnumMember", "CmpItemKindEnumMember" },
  { "NavicIconsStruct", "CmpItemKindStruct" },
  { "NavicIconsEvent", "CmpItemKindEvent" },
  { "NavicIconsOperator", "CmpItemKindOperator" },
  { "NavicIconsTypeParameter", "CmpItemKindTypeParameter" },
  { "NavicText", "LineNr" },
  { "NavicSeparator", "LineNr" },
}
for _, hl in pairs(hls) do
  vim.api.nvim_set_hl(0, hl[1], { link = hl[2], default = true })
end
