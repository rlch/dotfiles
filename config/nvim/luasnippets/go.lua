---@diagnostic disable: undefined-global
local ls = require("luasnip")

local log_levels = {
  "Debug",
  "Info",
  "Warn",
  "Error",
  "DPanic",
  "Panic",
  "Fatal",
}

for _, type in ipairs(log_levels) do
  ls.add_snippets("go", {
    snippet({ trig = (type:lower() .. "log"), name = "log (" .. type:lower() .. ")" }, {
      c(1, {
        t(""),
        t({ "l := log.From(ctx)", "" }),
      }),
      t("l."),
      t(type),
      t("("),
      i(2, "message"),
      t(")"),
    }),
    snippet({
      trig = ("s" .. type:lower() .. "!"),
      name = "sugared log (" .. type:lower() .. ")",
    }, {
      c(1, {
        t(""),
        t({ "l := log.SugaredFrom(ctx)", "" }),
      }),
      t("l."),
      t(type),
      c(2, { t(""), t("f"), t("ln"), t("w") }),
      t("("),
      i(3, "message"),
      t(")"),
    }),
  })
end

return {
  snippet(
    "span",
    fmt(
      [[
ctx, span := otel.GetTracerProvider().Tracer("github.com/MathGaps/{}").Start(ctx, "{}")
{}
]],
      {
        i(1, "package"),
        i(2, "spanName"),
        c(3, {
          t({
            "defer func() {",
            " if err != nil {",
            '  span.SetStatus(codes.Error, "")',
            "  span.RecordError(err)",
            " }",
            " span.End()",
            "}()",
          }),
          t("defer span.End()"),
        }),
      }
    )
  ),
  snippet("log", {
    c(1, {
      t(""),
      t({ "l := log.From(ctx)", "" }),
    }),
    t("l."),
    c(2, {
      t("Debug"),
      t("Info"),
      t("Warn"),
      t("Error"),
      t("DPanic"),
      t("Panic"),
      t("Fatal"),
    }),
    t("("),
    i(3, "message"),
    t(")"),
  }),
  snippet("plog", {
    c(1, {
      t(""),
      t({ "l := log.SugaredFrom(ctx)", "" }),
    }),
    t("l."),
    c(2, {
      t("Debug"),
      t("Info"),
      t("Warn"),
      t("Error"),
      t("DPanic"),
      t("Panic"),
      t("Fatal"),
    }),
    c(3, { t(""), t("f"), t("ln"), t("w") }),
    t("("),
    i(4, "message"),
    t(")"),
  }),
  snippet("dump", {
    t("litter.Dump("),
    i(1, "value ...any"),
    t(")"),
  }),
  snippet("iferrpanic", {
    t({
      "if err != nil {",
      " panic(err)",
      "}",
    }),
  }),
  postfix(".m", {
    d(1, function(_, parent)
      return sn(nil, {
        i(1, "method"),
        t("(" .. parent.snippet.env.POSTFIX_MATCH .. ")"),
        i(2, ""),
      })
    end),
  }, {
    matchPattern = "[%w%.%_%-%(%)]+$",
  }),
  postfix(".dump", {
    d(1, function(_, parent)
      return sn(nil, {
        t("litter.Dump(" .. parent.snippet.env.POSTFIX_MATCH .. ")"),
      })
    end),
  }),
}
