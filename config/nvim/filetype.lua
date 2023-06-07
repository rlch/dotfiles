vim.filetype.add {
  extension = {
    mod = "gomod",
    MOD = "gomod",
    graphqls = "graphql",
    cypher = "cypher",
    cyp = "cypher",
    cql = "cypher",
    dump = "bash",
    avsc = "json",
    avro = "json",
  },
  pattern = {
    ["~/\\.kube/config"] = "yaml",
  },
}
