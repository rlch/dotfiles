var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var NodeType$3 = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
  return NodeType2;
})(NodeType$3 || {});
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) ;
function isElement(n2) {
  return n2.nodeType === n2.ELEMENT_NODE;
}
class Mirror {
  constructor() {
    __publicField$1(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField$1(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2) return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach(
        (childNode) => this.removeNodeFromMap(childNode)
      );
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node2) {
    return this.nodeMetaMap.has(node2);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta) this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function createMirror$2() {
  return new Mirror();
}
function toLowerCase(str) {
  return str.toLowerCase();
}
function isNodeMetaEqual(a2, b) {
  if (!a2 || !b || a2.type !== b.type) return false;
  if (a2.type === NodeType$3.Document)
    return a2.compatMode === b.compatMode;
  else if (a2.type === NodeType$3.DocumentType)
    return a2.name === b.name && a2.publicId === b.publicId && a2.systemId === b.systemId;
  else if (a2.type === NodeType$3.Comment || a2.type === NodeType$3.Text || a2.type === NodeType$3.CDATA)
    return a2.textContent === b.textContent;
  else if (a2.type === NodeType$3.Element)
    return a2.tagName === b.tagName && JSON.stringify(a2.attributes) === JSON.stringify(b.attributes) && a2.isSVG === b.isSVG && a2.needBlock === b.needBlock;
  return false;
}
function extractFileExtension(path, baseURL) {
  let url;
  try {
    url = new URL(path, baseURL ?? window.location.href);
  } catch (err) {
    return null;
  }
  const regex = /\.([0-9a-z]+)(?:$)/i;
  const match = url.pathname.match(regex);
  return (match == null ? void 0 : match[1]) ?? null;
}
const MEDIA_SELECTOR = /(max|min)-device-(width|height)/;
const MEDIA_SELECTOR_GLOBAL = new RegExp(MEDIA_SELECTOR.source, "g");
const mediaSelectorPlugin = {
  postcssPlugin: "postcss-custom-selectors",
  prepare() {
    return {
      postcssPlugin: "postcss-custom-selectors",
      AtRule: function(atrule) {
        if (atrule.params.match(MEDIA_SELECTOR_GLOBAL)) {
          atrule.params = atrule.params.replace(MEDIA_SELECTOR_GLOBAL, "$1-$2");
        }
      }
    };
  }
};
const pseudoClassPlugin = {
  postcssPlugin: "postcss-hover-classes",
  prepare: function() {
    const fixed = [];
    return {
      Rule: function(rule2) {
        if (fixed.indexOf(rule2) !== -1) {
          return;
        }
        fixed.push(rule2);
        rule2.selectors.forEach(function(selector) {
          if (selector.includes(":hover")) {
            rule2.selector += ",\n" + selector.replace(/:hover/g, ".\\:hover");
          }
        });
      }
    };
  }
};
function getDefaultExportFromCjs$1(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace$1(n2) {
  if (n2.__esModule) return n2;
  var f2 = n2.default;
  if (typeof f2 == "function") {
    var a2 = function a22() {
      if (this instanceof a22) {
        return Reflect.construct(f2, arguments, this.constructor);
      }
      return f2.apply(this, arguments);
    };
    a2.prototype = f2.prototype;
  } else a2 = {};
  Object.defineProperty(a2, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a2, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a2;
}
var picocolors_browser$1 = { exports: {} };
var hasRequiredPicocolors_browser$1;
function requirePicocolors_browser$1() {
  if (hasRequiredPicocolors_browser$1) return picocolors_browser$1.exports;
  hasRequiredPicocolors_browser$1 = 1;
  var x = String;
  var create = function() {
    return { isColorSupported: false, reset: x, bold: x, dim: x, italic: x, underline: x, inverse: x, hidden: x, strikethrough: x, black: x, red: x, green: x, yellow: x, blue: x, magenta: x, cyan: x, white: x, gray: x, bgBlack: x, bgRed: x, bgGreen: x, bgYellow: x, bgBlue: x, bgMagenta: x, bgCyan: x, bgWhite: x };
  };
  picocolors_browser$1.exports = create();
  picocolors_browser$1.exports.createColors = create;
  return picocolors_browser$1.exports;
}
const __viteBrowserExternal$2 = {};
const __viteBrowserExternal$1$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal$2
}, Symbol.toStringTag, { value: "Module" }));
const require$$2$1 = /* @__PURE__ */ getAugmentedNamespace$1(__viteBrowserExternal$1$1);
var cssSyntaxError$1;
var hasRequiredCssSyntaxError$1;
function requireCssSyntaxError$1() {
  if (hasRequiredCssSyntaxError$1) return cssSyntaxError$1;
  hasRequiredCssSyntaxError$1 = 1;
  let pico = /* @__PURE__ */ requirePicocolors_browser$1();
  let terminalHighlight = require$$2$1;
  class CssSyntaxError extends Error {
    constructor(message, line, column, source, file, plugin) {
      super(message);
      this.name = "CssSyntaxError";
      this.reason = message;
      if (file) {
        this.file = file;
      }
      if (source) {
        this.source = source;
      }
      if (plugin) {
        this.plugin = plugin;
      }
      if (typeof line !== "undefined" && typeof column !== "undefined") {
        if (typeof line === "number") {
          this.line = line;
          this.column = column;
        } else {
          this.line = line.line;
          this.column = line.column;
          this.endLine = column.line;
          this.endColumn = column.column;
        }
      }
      this.setMessage();
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CssSyntaxError);
      }
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "";
      this.message += this.file ? this.file : "<css input>";
      if (typeof this.line !== "undefined") {
        this.message += ":" + this.line + ":" + this.column;
      }
      this.message += ": " + this.reason;
    }
    showSourceCode(color) {
      if (!this.source) return "";
      let css = this.source;
      if (color == null) color = pico.isColorSupported;
      if (terminalHighlight) {
        if (color) css = terminalHighlight(css);
      }
      let lines = css.split(/\r?\n/);
      let start = Math.max(this.line - 3, 0);
      let end = Math.min(this.line + 2, lines.length);
      let maxWidth = String(end).length;
      let mark, aside;
      if (color) {
        let { bold, gray, red } = pico.createColors(true);
        mark = (text) => bold(red(text));
        aside = (text) => gray(text);
      } else {
        mark = aside = (str) => str;
      }
      return lines.slice(start, end).map((line, index2) => {
        let number = start + 1 + index2;
        let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
        if (number === this.line) {
          let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
        }
        return " " + aside(gutter) + line;
      }).join("\n");
    }
    toString() {
      let code = this.showSourceCode();
      if (code) {
        code = "\n\n" + code + "\n";
      }
      return this.name + ": " + this.message + code;
    }
  }
  cssSyntaxError$1 = CssSyntaxError;
  CssSyntaxError.default = CssSyntaxError;
  return cssSyntaxError$1;
}
var symbols$1 = {};
var hasRequiredSymbols$1;
function requireSymbols$1() {
  if (hasRequiredSymbols$1) return symbols$1;
  hasRequiredSymbols$1 = 1;
  symbols$1.isClean = Symbol("isClean");
  symbols$1.my = Symbol("my");
  return symbols$1;
}
var stringifier$1;
var hasRequiredStringifier$1;
function requireStringifier$1() {
  if (hasRequiredStringifier$1) return stringifier$1;
  hasRequiredStringifier$1 = 1;
  const DEFAULT_RAW = {
    after: "\n",
    beforeClose: "\n",
    beforeComment: "\n",
    beforeDecl: "\n",
    beforeOpen: " ",
    beforeRule: "\n",
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: false
  };
  function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
  class Stringifier {
    constructor(builder) {
      this.builder = builder;
    }
    atrule(node2, semicolon) {
      let name = "@" + node2.name;
      let params = node2.params ? this.rawValue(node2, "params") : "";
      if (typeof node2.raws.afterName !== "undefined") {
        name += node2.raws.afterName;
      } else if (params) {
        name += " ";
      }
      if (node2.nodes) {
        this.block(node2, name + params);
      } else {
        let end = (node2.raws.between || "") + (semicolon ? ";" : "");
        this.builder(name + params + end, node2);
      }
    }
    beforeAfter(node2, detect) {
      let value;
      if (node2.type === "decl") {
        value = this.raw(node2, null, "beforeDecl");
      } else if (node2.type === "comment") {
        value = this.raw(node2, null, "beforeComment");
      } else if (detect === "before") {
        value = this.raw(node2, null, "beforeRule");
      } else {
        value = this.raw(node2, null, "beforeClose");
      }
      let buf = node2.parent;
      let depth = 0;
      while (buf && buf.type !== "root") {
        depth += 1;
        buf = buf.parent;
      }
      if (value.includes("\n")) {
        let indent = this.raw(node2, null, "indent");
        if (indent.length) {
          for (let step = 0; step < depth; step++) value += indent;
        }
      }
      return value;
    }
    block(node2, start) {
      let between = this.raw(node2, "between", "beforeOpen");
      this.builder(start + between + "{", node2, "start");
      let after;
      if (node2.nodes && node2.nodes.length) {
        this.body(node2);
        after = this.raw(node2, "after");
      } else {
        after = this.raw(node2, "after", "emptyBody");
      }
      if (after) this.builder(after);
      this.builder("}", node2, "end");
    }
    body(node2) {
      let last = node2.nodes.length - 1;
      while (last > 0) {
        if (node2.nodes[last].type !== "comment") break;
        last -= 1;
      }
      let semicolon = this.raw(node2, "semicolon");
      for (let i2 = 0; i2 < node2.nodes.length; i2++) {
        let child = node2.nodes[i2];
        let before = this.raw(child, "before");
        if (before) this.builder(before);
        this.stringify(child, last !== i2 || semicolon);
      }
    }
    comment(node2) {
      let left = this.raw(node2, "left", "commentLeft");
      let right = this.raw(node2, "right", "commentRight");
      this.builder("/*" + left + node2.text + right + "*/", node2);
    }
    decl(node2, semicolon) {
      let between = this.raw(node2, "between", "colon");
      let string = node2.prop + between + this.rawValue(node2, "value");
      if (node2.important) {
        string += node2.raws.important || " !important";
      }
      if (semicolon) string += ";";
      this.builder(string, node2);
    }
    document(node2) {
      this.body(node2);
    }
    raw(node2, own, detect) {
      let value;
      if (!detect) detect = own;
      if (own) {
        value = node2.raws[own];
        if (typeof value !== "undefined") return value;
      }
      let parent = node2.parent;
      if (detect === "before") {
        if (!parent || parent.type === "root" && parent.first === node2) {
          return "";
        }
        if (parent && parent.type === "document") {
          return "";
        }
      }
      if (!parent) return DEFAULT_RAW[detect];
      let root2 = node2.root();
      if (!root2.rawCache) root2.rawCache = {};
      if (typeof root2.rawCache[detect] !== "undefined") {
        return root2.rawCache[detect];
      }
      if (detect === "before" || detect === "after") {
        return this.beforeAfter(node2, detect);
      } else {
        let method = "raw" + capitalize(detect);
        if (this[method]) {
          value = this[method](root2, node2);
        } else {
          root2.walk((i2) => {
            value = i2.raws[own];
            if (typeof value !== "undefined") return false;
          });
        }
      }
      if (typeof value === "undefined") value = DEFAULT_RAW[detect];
      root2.rawCache[detect] = value;
      return value;
    }
    rawBeforeClose(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length > 0) {
          if (typeof i2.raws.after !== "undefined") {
            value = i2.raws.after;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        }
      });
      if (value) value = value.replace(/\S/g, "");
      return value;
    }
    rawBeforeComment(root2, node2) {
      let value;
      root2.walkComments((i2) => {
        if (typeof i2.raws.before !== "undefined") {
          value = i2.raws.before;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      });
      if (typeof value === "undefined") {
        value = this.raw(node2, null, "beforeDecl");
      } else if (value) {
        value = value.replace(/\S/g, "");
      }
      return value;
    }
    rawBeforeDecl(root2, node2) {
      let value;
      root2.walkDecls((i2) => {
        if (typeof i2.raws.before !== "undefined") {
          value = i2.raws.before;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      });
      if (typeof value === "undefined") {
        value = this.raw(node2, null, "beforeRule");
      } else if (value) {
        value = value.replace(/\S/g, "");
      }
      return value;
    }
    rawBeforeOpen(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.type !== "decl") {
          value = i2.raws.between;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawBeforeRule(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && (i2.parent !== root2 || root2.first !== i2)) {
          if (typeof i2.raws.before !== "undefined") {
            value = i2.raws.before;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        }
      });
      if (value) value = value.replace(/\S/g, "");
      return value;
    }
    rawColon(root2) {
      let value;
      root2.walkDecls((i2) => {
        if (typeof i2.raws.between !== "undefined") {
          value = i2.raws.between.replace(/[^\s:]/g, "");
          return false;
        }
      });
      return value;
    }
    rawEmptyBody(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length === 0) {
          value = i2.raws.after;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawIndent(root2) {
      if (root2.raws.indent) return root2.raws.indent;
      let value;
      root2.walk((i2) => {
        let p = i2.parent;
        if (p && p !== root2 && p.parent && p.parent === root2) {
          if (typeof i2.raws.before !== "undefined") {
            let parts = i2.raws.before.split("\n");
            value = parts[parts.length - 1];
            value = value.replace(/\S/g, "");
            return false;
          }
        }
      });
      return value;
    }
    rawSemicolon(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length && i2.last.type === "decl") {
          value = i2.raws.semicolon;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawValue(node2, prop) {
      let value = node2[prop];
      let raw = node2.raws[prop];
      if (raw && raw.value === value) {
        return raw.raw;
      }
      return value;
    }
    root(node2) {
      this.body(node2);
      if (node2.raws.after) this.builder(node2.raws.after);
    }
    rule(node2) {
      this.block(node2, this.rawValue(node2, "selector"));
      if (node2.raws.ownSemicolon) {
        this.builder(node2.raws.ownSemicolon, node2, "end");
      }
    }
    stringify(node2, semicolon) {
      if (!this[node2.type]) {
        throw new Error(
          "Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier."
        );
      }
      this[node2.type](node2, semicolon);
    }
  }
  stringifier$1 = Stringifier;
  Stringifier.default = Stringifier;
  return stringifier$1;
}
var stringify_1$1;
var hasRequiredStringify$1;
function requireStringify$1() {
  if (hasRequiredStringify$1) return stringify_1$1;
  hasRequiredStringify$1 = 1;
  let Stringifier = requireStringifier$1();
  function stringify(node2, builder) {
    let str = new Stringifier(builder);
    str.stringify(node2);
  }
  stringify_1$1 = stringify;
  stringify.default = stringify;
  return stringify_1$1;
}
var node$1;
var hasRequiredNode$1;
function requireNode$1() {
  if (hasRequiredNode$1) return node$1;
  hasRequiredNode$1 = 1;
  let { isClean, my } = requireSymbols$1();
  let CssSyntaxError = requireCssSyntaxError$1();
  let Stringifier = requireStringifier$1();
  let stringify = requireStringify$1();
  function cloneNode(obj, parent) {
    let cloned = new obj.constructor();
    for (let i2 in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, i2)) {
        continue;
      }
      if (i2 === "proxyCache") continue;
      let value = obj[i2];
      let type = typeof value;
      if (i2 === "parent" && type === "object") {
        if (parent) cloned[i2] = parent;
      } else if (i2 === "source") {
        cloned[i2] = value;
      } else if (Array.isArray(value)) {
        cloned[i2] = value.map((j) => cloneNode(j, cloned));
      } else {
        if (type === "object" && value !== null) value = cloneNode(value);
        cloned[i2] = value;
      }
    }
    return cloned;
  }
  class Node2 {
    constructor(defaults = {}) {
      this.raws = {};
      this[isClean] = false;
      this[my] = true;
      for (let name in defaults) {
        if (name === "nodes") {
          this.nodes = [];
          for (let node2 of defaults[name]) {
            if (typeof node2.clone === "function") {
              this.append(node2.clone());
            } else {
              this.append(node2);
            }
          }
        } else {
          this[name] = defaults[name];
        }
      }
    }
    addToError(error) {
      error.postcssNode = this;
      if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
        let s2 = this.source;
        error.stack = error.stack.replace(
          /\n\s{4}at /,
          `$&${s2.input.from}:${s2.start.line}:${s2.start.column}$&`
        );
      }
      return error;
    }
    after(add) {
      this.parent.insertAfter(this, add);
      return this;
    }
    assign(overrides = {}) {
      for (let name in overrides) {
        this[name] = overrides[name];
      }
      return this;
    }
    before(add) {
      this.parent.insertBefore(this, add);
      return this;
    }
    cleanRaws(keepBetween) {
      delete this.raws.before;
      delete this.raws.after;
      if (!keepBetween) delete this.raws.between;
    }
    clone(overrides = {}) {
      let cloned = cloneNode(this);
      for (let name in overrides) {
        cloned[name] = overrides[name];
      }
      return cloned;
    }
    cloneAfter(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertAfter(this, cloned);
      return cloned;
    }
    cloneBefore(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertBefore(this, cloned);
      return cloned;
    }
    error(message, opts = {}) {
      if (this.source) {
        let { end, start } = this.rangeBy(opts);
        return this.source.input.error(
          message,
          { column: start.column, line: start.line },
          { column: end.column, line: end.line },
          opts
        );
      }
      return new CssSyntaxError(message);
    }
    getProxyProcessor() {
      return {
        get(node2, prop) {
          if (prop === "proxyOf") {
            return node2;
          } else if (prop === "root") {
            return () => node2.root().toProxy();
          } else {
            return node2[prop];
          }
        },
        set(node2, prop, value) {
          if (node2[prop] === value) return true;
          node2[prop] = value;
          if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */
          prop === "text") {
            node2.markDirty();
          }
          return true;
        }
      };
    }
    markDirty() {
      if (this[isClean]) {
        this[isClean] = false;
        let next = this;
        while (next = next.parent) {
          next[isClean] = false;
        }
      }
    }
    next() {
      if (!this.parent) return void 0;
      let index2 = this.parent.index(this);
      return this.parent.nodes[index2 + 1];
    }
    positionBy(opts, stringRepresentation) {
      let pos = this.source.start;
      if (opts.index) {
        pos = this.positionInside(opts.index, stringRepresentation);
      } else if (opts.word) {
        stringRepresentation = this.toString();
        let index2 = stringRepresentation.indexOf(opts.word);
        if (index2 !== -1) pos = this.positionInside(index2, stringRepresentation);
      }
      return pos;
    }
    positionInside(index2, stringRepresentation) {
      let string = stringRepresentation || this.toString();
      let column = this.source.start.column;
      let line = this.source.start.line;
      for (let i2 = 0; i2 < index2; i2++) {
        if (string[i2] === "\n") {
          column = 1;
          line += 1;
        } else {
          column += 1;
        }
      }
      return { column, line };
    }
    prev() {
      if (!this.parent) return void 0;
      let index2 = this.parent.index(this);
      return this.parent.nodes[index2 - 1];
    }
    rangeBy(opts) {
      let start = {
        column: this.source.start.column,
        line: this.source.start.line
      };
      let end = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: start.column + 1,
        line: start.line
      };
      if (opts.word) {
        let stringRepresentation = this.toString();
        let index2 = stringRepresentation.indexOf(opts.word);
        if (index2 !== -1) {
          start = this.positionInside(index2, stringRepresentation);
          end = this.positionInside(index2 + opts.word.length, stringRepresentation);
        }
      } else {
        if (opts.start) {
          start = {
            column: opts.start.column,
            line: opts.start.line
          };
        } else if (opts.index) {
          start = this.positionInside(opts.index);
        }
        if (opts.end) {
          end = {
            column: opts.end.column,
            line: opts.end.line
          };
        } else if (typeof opts.endIndex === "number") {
          end = this.positionInside(opts.endIndex);
        } else if (opts.index) {
          end = this.positionInside(opts.index + 1);
        }
      }
      if (end.line < start.line || end.line === start.line && end.column <= start.column) {
        end = { column: start.column + 1, line: start.line };
      }
      return { end, start };
    }
    raw(prop, defaultType) {
      let str = new Stringifier();
      return str.raw(this, prop, defaultType);
    }
    remove() {
      if (this.parent) {
        this.parent.removeChild(this);
      }
      this.parent = void 0;
      return this;
    }
    replaceWith(...nodes) {
      if (this.parent) {
        let bookmark = this;
        let foundSelf = false;
        for (let node2 of nodes) {
          if (node2 === this) {
            foundSelf = true;
          } else if (foundSelf) {
            this.parent.insertAfter(bookmark, node2);
            bookmark = node2;
          } else {
            this.parent.insertBefore(bookmark, node2);
          }
        }
        if (!foundSelf) {
          this.remove();
        }
      }
      return this;
    }
    root() {
      let result2 = this;
      while (result2.parent && result2.parent.type !== "document") {
        result2 = result2.parent;
      }
      return result2;
    }
    toJSON(_, inputs) {
      let fixed = {};
      let emitInputs = inputs == null;
      inputs = inputs || /* @__PURE__ */ new Map();
      let inputsNextIndex = 0;
      for (let name in this) {
        if (!Object.prototype.hasOwnProperty.call(this, name)) {
          continue;
        }
        if (name === "parent" || name === "proxyCache") continue;
        let value = this[name];
        if (Array.isArray(value)) {
          fixed[name] = value.map((i2) => {
            if (typeof i2 === "object" && i2.toJSON) {
              return i2.toJSON(null, inputs);
            } else {
              return i2;
            }
          });
        } else if (typeof value === "object" && value.toJSON) {
          fixed[name] = value.toJSON(null, inputs);
        } else if (name === "source") {
          let inputId = inputs.get(value.input);
          if (inputId == null) {
            inputId = inputsNextIndex;
            inputs.set(value.input, inputsNextIndex);
            inputsNextIndex++;
          }
          fixed[name] = {
            end: value.end,
            inputId,
            start: value.start
          };
        } else {
          fixed[name] = value;
        }
      }
      if (emitInputs) {
        fixed.inputs = [...inputs.keys()].map((input2) => input2.toJSON());
      }
      return fixed;
    }
    toProxy() {
      if (!this.proxyCache) {
        this.proxyCache = new Proxy(this, this.getProxyProcessor());
      }
      return this.proxyCache;
    }
    toString(stringifier2 = stringify) {
      if (stringifier2.stringify) stringifier2 = stringifier2.stringify;
      let result2 = "";
      stringifier2(this, (i2) => {
        result2 += i2;
      });
      return result2;
    }
    warn(result2, text, opts) {
      let data = { node: this };
      for (let i2 in opts) data[i2] = opts[i2];
      return result2.warn(text, data);
    }
    get proxyOf() {
      return this;
    }
  }
  node$1 = Node2;
  Node2.default = Node2;
  return node$1;
}
var declaration$1;
var hasRequiredDeclaration$1;
function requireDeclaration$1() {
  if (hasRequiredDeclaration$1) return declaration$1;
  hasRequiredDeclaration$1 = 1;
  let Node2 = requireNode$1();
  class Declaration extends Node2 {
    constructor(defaults) {
      if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
        defaults = { ...defaults, value: String(defaults.value) };
      }
      super(defaults);
      this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  declaration$1 = Declaration;
  Declaration.default = Declaration;
  return declaration$1;
}
var nonSecure$1;
var hasRequiredNonSecure$1;
function requireNonSecure$1() {
  if (hasRequiredNonSecure$1) return nonSecure$1;
  hasRequiredNonSecure$1 = 1;
  let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  let customAlphabet = (alphabet, defaultSize = 21) => {
    return (size = defaultSize) => {
      let id = "";
      let i2 = size;
      while (i2--) {
        id += alphabet[Math.random() * alphabet.length | 0];
      }
      return id;
    };
  };
  let nanoid = (size = 21) => {
    let id = "";
    let i2 = size;
    while (i2--) {
      id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
  };
  nonSecure$1 = { nanoid, customAlphabet };
  return nonSecure$1;
}
var previousMap$1;
var hasRequiredPreviousMap$1;
function requirePreviousMap$1() {
  if (hasRequiredPreviousMap$1) return previousMap$1;
  hasRequiredPreviousMap$1 = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2$1;
  let { existsSync, readFileSync } = require$$2$1;
  let { dirname, join } = require$$2$1;
  function fromBase64(str) {
    if (Buffer) {
      return Buffer.from(str, "base64").toString();
    } else {
      return window.atob(str);
    }
  }
  class PreviousMap {
    constructor(css, opts) {
      if (opts.map === false) return;
      this.loadAnnotation(css);
      this.inline = this.startWith(this.annotation, "data:");
      let prev = opts.map ? opts.map.prev : void 0;
      let text = this.loadMap(opts.from, prev);
      if (!this.mapFile && opts.from) {
        this.mapFile = opts.from;
      }
      if (this.mapFile) this.root = dirname(this.mapFile);
      if (text) this.text = text;
    }
    consumer() {
      if (!this.consumerCache) {
        this.consumerCache = new SourceMapConsumer(this.text);
      }
      return this.consumerCache;
    }
    decodeInline(text) {
      let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
      let baseUri = /^data:application\/json;base64,/;
      let charsetUri = /^data:application\/json;charset=utf-?8,/;
      let uri = /^data:application\/json,/;
      if (charsetUri.test(text) || uri.test(text)) {
        return decodeURIComponent(text.substr(RegExp.lastMatch.length));
      }
      if (baseCharsetUri.test(text) || baseUri.test(text)) {
        return fromBase64(text.substr(RegExp.lastMatch.length));
      }
      let encoding = text.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + encoding);
    }
    getAnnotationURL(sourceMapString) {
      return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(map) {
      if (typeof map !== "object") return false;
      return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
    }
    loadAnnotation(css) {
      let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!comments) return;
      let start = css.lastIndexOf(comments.pop());
      let end = css.indexOf("*/", start);
      if (start > -1 && end > -1) {
        this.annotation = this.getAnnotationURL(css.substring(start, end));
      }
    }
    loadFile(path) {
      this.root = dirname(path);
      if (existsSync(path)) {
        this.mapFile = path;
        return readFileSync(path, "utf-8").toString().trim();
      }
    }
    loadMap(file, prev) {
      if (prev === false) return false;
      if (prev) {
        if (typeof prev === "string") {
          return prev;
        } else if (typeof prev === "function") {
          let prevPath = prev(file);
          if (prevPath) {
            let map = this.loadFile(prevPath);
            if (!map) {
              throw new Error(
                "Unable to load previous source map: " + prevPath.toString()
              );
            }
            return map;
          }
        } else if (prev instanceof SourceMapConsumer) {
          return SourceMapGenerator.fromSourceMap(prev).toString();
        } else if (prev instanceof SourceMapGenerator) {
          return prev.toString();
        } else if (this.isMap(prev)) {
          return JSON.stringify(prev);
        } else {
          throw new Error(
            "Unsupported previous source map format: " + prev.toString()
          );
        }
      } else if (this.inline) {
        return this.decodeInline(this.annotation);
      } else if (this.annotation) {
        let map = this.annotation;
        if (file) map = join(dirname(file), map);
        return this.loadFile(map);
      }
    }
    startWith(string, start) {
      if (!string) return false;
      return string.substr(0, start.length) === start;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  previousMap$1 = PreviousMap;
  PreviousMap.default = PreviousMap;
  return previousMap$1;
}
var input$1;
var hasRequiredInput$1;
function requireInput$1() {
  if (hasRequiredInput$1) return input$1;
  hasRequiredInput$1 = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2$1;
  let { fileURLToPath, pathToFileURL } = require$$2$1;
  let { isAbsolute, resolve } = require$$2$1;
  let { nanoid } = /* @__PURE__ */ requireNonSecure$1();
  let terminalHighlight = require$$2$1;
  let CssSyntaxError = requireCssSyntaxError$1();
  let PreviousMap = requirePreviousMap$1();
  let fromOffsetCache = Symbol("fromOffsetCache");
  let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
  let pathAvailable = Boolean(resolve && isAbsolute);
  class Input {
    constructor(css, opts = {}) {
      if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) {
        throw new Error(`PostCSS received ${css} instead of CSS string`);
      }
      this.css = css.toString();
      if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
        this.hasBOM = true;
        this.css = this.css.slice(1);
      } else {
        this.hasBOM = false;
      }
      if (opts.from) {
        if (!pathAvailable || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
          this.file = opts.from;
        } else {
          this.file = resolve(opts.from);
        }
      }
      if (pathAvailable && sourceMapAvailable) {
        let map = new PreviousMap(this.css, opts);
        if (map.text) {
          this.map = map;
          let file = map.consumer().file;
          if (!this.file && file) this.file = this.mapResolve(file);
        }
      }
      if (!this.file) {
        this.id = "<input css " + nanoid(6) + ">";
      }
      if (this.map) this.map.file = this.from;
    }
    error(message, line, column, opts = {}) {
      let result2, endLine, endColumn;
      if (line && typeof line === "object") {
        let start = line;
        let end = column;
        if (typeof start.offset === "number") {
          let pos = this.fromOffset(start.offset);
          line = pos.line;
          column = pos.col;
        } else {
          line = start.line;
          column = start.column;
        }
        if (typeof end.offset === "number") {
          let pos = this.fromOffset(end.offset);
          endLine = pos.line;
          endColumn = pos.col;
        } else {
          endLine = end.line;
          endColumn = end.column;
        }
      } else if (!column) {
        let pos = this.fromOffset(line);
        line = pos.line;
        column = pos.col;
      }
      let origin = this.origin(line, column, endLine, endColumn);
      if (origin) {
        result2 = new CssSyntaxError(
          message,
          origin.endLine === void 0 ? origin.line : { column: origin.column, line: origin.line },
          origin.endLine === void 0 ? origin.column : { column: origin.endColumn, line: origin.endLine },
          origin.source,
          origin.file,
          opts.plugin
        );
      } else {
        result2 = new CssSyntaxError(
          message,
          endLine === void 0 ? line : { column, line },
          endLine === void 0 ? column : { column: endColumn, line: endLine },
          this.css,
          this.file,
          opts.plugin
        );
      }
      result2.input = { column, endColumn, endLine, line, source: this.css };
      if (this.file) {
        if (pathToFileURL) {
          result2.input.url = pathToFileURL(this.file).toString();
        }
        result2.input.file = this.file;
      }
      return result2;
    }
    fromOffset(offset) {
      let lastLine, lineToIndex;
      if (!this[fromOffsetCache]) {
        let lines = this.css.split("\n");
        lineToIndex = new Array(lines.length);
        let prevIndex = 0;
        for (let i2 = 0, l2 = lines.length; i2 < l2; i2++) {
          lineToIndex[i2] = prevIndex;
          prevIndex += lines[i2].length + 1;
        }
        this[fromOffsetCache] = lineToIndex;
      } else {
        lineToIndex = this[fromOffsetCache];
      }
      lastLine = lineToIndex[lineToIndex.length - 1];
      let min = 0;
      if (offset >= lastLine) {
        min = lineToIndex.length - 1;
      } else {
        let max = lineToIndex.length - 2;
        let mid;
        while (min < max) {
          mid = min + (max - min >> 1);
          if (offset < lineToIndex[mid]) {
            max = mid - 1;
          } else if (offset >= lineToIndex[mid + 1]) {
            min = mid + 1;
          } else {
            min = mid;
            break;
          }
        }
      }
      return {
        col: offset - lineToIndex[min] + 1,
        line: min + 1
      };
    }
    mapResolve(file) {
      if (/^\w+:\/\//.test(file)) {
        return file;
      }
      return resolve(this.map.consumer().sourceRoot || this.map.root || ".", file);
    }
    origin(line, column, endLine, endColumn) {
      if (!this.map) return false;
      let consumer = this.map.consumer();
      let from = consumer.originalPositionFor({ column, line });
      if (!from.source) return false;
      let to;
      if (typeof endLine === "number") {
        to = consumer.originalPositionFor({ column: endColumn, line: endLine });
      }
      let fromUrl;
      if (isAbsolute(from.source)) {
        fromUrl = pathToFileURL(from.source);
      } else {
        fromUrl = new URL(
          from.source,
          this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
        );
      }
      let result2 = {
        column: from.column,
        endColumn: to && to.column,
        endLine: to && to.line,
        line: from.line,
        url: fromUrl.toString()
      };
      if (fromUrl.protocol === "file:") {
        if (fileURLToPath) {
          result2.file = fileURLToPath(fromUrl);
        } else {
          throw new Error(`file: protocol is not available in this PostCSS build`);
        }
      }
      let source = consumer.sourceContentFor(from.source);
      if (source) result2.source = source;
      return result2;
    }
    toJSON() {
      let json = {};
      for (let name of ["hasBOM", "css", "file", "id"]) {
        if (this[name] != null) {
          json[name] = this[name];
        }
      }
      if (this.map) {
        json.map = { ...this.map };
        if (json.map.consumerCache) {
          json.map.consumerCache = void 0;
        }
      }
      return json;
    }
    get from() {
      return this.file || this.id;
    }
  }
  input$1 = Input;
  Input.default = Input;
  if (terminalHighlight && terminalHighlight.registerInput) {
    terminalHighlight.registerInput(Input);
  }
  return input$1;
}
var mapGenerator$1;
var hasRequiredMapGenerator$1;
function requireMapGenerator$1() {
  if (hasRequiredMapGenerator$1) return mapGenerator$1;
  hasRequiredMapGenerator$1 = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2$1;
  let { dirname, relative, resolve, sep } = require$$2$1;
  let { pathToFileURL } = require$$2$1;
  let Input = requireInput$1();
  let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
  let pathAvailable = Boolean(dirname && resolve && relative && sep);
  class MapGenerator {
    constructor(stringify, root2, opts, cssString) {
      this.stringify = stringify;
      this.mapOpts = opts.map || {};
      this.root = root2;
      this.opts = opts;
      this.css = cssString;
      this.originalCSS = cssString;
      this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
      this.memoizedFileURLs = /* @__PURE__ */ new Map();
      this.memoizedPaths = /* @__PURE__ */ new Map();
      this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let content;
      if (this.isInline()) {
        content = "data:application/json;base64," + this.toBase64(this.map.toString());
      } else if (typeof this.mapOpts.annotation === "string") {
        content = this.mapOpts.annotation;
      } else if (typeof this.mapOpts.annotation === "function") {
        content = this.mapOpts.annotation(this.opts.to, this.root);
      } else {
        content = this.outputFile() + ".map";
      }
      let eol = "\n";
      if (this.css.includes("\r\n")) eol = "\r\n";
      this.css += eol + "/*# sourceMappingURL=" + content + " */";
    }
    applyPrevMaps() {
      for (let prev of this.previous()) {
        let from = this.toUrl(this.path(prev.file));
        let root2 = prev.root || dirname(prev.file);
        let map;
        if (this.mapOpts.sourcesContent === false) {
          map = new SourceMapConsumer(prev.text);
          if (map.sourcesContent) {
            map.sourcesContent = null;
          }
        } else {
          map = prev.consumer();
        }
        this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation === false) return;
      if (this.root) {
        let node2;
        for (let i2 = this.root.nodes.length - 1; i2 >= 0; i2--) {
          node2 = this.root.nodes[i2];
          if (node2.type !== "comment") continue;
          if (node2.text.indexOf("# sourceMappingURL=") === 0) {
            this.root.removeChild(i2);
          }
        }
      } else if (this.css) {
        this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
      }
    }
    generate() {
      this.clearAnnotation();
      if (pathAvailable && sourceMapAvailable && this.isMap()) {
        return this.generateMap();
      } else {
        let result2 = "";
        this.stringify(this.root, (i2) => {
          result2 += i2;
        });
        return [result2];
      }
    }
    generateMap() {
      if (this.root) {
        this.generateString();
      } else if (this.previous().length === 1) {
        let prev = this.previous()[0].consumer();
        prev.file = this.outputFile();
        this.map = SourceMapGenerator.fromSourceMap(prev, {
          ignoreInvalidMapping: true
        });
      } else {
        this.map = new SourceMapGenerator({
          file: this.outputFile(),
          ignoreInvalidMapping: true
        });
        this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      }
      if (this.isSourcesContent()) this.setSourcesContent();
      if (this.root && this.previous().length > 0) this.applyPrevMaps();
      if (this.isAnnotation()) this.addAnnotation();
      if (this.isInline()) {
        return [this.css];
      } else {
        return [this.css, this.map];
      }
    }
    generateString() {
      this.css = "";
      this.map = new SourceMapGenerator({
        file: this.outputFile(),
        ignoreInvalidMapping: true
      });
      let line = 1;
      let column = 1;
      let noSource = "<no source>";
      let mapping = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      };
      let lines, last;
      this.stringify(this.root, (str, node2, type) => {
        this.css += str;
        if (node2 && type !== "end") {
          mapping.generated.line = line;
          mapping.generated.column = column - 1;
          if (node2.source && node2.source.start) {
            mapping.source = this.sourcePath(node2);
            mapping.original.line = node2.source.start.line;
            mapping.original.column = node2.source.start.column - 1;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            this.map.addMapping(mapping);
          }
        }
        lines = str.match(/\n/g);
        if (lines) {
          line += lines.length;
          last = str.lastIndexOf("\n");
          column = str.length - last;
        } else {
          column += str.length;
        }
        if (node2 && type !== "start") {
          let p = node2.parent || { raws: {} };
          let childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
          if (!childless || node2 !== p.last || p.raws.semicolon) {
            if (node2.source && node2.source.end) {
              mapping.source = this.sourcePath(node2);
              mapping.original.line = node2.source.end.line;
              mapping.original.column = node2.source.end.column - 1;
              mapping.generated.line = line;
              mapping.generated.column = column - 2;
              this.map.addMapping(mapping);
            } else {
              mapping.source = noSource;
              mapping.original.line = 1;
              mapping.original.column = 0;
              mapping.generated.line = line;
              mapping.generated.column = column - 1;
              this.map.addMapping(mapping);
            }
          }
        }
      });
    }
    isAnnotation() {
      if (this.isInline()) {
        return true;
      }
      if (typeof this.mapOpts.annotation !== "undefined") {
        return this.mapOpts.annotation;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.annotation);
      }
      return true;
    }
    isInline() {
      if (typeof this.mapOpts.inline !== "undefined") {
        return this.mapOpts.inline;
      }
      let annotation = this.mapOpts.annotation;
      if (typeof annotation !== "undefined" && annotation !== true) {
        return false;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.inline);
      }
      return true;
    }
    isMap() {
      if (typeof this.opts.map !== "undefined") {
        return !!this.opts.map;
      }
      return this.previous().length > 0;
    }
    isSourcesContent() {
      if (typeof this.mapOpts.sourcesContent !== "undefined") {
        return this.mapOpts.sourcesContent;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.withContent());
      }
      return true;
    }
    outputFile() {
      if (this.opts.to) {
        return this.path(this.opts.to);
      } else if (this.opts.from) {
        return this.path(this.opts.from);
      } else {
        return "to.css";
      }
    }
    path(file) {
      if (this.mapOpts.absolute) return file;
      if (file.charCodeAt(0) === 60) return file;
      if (/^\w+:\/\//.test(file)) return file;
      let cached = this.memoizedPaths.get(file);
      if (cached) return cached;
      let from = this.opts.to ? dirname(this.opts.to) : ".";
      if (typeof this.mapOpts.annotation === "string") {
        from = dirname(resolve(from, this.mapOpts.annotation));
      }
      let path = relative(from, file);
      this.memoizedPaths.set(file, path);
      return path;
    }
    previous() {
      if (!this.previousMaps) {
        this.previousMaps = [];
        if (this.root) {
          this.root.walk((node2) => {
            if (node2.source && node2.source.input.map) {
              let map = node2.source.input.map;
              if (!this.previousMaps.includes(map)) {
                this.previousMaps.push(map);
              }
            }
          });
        } else {
          let input2 = new Input(this.originalCSS, this.opts);
          if (input2.map) this.previousMaps.push(input2.map);
        }
      }
      return this.previousMaps;
    }
    setSourcesContent() {
      let already = {};
      if (this.root) {
        this.root.walk((node2) => {
          if (node2.source) {
            let from = node2.source.input.from;
            if (from && !already[from]) {
              already[from] = true;
              let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
              this.map.setSourceContent(fromUrl, node2.source.input.css);
            }
          }
        });
      } else if (this.css) {
        let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(from, this.css);
      }
    }
    sourcePath(node2) {
      if (this.mapOpts.from) {
        return this.toUrl(this.mapOpts.from);
      } else if (this.usesFileUrls) {
        return this.toFileUrl(node2.source.input.from);
      } else {
        return this.toUrl(this.path(node2.source.input.from));
      }
    }
    toBase64(str) {
      if (Buffer) {
        return Buffer.from(str).toString("base64");
      } else {
        return window.btoa(unescape(encodeURIComponent(str)));
      }
    }
    toFileUrl(path) {
      let cached = this.memoizedFileURLs.get(path);
      if (cached) return cached;
      if (pathToFileURL) {
        let fileURL = pathToFileURL(path).toString();
        this.memoizedFileURLs.set(path, fileURL);
        return fileURL;
      } else {
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
      }
    }
    toUrl(path) {
      let cached = this.memoizedURLs.get(path);
      if (cached) return cached;
      if (sep === "\\") {
        path = path.replace(/\\/g, "/");
      }
      let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
      this.memoizedURLs.set(path, url);
      return url;
    }
  }
  mapGenerator$1 = MapGenerator;
  return mapGenerator$1;
}
var comment$1;
var hasRequiredComment$1;
function requireComment$1() {
  if (hasRequiredComment$1) return comment$1;
  hasRequiredComment$1 = 1;
  let Node2 = requireNode$1();
  class Comment extends Node2 {
    constructor(defaults) {
      super(defaults);
      this.type = "comment";
    }
  }
  comment$1 = Comment;
  Comment.default = Comment;
  return comment$1;
}
var container$1;
var hasRequiredContainer$1;
function requireContainer$1() {
  if (hasRequiredContainer$1) return container$1;
  hasRequiredContainer$1 = 1;
  let { isClean, my } = requireSymbols$1();
  let Declaration = requireDeclaration$1();
  let Comment = requireComment$1();
  let Node2 = requireNode$1();
  let parse, Rule, AtRule, Root;
  function cleanSource(nodes) {
    return nodes.map((i2) => {
      if (i2.nodes) i2.nodes = cleanSource(i2.nodes);
      delete i2.source;
      return i2;
    });
  }
  function markDirtyUp(node2) {
    node2[isClean] = false;
    if (node2.proxyOf.nodes) {
      for (let i2 of node2.proxyOf.nodes) {
        markDirtyUp(i2);
      }
    }
  }
  class Container extends Node2 {
    append(...children) {
      for (let child of children) {
        let nodes = this.normalize(child, this.last);
        for (let node2 of nodes) this.proxyOf.nodes.push(node2);
      }
      this.markDirty();
      return this;
    }
    cleanRaws(keepBetween) {
      super.cleanRaws(keepBetween);
      if (this.nodes) {
        for (let node2 of this.nodes) node2.cleanRaws(keepBetween);
      }
    }
    each(callback) {
      if (!this.proxyOf.nodes) return void 0;
      let iterator = this.getIterator();
      let index2, result2;
      while (this.indexes[iterator] < this.proxyOf.nodes.length) {
        index2 = this.indexes[iterator];
        result2 = callback(this.proxyOf.nodes[index2], index2);
        if (result2 === false) break;
        this.indexes[iterator] += 1;
      }
      delete this.indexes[iterator];
      return result2;
    }
    every(condition) {
      return this.nodes.every(condition);
    }
    getIterator() {
      if (!this.lastEach) this.lastEach = 0;
      if (!this.indexes) this.indexes = {};
      this.lastEach += 1;
      let iterator = this.lastEach;
      this.indexes[iterator] = 0;
      return iterator;
    }
    getProxyProcessor() {
      return {
        get(node2, prop) {
          if (prop === "proxyOf") {
            return node2;
          } else if (!node2[prop]) {
            return node2[prop];
          } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
            return (...args) => {
              return node2[prop](
                ...args.map((i2) => {
                  if (typeof i2 === "function") {
                    return (child, index2) => i2(child.toProxy(), index2);
                  } else {
                    return i2;
                  }
                })
              );
            };
          } else if (prop === "every" || prop === "some") {
            return (cb) => {
              return node2[prop](
                (child, ...other) => cb(child.toProxy(), ...other)
              );
            };
          } else if (prop === "root") {
            return () => node2.root().toProxy();
          } else if (prop === "nodes") {
            return node2.nodes.map((i2) => i2.toProxy());
          } else if (prop === "first" || prop === "last") {
            return node2[prop].toProxy();
          } else {
            return node2[prop];
          }
        },
        set(node2, prop, value) {
          if (node2[prop] === value) return true;
          node2[prop] = value;
          if (prop === "name" || prop === "params" || prop === "selector") {
            node2.markDirty();
          }
          return true;
        }
      };
    }
    index(child) {
      if (typeof child === "number") return child;
      if (child.proxyOf) child = child.proxyOf;
      return this.proxyOf.nodes.indexOf(child);
    }
    insertAfter(exist, add) {
      let existIndex = this.index(exist);
      let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
      existIndex = this.index(exist);
      for (let node2 of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (existIndex < index2) {
          this.indexes[id] = index2 + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    insertBefore(exist, add) {
      let existIndex = this.index(exist);
      let type = existIndex === 0 ? "prepend" : false;
      let nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
      existIndex = this.index(exist);
      for (let node2 of nodes) this.proxyOf.nodes.splice(existIndex, 0, node2);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (existIndex <= index2) {
          this.indexes[id] = index2 + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    normalize(nodes, sample) {
      if (typeof nodes === "string") {
        nodes = cleanSource(parse(nodes).nodes);
      } else if (typeof nodes === "undefined") {
        nodes = [];
      } else if (Array.isArray(nodes)) {
        nodes = nodes.slice(0);
        for (let i2 of nodes) {
          if (i2.parent) i2.parent.removeChild(i2, "ignore");
        }
      } else if (nodes.type === "root" && this.type !== "document") {
        nodes = nodes.nodes.slice(0);
        for (let i2 of nodes) {
          if (i2.parent) i2.parent.removeChild(i2, "ignore");
        }
      } else if (nodes.type) {
        nodes = [nodes];
      } else if (nodes.prop) {
        if (typeof nodes.value === "undefined") {
          throw new Error("Value field is missed in node creation");
        } else if (typeof nodes.value !== "string") {
          nodes.value = String(nodes.value);
        }
        nodes = [new Declaration(nodes)];
      } else if (nodes.selector) {
        nodes = [new Rule(nodes)];
      } else if (nodes.name) {
        nodes = [new AtRule(nodes)];
      } else if (nodes.text) {
        nodes = [new Comment(nodes)];
      } else {
        throw new Error("Unknown node type in node creation");
      }
      let processed = nodes.map((i2) => {
        if (!i2[my]) Container.rebuild(i2);
        i2 = i2.proxyOf;
        if (i2.parent) i2.parent.removeChild(i2);
        if (i2[isClean]) markDirtyUp(i2);
        if (typeof i2.raws.before === "undefined") {
          if (sample && typeof sample.raws.before !== "undefined") {
            i2.raws.before = sample.raws.before.replace(/\S/g, "");
          }
        }
        i2.parent = this.proxyOf;
        return i2;
      });
      return processed;
    }
    prepend(...children) {
      children = children.reverse();
      for (let child of children) {
        let nodes = this.normalize(child, this.first, "prepend").reverse();
        for (let node2 of nodes) this.proxyOf.nodes.unshift(node2);
        for (let id in this.indexes) {
          this.indexes[id] = this.indexes[id] + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    push(child) {
      child.parent = this;
      this.proxyOf.nodes.push(child);
      return this;
    }
    removeAll() {
      for (let node2 of this.proxyOf.nodes) node2.parent = void 0;
      this.proxyOf.nodes = [];
      this.markDirty();
      return this;
    }
    removeChild(child) {
      child = this.index(child);
      this.proxyOf.nodes[child].parent = void 0;
      this.proxyOf.nodes.splice(child, 1);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (index2 >= child) {
          this.indexes[id] = index2 - 1;
        }
      }
      this.markDirty();
      return this;
    }
    replaceValues(pattern, opts, callback) {
      if (!callback) {
        callback = opts;
        opts = {};
      }
      this.walkDecls((decl) => {
        if (opts.props && !opts.props.includes(decl.prop)) return;
        if (opts.fast && !decl.value.includes(opts.fast)) return;
        decl.value = decl.value.replace(pattern, callback);
      });
      this.markDirty();
      return this;
    }
    some(condition) {
      return this.nodes.some(condition);
    }
    walk(callback) {
      return this.each((child, i2) => {
        let result2;
        try {
          result2 = callback(child, i2);
        } catch (e2) {
          throw child.addToError(e2);
        }
        if (result2 !== false && child.walk) {
          result2 = child.walk(callback);
        }
        return result2;
      });
    }
    walkAtRules(name, callback) {
      if (!callback) {
        callback = name;
        return this.walk((child, i2) => {
          if (child.type === "atrule") {
            return callback(child, i2);
          }
        });
      }
      if (name instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "atrule" && name.test(child.name)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "atrule" && child.name === name) {
          return callback(child, i2);
        }
      });
    }
    walkComments(callback) {
      return this.walk((child, i2) => {
        if (child.type === "comment") {
          return callback(child, i2);
        }
      });
    }
    walkDecls(prop, callback) {
      if (!callback) {
        callback = prop;
        return this.walk((child, i2) => {
          if (child.type === "decl") {
            return callback(child, i2);
          }
        });
      }
      if (prop instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "decl" && prop.test(child.prop)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "decl" && child.prop === prop) {
          return callback(child, i2);
        }
      });
    }
    walkRules(selector, callback) {
      if (!callback) {
        callback = selector;
        return this.walk((child, i2) => {
          if (child.type === "rule") {
            return callback(child, i2);
          }
        });
      }
      if (selector instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "rule" && selector.test(child.selector)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "rule" && child.selector === selector) {
          return callback(child, i2);
        }
      });
    }
    get first() {
      if (!this.proxyOf.nodes) return void 0;
      return this.proxyOf.nodes[0];
    }
    get last() {
      if (!this.proxyOf.nodes) return void 0;
      return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  Container.registerParse = (dependant) => {
    parse = dependant;
  };
  Container.registerRule = (dependant) => {
    Rule = dependant;
  };
  Container.registerAtRule = (dependant) => {
    AtRule = dependant;
  };
  Container.registerRoot = (dependant) => {
    Root = dependant;
  };
  container$1 = Container;
  Container.default = Container;
  Container.rebuild = (node2) => {
    if (node2.type === "atrule") {
      Object.setPrototypeOf(node2, AtRule.prototype);
    } else if (node2.type === "rule") {
      Object.setPrototypeOf(node2, Rule.prototype);
    } else if (node2.type === "decl") {
      Object.setPrototypeOf(node2, Declaration.prototype);
    } else if (node2.type === "comment") {
      Object.setPrototypeOf(node2, Comment.prototype);
    } else if (node2.type === "root") {
      Object.setPrototypeOf(node2, Root.prototype);
    }
    node2[my] = true;
    if (node2.nodes) {
      node2.nodes.forEach((child) => {
        Container.rebuild(child);
      });
    }
  };
  return container$1;
}
var document$1$1;
var hasRequiredDocument$1;
function requireDocument$1() {
  if (hasRequiredDocument$1) return document$1$1;
  hasRequiredDocument$1 = 1;
  let Container = requireContainer$1();
  let LazyResult, Processor;
  class Document2 extends Container {
    constructor(defaults) {
      super({ type: "document", ...defaults });
      if (!this.nodes) {
        this.nodes = [];
      }
    }
    toResult(opts = {}) {
      let lazy = new LazyResult(new Processor(), this, opts);
      return lazy.stringify();
    }
  }
  Document2.registerLazyResult = (dependant) => {
    LazyResult = dependant;
  };
  Document2.registerProcessor = (dependant) => {
    Processor = dependant;
  };
  document$1$1 = Document2;
  Document2.default = Document2;
  return document$1$1;
}
var warnOnce$1;
var hasRequiredWarnOnce$1;
function requireWarnOnce$1() {
  if (hasRequiredWarnOnce$1) return warnOnce$1;
  hasRequiredWarnOnce$1 = 1;
  let printed = {};
  warnOnce$1 = function warnOnce2(message) {
    if (printed[message]) return;
    printed[message] = true;
    if (typeof console !== "undefined" && console.warn) {
      console.warn(message);
    }
  };
  return warnOnce$1;
}
var warning$1;
var hasRequiredWarning$1;
function requireWarning$1() {
  if (hasRequiredWarning$1) return warning$1;
  hasRequiredWarning$1 = 1;
  class Warning {
    constructor(text, opts = {}) {
      this.type = "warning";
      this.text = text;
      if (opts.node && opts.node.source) {
        let range = opts.node.rangeBy(opts);
        this.line = range.start.line;
        this.column = range.start.column;
        this.endLine = range.end.line;
        this.endColumn = range.end.column;
      }
      for (let opt in opts) this[opt] = opts[opt];
    }
    toString() {
      if (this.node) {
        return this.node.error(this.text, {
          index: this.index,
          plugin: this.plugin,
          word: this.word
        }).message;
      }
      if (this.plugin) {
        return this.plugin + ": " + this.text;
      }
      return this.text;
    }
  }
  warning$1 = Warning;
  Warning.default = Warning;
  return warning$1;
}
var result$1;
var hasRequiredResult$1;
function requireResult$1() {
  if (hasRequiredResult$1) return result$1;
  hasRequiredResult$1 = 1;
  let Warning = requireWarning$1();
  class Result {
    constructor(processor2, root2, opts) {
      this.processor = processor2;
      this.messages = [];
      this.root = root2;
      this.opts = opts;
      this.css = void 0;
      this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(text, opts = {}) {
      if (!opts.plugin) {
        if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
          opts.plugin = this.lastPlugin.postcssPlugin;
        }
      }
      let warning2 = new Warning(text, opts);
      this.messages.push(warning2);
      return warning2;
    }
    warnings() {
      return this.messages.filter((i2) => i2.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  result$1 = Result;
  Result.default = Result;
  return result$1;
}
var tokenize$1;
var hasRequiredTokenize$1;
function requireTokenize$1() {
  if (hasRequiredTokenize$1) return tokenize$1;
  hasRequiredTokenize$1 = 1;
  const SINGLE_QUOTE = "'".charCodeAt(0);
  const DOUBLE_QUOTE = '"'.charCodeAt(0);
  const BACKSLASH = "\\".charCodeAt(0);
  const SLASH = "/".charCodeAt(0);
  const NEWLINE = "\n".charCodeAt(0);
  const SPACE = " ".charCodeAt(0);
  const FEED = "\f".charCodeAt(0);
  const TAB = "	".charCodeAt(0);
  const CR = "\r".charCodeAt(0);
  const OPEN_SQUARE = "[".charCodeAt(0);
  const CLOSE_SQUARE = "]".charCodeAt(0);
  const OPEN_PARENTHESES = "(".charCodeAt(0);
  const CLOSE_PARENTHESES = ")".charCodeAt(0);
  const OPEN_CURLY = "{".charCodeAt(0);
  const CLOSE_CURLY = "}".charCodeAt(0);
  const SEMICOLON = ";".charCodeAt(0);
  const ASTERISK = "*".charCodeAt(0);
  const COLON = ":".charCodeAt(0);
  const AT = "@".charCodeAt(0);
  const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
  const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
  const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
  const RE_HEX_ESCAPE = /[\da-f]/i;
  tokenize$1 = function tokenizer(input2, options = {}) {
    let css = input2.css.valueOf();
    let ignore = options.ignoreErrors;
    let code, next, quote, content, escape;
    let escaped, escapePos, prev, n2, currentToken;
    let length = css.length;
    let pos = 0;
    let buffer = [];
    let returned = [];
    function position() {
      return pos;
    }
    function unclosed(what) {
      throw input2.error("Unclosed " + what, pos);
    }
    function endOfFile() {
      return returned.length === 0 && pos >= length;
    }
    function nextToken(opts) {
      if (returned.length) return returned.pop();
      if (pos >= length) return;
      let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
      code = css.charCodeAt(pos);
      switch (code) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED: {
          next = pos;
          do {
            next += 1;
            code = css.charCodeAt(next);
          } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
          currentToken = ["space", css.slice(pos, next)];
          pos = next - 1;
          break;
        }
        case OPEN_SQUARE:
        case CLOSE_SQUARE:
        case OPEN_CURLY:
        case CLOSE_CURLY:
        case COLON:
        case SEMICOLON:
        case CLOSE_PARENTHESES: {
          let controlChar = String.fromCharCode(code);
          currentToken = [controlChar, controlChar, pos];
          break;
        }
        case OPEN_PARENTHESES: {
          prev = buffer.length ? buffer.pop()[1] : "";
          n2 = css.charCodeAt(pos + 1);
          if (prev === "url" && n2 !== SINGLE_QUOTE && n2 !== DOUBLE_QUOTE && n2 !== SPACE && n2 !== NEWLINE && n2 !== TAB && n2 !== FEED && n2 !== CR) {
            next = pos;
            do {
              escaped = false;
              next = css.indexOf(")", next + 1);
              if (next === -1) {
                if (ignore || ignoreUnclosed) {
                  next = pos;
                  break;
                } else {
                  unclosed("bracket");
                }
              }
              escapePos = next;
              while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                escapePos -= 1;
                escaped = !escaped;
              }
            } while (escaped);
            currentToken = ["brackets", css.slice(pos, next + 1), pos, next];
            pos = next;
          } else {
            next = css.indexOf(")", pos + 1);
            content = css.slice(pos, next + 1);
            if (next === -1 || RE_BAD_BRACKET.test(content)) {
              currentToken = ["(", "(", pos];
            } else {
              currentToken = ["brackets", content, pos, next];
              pos = next;
            }
          }
          break;
        }
        case SINGLE_QUOTE:
        case DOUBLE_QUOTE: {
          quote = code === SINGLE_QUOTE ? "'" : '"';
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(quote, next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos + 1;
                break;
              } else {
                unclosed("string");
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped);
          currentToken = ["string", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        case AT: {
          RE_AT_END.lastIndex = pos + 1;
          RE_AT_END.test(css);
          if (RE_AT_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_AT_END.lastIndex - 2;
          }
          currentToken = ["at-word", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        case BACKSLASH: {
          next = pos;
          escape = true;
          while (css.charCodeAt(next + 1) === BACKSLASH) {
            next += 1;
            escape = !escape;
          }
          code = css.charCodeAt(next + 1);
          if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
            next += 1;
            if (RE_HEX_ESCAPE.test(css.charAt(next))) {
              while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
                next += 1;
              }
              if (css.charCodeAt(next + 1) === SPACE) {
                next += 1;
              }
            }
          }
          currentToken = ["word", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        default: {
          if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
            next = css.indexOf("*/", pos + 2) + 1;
            if (next === 0) {
              if (ignore || ignoreUnclosed) {
                next = css.length;
              } else {
                unclosed("comment");
              }
            }
            currentToken = ["comment", css.slice(pos, next + 1), pos, next];
            pos = next;
          } else {
            RE_WORD_END.lastIndex = pos + 1;
            RE_WORD_END.test(css);
            if (RE_WORD_END.lastIndex === 0) {
              next = css.length - 1;
            } else {
              next = RE_WORD_END.lastIndex - 2;
            }
            currentToken = ["word", css.slice(pos, next + 1), pos, next];
            buffer.push(currentToken);
            pos = next;
          }
          break;
        }
      }
      pos++;
      return currentToken;
    }
    function back(token) {
      returned.push(token);
    }
    return {
      back,
      endOfFile,
      nextToken,
      position
    };
  };
  return tokenize$1;
}
var atRule$1;
var hasRequiredAtRule$1;
function requireAtRule$1() {
  if (hasRequiredAtRule$1) return atRule$1;
  hasRequiredAtRule$1 = 1;
  let Container = requireContainer$1();
  class AtRule extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "atrule";
    }
    append(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.append(...children);
    }
    prepend(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.prepend(...children);
    }
  }
  atRule$1 = AtRule;
  AtRule.default = AtRule;
  Container.registerAtRule(AtRule);
  return atRule$1;
}
var root$1;
var hasRequiredRoot$1;
function requireRoot$1() {
  if (hasRequiredRoot$1) return root$1;
  hasRequiredRoot$1 = 1;
  let Container = requireContainer$1();
  let LazyResult, Processor;
  class Root extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "root";
      if (!this.nodes) this.nodes = [];
    }
    normalize(child, sample, type) {
      let nodes = super.normalize(child);
      if (sample) {
        if (type === "prepend") {
          if (this.nodes.length > 1) {
            sample.raws.before = this.nodes[1].raws.before;
          } else {
            delete sample.raws.before;
          }
        } else if (this.first !== sample) {
          for (let node2 of nodes) {
            node2.raws.before = sample.raws.before;
          }
        }
      }
      return nodes;
    }
    removeChild(child, ignore) {
      let index2 = this.index(child);
      if (!ignore && index2 === 0 && this.nodes.length > 1) {
        this.nodes[1].raws.before = this.nodes[index2].raws.before;
      }
      return super.removeChild(child);
    }
    toResult(opts = {}) {
      let lazy = new LazyResult(new Processor(), this, opts);
      return lazy.stringify();
    }
  }
  Root.registerLazyResult = (dependant) => {
    LazyResult = dependant;
  };
  Root.registerProcessor = (dependant) => {
    Processor = dependant;
  };
  root$1 = Root;
  Root.default = Root;
  Container.registerRoot(Root);
  return root$1;
}
var list_1$1;
var hasRequiredList$1;
function requireList$1() {
  if (hasRequiredList$1) return list_1$1;
  hasRequiredList$1 = 1;
  let list = {
    comma(string) {
      return list.split(string, [","], true);
    },
    space(string) {
      let spaces = [" ", "\n", "	"];
      return list.split(string, spaces);
    },
    split(string, separators, last) {
      let array = [];
      let current = "";
      let split = false;
      let func = 0;
      let inQuote = false;
      let prevQuote = "";
      let escape = false;
      for (let letter of string) {
        if (escape) {
          escape = false;
        } else if (letter === "\\") {
          escape = true;
        } else if (inQuote) {
          if (letter === prevQuote) {
            inQuote = false;
          }
        } else if (letter === '"' || letter === "'") {
          inQuote = true;
          prevQuote = letter;
        } else if (letter === "(") {
          func += 1;
        } else if (letter === ")") {
          if (func > 0) func -= 1;
        } else if (func === 0) {
          if (separators.includes(letter)) split = true;
        }
        if (split) {
          if (current !== "") array.push(current.trim());
          current = "";
          split = false;
        } else {
          current += letter;
        }
      }
      if (last || current !== "") array.push(current.trim());
      return array;
    }
  };
  list_1$1 = list;
  list.default = list;
  return list_1$1;
}
var rule$1;
var hasRequiredRule$1;
function requireRule$1() {
  if (hasRequiredRule$1) return rule$1;
  hasRequiredRule$1 = 1;
  let Container = requireContainer$1();
  let list = requireList$1();
  class Rule extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "rule";
      if (!this.nodes) this.nodes = [];
    }
    get selectors() {
      return list.comma(this.selector);
    }
    set selectors(values) {
      let match = this.selector ? this.selector.match(/,\s*/) : null;
      let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
      this.selector = values.join(sep);
    }
  }
  rule$1 = Rule;
  Rule.default = Rule;
  Container.registerRule(Rule);
  return rule$1;
}
var parser$1;
var hasRequiredParser$1;
function requireParser$1() {
  if (hasRequiredParser$1) return parser$1;
  hasRequiredParser$1 = 1;
  let Declaration = requireDeclaration$1();
  let tokenizer = requireTokenize$1();
  let Comment = requireComment$1();
  let AtRule = requireAtRule$1();
  let Root = requireRoot$1();
  let Rule = requireRule$1();
  const SAFE_COMMENT_NEIGHBOR = {
    empty: true,
    space: true
  };
  function findLastWithPosition(tokens) {
    for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
      let token = tokens[i2];
      let pos = token[3] || token[2];
      if (pos) return pos;
    }
  }
  class Parser {
    constructor(input2) {
      this.input = input2;
      this.root = new Root();
      this.current = this.root;
      this.spaces = "";
      this.semicolon = false;
      this.createTokenizer();
      this.root.source = { input: input2, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(token) {
      let node2 = new AtRule();
      node2.name = token[1].slice(1);
      if (node2.name === "") {
        this.unnamedAtrule(node2, token);
      }
      this.init(node2, token[2]);
      let type;
      let prev;
      let shift;
      let last = false;
      let open = false;
      let params = [];
      let brackets = [];
      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();
        type = token[0];
        if (type === "(" || type === "[") {
          brackets.push(type === "(" ? ")" : "]");
        } else if (type === "{" && brackets.length > 0) {
          brackets.push("}");
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
        }
        if (brackets.length === 0) {
          if (type === ";") {
            node2.source.end = this.getPosition(token[2]);
            node2.source.end.offset++;
            this.semicolon = true;
            break;
          } else if (type === "{") {
            open = true;
            break;
          } else if (type === "}") {
            if (params.length > 0) {
              shift = params.length - 1;
              prev = params[shift];
              while (prev && prev[0] === "space") {
                prev = params[--shift];
              }
              if (prev) {
                node2.source.end = this.getPosition(prev[3] || prev[2]);
                node2.source.end.offset++;
              }
            }
            this.end(token);
            break;
          } else {
            params.push(token);
          }
        } else {
          params.push(token);
        }
        if (this.tokenizer.endOfFile()) {
          last = true;
          break;
        }
      }
      node2.raws.between = this.spacesAndCommentsFromEnd(params);
      if (params.length) {
        node2.raws.afterName = this.spacesAndCommentsFromStart(params);
        this.raw(node2, "params", params);
        if (last) {
          token = params[params.length - 1];
          node2.source.end = this.getPosition(token[3] || token[2]);
          node2.source.end.offset++;
          this.spaces = node2.raws.between;
          node2.raws.between = "";
        }
      } else {
        node2.raws.afterName = "";
        node2.params = "";
      }
      if (open) {
        node2.nodes = [];
        this.current = node2;
      }
    }
    checkMissedSemicolon(tokens) {
      let colon = this.colon(tokens);
      if (colon === false) return;
      let founded = 0;
      let token;
      for (let j = colon - 1; j >= 0; j--) {
        token = tokens[j];
        if (token[0] !== "space") {
          founded += 1;
          if (founded === 2) break;
        }
      }
      throw this.input.error(
        "Missed semicolon",
        token[0] === "word" ? token[3] + 1 : token[2]
      );
    }
    colon(tokens) {
      let brackets = 0;
      let token, type, prev;
      for (let [i2, element] of tokens.entries()) {
        token = element;
        type = token[0];
        if (type === "(") {
          brackets += 1;
        }
        if (type === ")") {
          brackets -= 1;
        }
        if (brackets === 0 && type === ":") {
          if (!prev) {
            this.doubleColon(token);
          } else if (prev[0] === "word" && prev[1] === "progid") {
            continue;
          } else {
            return i2;
          }
        }
        prev = token;
      }
      return false;
    }
    comment(token) {
      let node2 = new Comment();
      this.init(node2, token[2]);
      node2.source.end = this.getPosition(token[3] || token[2]);
      node2.source.end.offset++;
      let text = token[1].slice(2, -2);
      if (/^\s*$/.test(text)) {
        node2.text = "";
        node2.raws.left = text;
        node2.raws.right = "";
      } else {
        let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
        node2.text = match[2];
        node2.raws.left = match[1];
        node2.raws.right = match[3];
      }
    }
    createTokenizer() {
      this.tokenizer = tokenizer(this.input);
    }
    decl(tokens, customProperty) {
      let node2 = new Declaration();
      this.init(node2, tokens[0][2]);
      let last = tokens[tokens.length - 1];
      if (last[0] === ";") {
        this.semicolon = true;
        tokens.pop();
      }
      node2.source.end = this.getPosition(
        last[3] || last[2] || findLastWithPosition(tokens)
      );
      node2.source.end.offset++;
      while (tokens[0][0] !== "word") {
        if (tokens.length === 1) this.unknownWord(tokens);
        node2.raws.before += tokens.shift()[1];
      }
      node2.source.start = this.getPosition(tokens[0][2]);
      node2.prop = "";
      while (tokens.length) {
        let type = tokens[0][0];
        if (type === ":" || type === "space" || type === "comment") {
          break;
        }
        node2.prop += tokens.shift()[1];
      }
      node2.raws.between = "";
      let token;
      while (tokens.length) {
        token = tokens.shift();
        if (token[0] === ":") {
          node2.raws.between += token[1];
          break;
        } else {
          if (token[0] === "word" && /\w/.test(token[1])) {
            this.unknownWord([token]);
          }
          node2.raws.between += token[1];
        }
      }
      if (node2.prop[0] === "_" || node2.prop[0] === "*") {
        node2.raws.before += node2.prop[0];
        node2.prop = node2.prop.slice(1);
      }
      let firstSpaces = [];
      let next;
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== "space" && next !== "comment") break;
        firstSpaces.push(tokens.shift());
      }
      this.precheckMissedSemicolon(tokens);
      for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
        token = tokens[i2];
        if (token[1].toLowerCase() === "!important") {
          node2.important = true;
          let string = this.stringFrom(tokens, i2);
          string = this.spacesFromEnd(tokens) + string;
          if (string !== " !important") node2.raws.important = string;
          break;
        } else if (token[1].toLowerCase() === "important") {
          let cache = tokens.slice(0);
          let str = "";
          for (let j = i2; j > 0; j--) {
            let type = cache[j][0];
            if (str.trim().indexOf("!") === 0 && type !== "space") {
              break;
            }
            str = cache.pop()[1] + str;
          }
          if (str.trim().indexOf("!") === 0) {
            node2.important = true;
            node2.raws.important = str;
            tokens = cache;
          }
        }
        if (token[0] !== "space" && token[0] !== "comment") {
          break;
        }
      }
      let hasWord = tokens.some((i2) => i2[0] !== "space" && i2[0] !== "comment");
      if (hasWord) {
        node2.raws.between += firstSpaces.map((i2) => i2[1]).join("");
        firstSpaces = [];
      }
      this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
      if (node2.value.includes(":") && !customProperty) {
        this.checkMissedSemicolon(tokens);
      }
    }
    doubleColon(token) {
      throw this.input.error(
        "Double colon",
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      );
    }
    emptyRule(token) {
      let node2 = new Rule();
      this.init(node2, token[2]);
      node2.selector = "";
      node2.raws.between = "";
      this.current = node2;
    }
    end(token) {
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.semicolon = false;
      this.current.raws.after = (this.current.raws.after || "") + this.spaces;
      this.spaces = "";
      if (this.current.parent) {
        this.current.source.end = this.getPosition(token[2]);
        this.current.source.end.offset++;
        this.current = this.current.parent;
      } else {
        this.unexpectedClose(token);
      }
    }
    endFile() {
      if (this.current.parent) this.unclosedBlock();
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.current.raws.after = (this.current.raws.after || "") + this.spaces;
      this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(token) {
      this.spaces += token[1];
      if (this.current.nodes) {
        let prev = this.current.nodes[this.current.nodes.length - 1];
        if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
          prev.raws.ownSemicolon = this.spaces;
          this.spaces = "";
        }
      }
    }
    // Helpers
    getPosition(offset) {
      let pos = this.input.fromOffset(offset);
      return {
        column: pos.col,
        line: pos.line,
        offset
      };
    }
    init(node2, offset) {
      this.current.push(node2);
      node2.source = {
        input: this.input,
        start: this.getPosition(offset)
      };
      node2.raws.before = this.spaces;
      this.spaces = "";
      if (node2.type !== "comment") this.semicolon = false;
    }
    other(start) {
      let end = false;
      let type = null;
      let colon = false;
      let bracket = null;
      let brackets = [];
      let customProperty = start[1].startsWith("--");
      let tokens = [];
      let token = start;
      while (token) {
        type = token[0];
        tokens.push(token);
        if (type === "(" || type === "[") {
          if (!bracket) bracket = token;
          brackets.push(type === "(" ? ")" : "]");
        } else if (customProperty && colon && type === "{") {
          if (!bracket) bracket = token;
          brackets.push("}");
        } else if (brackets.length === 0) {
          if (type === ";") {
            if (colon) {
              this.decl(tokens, customProperty);
              return;
            } else {
              break;
            }
          } else if (type === "{") {
            this.rule(tokens);
            return;
          } else if (type === "}") {
            this.tokenizer.back(tokens.pop());
            end = true;
            break;
          } else if (type === ":") {
            colon = true;
          }
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
          if (brackets.length === 0) bracket = null;
        }
        token = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile()) end = true;
      if (brackets.length > 0) this.unclosedBracket(bracket);
      if (end && colon) {
        if (!customProperty) {
          while (tokens.length) {
            token = tokens[tokens.length - 1][0];
            if (token !== "space" && token !== "comment") break;
            this.tokenizer.back(tokens.pop());
          }
        }
        this.decl(tokens, customProperty);
      } else {
        this.unknownWord(tokens);
      }
    }
    parse() {
      let token;
      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();
        switch (token[0]) {
          case "space":
            this.spaces += token[1];
            break;
          case ";":
            this.freeSemicolon(token);
            break;
          case "}":
            this.end(token);
            break;
          case "comment":
            this.comment(token);
            break;
          case "at-word":
            this.atrule(token);
            break;
          case "{":
            this.emptyRule(token);
            break;
          default:
            this.other(token);
            break;
        }
      }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(node2, prop, tokens, customProperty) {
      let token, type;
      let length = tokens.length;
      let value = "";
      let clean = true;
      let next, prev;
      for (let i2 = 0; i2 < length; i2 += 1) {
        token = tokens[i2];
        type = token[0];
        if (type === "space" && i2 === length - 1 && !customProperty) {
          clean = false;
        } else if (type === "comment") {
          prev = tokens[i2 - 1] ? tokens[i2 - 1][0] : "empty";
          next = tokens[i2 + 1] ? tokens[i2 + 1][0] : "empty";
          if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
            if (value.slice(-1) === ",") {
              clean = false;
            } else {
              value += token[1];
            }
          } else {
            clean = false;
          }
        } else {
          value += token[1];
        }
      }
      if (!clean) {
        let raw = tokens.reduce((all, i2) => all + i2[1], "");
        node2.raws[prop] = { raw, value };
      }
      node2[prop] = value;
    }
    rule(tokens) {
      tokens.pop();
      let node2 = new Rule();
      this.init(node2, tokens[0][2]);
      node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
      this.raw(node2, "selector", tokens);
      this.current = node2;
    }
    spacesAndCommentsFromEnd(tokens) {
      let lastTokenType;
      let spaces = "";
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== "space" && lastTokenType !== "comment") break;
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces;
    }
    // Errors
    spacesAndCommentsFromStart(tokens) {
      let next;
      let spaces = "";
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== "space" && next !== "comment") break;
        spaces += tokens.shift()[1];
      }
      return spaces;
    }
    spacesFromEnd(tokens) {
      let lastTokenType;
      let spaces = "";
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== "space") break;
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces;
    }
    stringFrom(tokens, from) {
      let result2 = "";
      for (let i2 = from; i2 < tokens.length; i2++) {
        result2 += tokens[i2][1];
      }
      tokens.splice(from, tokens.length - from);
      return result2;
    }
    unclosedBlock() {
      let pos = this.current.source.start;
      throw this.input.error("Unclosed block", pos.line, pos.column);
    }
    unclosedBracket(bracket) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: bracket[2] },
        { offset: bracket[2] + 1 }
      );
    }
    unexpectedClose(token) {
      throw this.input.error(
        "Unexpected }",
        { offset: token[2] },
        { offset: token[2] + 1 }
      );
    }
    unknownWord(tokens) {
      throw this.input.error(
        "Unknown word",
        { offset: tokens[0][2] },
        { offset: tokens[0][2] + tokens[0][1].length }
      );
    }
    unnamedAtrule(node2, token) {
      throw this.input.error(
        "At-rule without name",
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      );
    }
  }
  parser$1 = Parser;
  return parser$1;
}
var parse_1$1;
var hasRequiredParse$1;
function requireParse$1() {
  if (hasRequiredParse$1) return parse_1$1;
  hasRequiredParse$1 = 1;
  let Container = requireContainer$1();
  let Parser = requireParser$1();
  let Input = requireInput$1();
  function parse(css, opts) {
    let input2 = new Input(css, opts);
    let parser2 = new Parser(input2);
    try {
      parser2.parse();
    } catch (e2) {
      if (process.env.NODE_ENV !== "production") {
        if (e2.name === "CssSyntaxError" && opts && opts.from) {
          if (/\.scss$/i.test(opts.from)) {
            e2.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
          } else if (/\.sass/i.test(opts.from)) {
            e2.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
          } else if (/\.less$/i.test(opts.from)) {
            e2.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
          }
        }
      }
      throw e2;
    }
    return parser2.root;
  }
  parse_1$1 = parse;
  parse.default = parse;
  Container.registerParse(parse);
  return parse_1$1;
}
var lazyResult$1;
var hasRequiredLazyResult$1;
function requireLazyResult$1() {
  if (hasRequiredLazyResult$1) return lazyResult$1;
  hasRequiredLazyResult$1 = 1;
  let { isClean, my } = requireSymbols$1();
  let MapGenerator = requireMapGenerator$1();
  let stringify = requireStringify$1();
  let Container = requireContainer$1();
  let Document2 = requireDocument$1();
  let warnOnce2 = requireWarnOnce$1();
  let Result = requireResult$1();
  let parse = requireParse$1();
  let Root = requireRoot$1();
  const TYPE_TO_CLASS_NAME = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  };
  const PLUGIN_PROPS = {
    AtRule: true,
    AtRuleExit: true,
    Comment: true,
    CommentExit: true,
    Declaration: true,
    DeclarationExit: true,
    Document: true,
    DocumentExit: true,
    Once: true,
    OnceExit: true,
    postcssPlugin: true,
    prepare: true,
    Root: true,
    RootExit: true,
    Rule: true,
    RuleExit: true
  };
  const NOT_VISITORS = {
    Once: true,
    postcssPlugin: true,
    prepare: true
  };
  const CHILDREN = 0;
  function isPromise(obj) {
    return typeof obj === "object" && typeof obj.then === "function";
  }
  function getEvents(node2) {
    let key = false;
    let type = TYPE_TO_CLASS_NAME[node2.type];
    if (node2.type === "decl") {
      key = node2.prop.toLowerCase();
    } else if (node2.type === "atrule") {
      key = node2.name.toLowerCase();
    }
    if (key && node2.append) {
      return [
        type,
        type + "-" + key,
        CHILDREN,
        type + "Exit",
        type + "Exit-" + key
      ];
    } else if (key) {
      return [type, type + "-" + key, type + "Exit", type + "Exit-" + key];
    } else if (node2.append) {
      return [type, CHILDREN, type + "Exit"];
    } else {
      return [type, type + "Exit"];
    }
  }
  function toStack(node2) {
    let events;
    if (node2.type === "document") {
      events = ["Document", CHILDREN, "DocumentExit"];
    } else if (node2.type === "root") {
      events = ["Root", CHILDREN, "RootExit"];
    } else {
      events = getEvents(node2);
    }
    return {
      eventIndex: 0,
      events,
      iterator: 0,
      node: node2,
      visitorIndex: 0,
      visitors: []
    };
  }
  function cleanMarks(node2) {
    node2[isClean] = false;
    if (node2.nodes) node2.nodes.forEach((i2) => cleanMarks(i2));
    return node2;
  }
  let postcss2 = {};
  class LazyResult {
    constructor(processor2, css, opts) {
      this.stringified = false;
      this.processed = false;
      let root2;
      if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) {
        root2 = cleanMarks(css);
      } else if (css instanceof LazyResult || css instanceof Result) {
        root2 = cleanMarks(css.root);
        if (css.map) {
          if (typeof opts.map === "undefined") opts.map = {};
          if (!opts.map.inline) opts.map.inline = false;
          opts.map.prev = css.map;
        }
      } else {
        let parser2 = parse;
        if (opts.syntax) parser2 = opts.syntax.parse;
        if (opts.parser) parser2 = opts.parser;
        if (parser2.parse) parser2 = parser2.parse;
        try {
          root2 = parser2(css, opts);
        } catch (error) {
          this.processed = true;
          this.error = error;
        }
        if (root2 && !root2[my]) {
          Container.rebuild(root2);
        }
      }
      this.result = new Result(processor2, root2, opts);
      this.helpers = { ...postcss2, postcss: postcss2, result: this.result };
      this.plugins = this.processor.plugins.map((plugin) => {
        if (typeof plugin === "object" && plugin.prepare) {
          return { ...plugin, ...plugin.prepare(this.result) };
        } else {
          return plugin;
        }
      });
    }
    async() {
      if (this.error) return Promise.reject(this.error);
      if (this.processed) return Promise.resolve(this.result);
      if (!this.processing) {
        this.processing = this.runAsync();
      }
      return this.processing;
    }
    catch(onRejected) {
      return this.async().catch(onRejected);
    }
    finally(onFinally) {
      return this.async().then(onFinally, onFinally);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(error, node2) {
      let plugin = this.result.lastPlugin;
      try {
        if (node2) node2.addToError(error);
        this.error = error;
        if (error.name === "CssSyntaxError" && !error.plugin) {
          error.plugin = plugin.postcssPlugin;
          error.setMessage();
        } else if (plugin.postcssVersion) {
          if (process.env.NODE_ENV !== "production") {
            let pluginName = plugin.postcssPlugin;
            let pluginVer = plugin.postcssVersion;
            let runtimeVer = this.result.processor.version;
            let a2 = pluginVer.split(".");
            let b = runtimeVer.split(".");
            if (a2[0] !== b[0] || parseInt(a2[1]) > parseInt(b[1])) {
              console.error(
                "Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below."
              );
            }
          }
        }
      } catch (err) {
        if (console && console.error) console.error(err);
      }
      return error;
    }
    prepareVisitors() {
      this.listeners = {};
      let add = (plugin, type, cb) => {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push([plugin, cb]);
      };
      for (let plugin of this.plugins) {
        if (typeof plugin === "object") {
          for (let event in plugin) {
            if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
              throw new Error(
                `Unknown event ${event} in ${plugin.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            }
            if (!NOT_VISITORS[event]) {
              if (typeof plugin[event] === "object") {
                for (let filter in plugin[event]) {
                  if (filter === "*") {
                    add(plugin, event, plugin[event][filter]);
                  } else {
                    add(
                      plugin,
                      event + "-" + filter.toLowerCase(),
                      plugin[event][filter]
                    );
                  }
                }
              } else if (typeof plugin[event] === "function") {
                add(plugin, event, plugin[event]);
              }
            }
          }
        }
      }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let i2 = 0; i2 < this.plugins.length; i2++) {
        let plugin = this.plugins[i2];
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          try {
            await promise;
          } catch (error) {
            throw this.handleError(error);
          }
        }
      }
      this.prepareVisitors();
      if (this.hasListener) {
        let root2 = this.result.root;
        while (!root2[isClean]) {
          root2[isClean] = true;
          let stack = [toStack(root2)];
          while (stack.length > 0) {
            let promise = this.visitTick(stack);
            if (isPromise(promise)) {
              try {
                await promise;
              } catch (e2) {
                let node2 = stack[stack.length - 1].node;
                throw this.handleError(e2, node2);
              }
            }
          }
        }
        if (this.listeners.OnceExit) {
          for (let [plugin, visitor] of this.listeners.OnceExit) {
            this.result.lastPlugin = plugin;
            try {
              if (root2.type === "document") {
                let roots = root2.nodes.map(
                  (subRoot) => visitor(subRoot, this.helpers)
                );
                await Promise.all(roots);
              } else {
                await visitor(root2, this.helpers);
              }
            } catch (e2) {
              throw this.handleError(e2);
            }
          }
        }
      }
      this.processed = true;
      return this.stringify();
    }
    runOnRoot(plugin) {
      this.result.lastPlugin = plugin;
      try {
        if (typeof plugin === "object" && plugin.Once) {
          if (this.result.root.type === "document") {
            let roots = this.result.root.nodes.map(
              (root2) => plugin.Once(root2, this.helpers)
            );
            if (isPromise(roots[0])) {
              return Promise.all(roots);
            }
            return roots;
          }
          return plugin.Once(this.result.root, this.helpers);
        } else if (typeof plugin === "function") {
          return plugin(this.result.root, this.result);
        }
      } catch (error) {
        throw this.handleError(error);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = true;
      this.sync();
      let opts = this.result.opts;
      let str = stringify;
      if (opts.syntax) str = opts.syntax.stringify;
      if (opts.stringifier) str = opts.stringifier;
      if (str.stringify) str = str.stringify;
      let map = new MapGenerator(str, this.result.root, this.result.opts);
      let data = map.generate();
      this.result.css = data[0];
      this.result.map = data[1];
      return this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      this.processed = true;
      if (this.processing) {
        throw this.getAsyncError();
      }
      for (let plugin of this.plugins) {
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          throw this.getAsyncError();
        }
      }
      this.prepareVisitors();
      if (this.hasListener) {
        let root2 = this.result.root;
        while (!root2[isClean]) {
          root2[isClean] = true;
          this.walkSync(root2);
        }
        if (this.listeners.OnceExit) {
          if (root2.type === "document") {
            for (let subRoot of root2.nodes) {
              this.visitSync(this.listeners.OnceExit, subRoot);
            }
          } else {
            this.visitSync(this.listeners.OnceExit, root2);
          }
        }
      }
      return this.result;
    }
    then(onFulfilled, onRejected) {
      if (process.env.NODE_ENV !== "production") {
        if (!("from" in this.opts)) {
          warnOnce2(
            "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
          );
        }
      }
      return this.async().then(onFulfilled, onRejected);
    }
    toString() {
      return this.css;
    }
    visitSync(visitors, node2) {
      for (let [plugin, visitor] of visitors) {
        this.result.lastPlugin = plugin;
        let promise;
        try {
          promise = visitor(node2, this.helpers);
        } catch (e2) {
          throw this.handleError(e2, node2.proxyOf);
        }
        if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
          return true;
        }
        if (isPromise(promise)) {
          throw this.getAsyncError();
        }
      }
    }
    visitTick(stack) {
      let visit2 = stack[stack.length - 1];
      let { node: node2, visitors } = visit2;
      if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
        stack.pop();
        return;
      }
      if (visitors.length > 0 && visit2.visitorIndex < visitors.length) {
        let [plugin, visitor] = visitors[visit2.visitorIndex];
        visit2.visitorIndex += 1;
        if (visit2.visitorIndex === visitors.length) {
          visit2.visitors = [];
          visit2.visitorIndex = 0;
        }
        this.result.lastPlugin = plugin;
        try {
          return visitor(node2.toProxy(), this.helpers);
        } catch (e2) {
          throw this.handleError(e2, node2);
        }
      }
      if (visit2.iterator !== 0) {
        let iterator = visit2.iterator;
        let child;
        while (child = node2.nodes[node2.indexes[iterator]]) {
          node2.indexes[iterator] += 1;
          if (!child[isClean]) {
            child[isClean] = true;
            stack.push(toStack(child));
            return;
          }
        }
        visit2.iterator = 0;
        delete node2.indexes[iterator];
      }
      let events = visit2.events;
      while (visit2.eventIndex < events.length) {
        let event = events[visit2.eventIndex];
        visit2.eventIndex += 1;
        if (event === CHILDREN) {
          if (node2.nodes && node2.nodes.length) {
            node2[isClean] = true;
            visit2.iterator = node2.getIterator();
          }
          return;
        } else if (this.listeners[event]) {
          visit2.visitors = this.listeners[event];
          return;
        }
      }
      stack.pop();
    }
    walkSync(node2) {
      node2[isClean] = true;
      let events = getEvents(node2);
      for (let event of events) {
        if (event === CHILDREN) {
          if (node2.nodes) {
            node2.each((child) => {
              if (!child[isClean]) this.walkSync(child);
            });
          }
        } else {
          let visitors = this.listeners[event];
          if (visitors) {
            if (this.visitSync(visitors, node2.toProxy())) return;
          }
        }
      }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  LazyResult.registerPostcss = (dependant) => {
    postcss2 = dependant;
  };
  lazyResult$1 = LazyResult;
  LazyResult.default = LazyResult;
  Root.registerLazyResult(LazyResult);
  Document2.registerLazyResult(LazyResult);
  return lazyResult$1;
}
var noWorkResult$1;
var hasRequiredNoWorkResult$1;
function requireNoWorkResult$1() {
  if (hasRequiredNoWorkResult$1) return noWorkResult$1;
  hasRequiredNoWorkResult$1 = 1;
  let MapGenerator = requireMapGenerator$1();
  let stringify = requireStringify$1();
  let warnOnce2 = requireWarnOnce$1();
  let parse = requireParse$1();
  const Result = requireResult$1();
  class NoWorkResult {
    constructor(processor2, css, opts) {
      css = css.toString();
      this.stringified = false;
      this._processor = processor2;
      this._css = css;
      this._opts = opts;
      this._map = void 0;
      let root2;
      let str = stringify;
      this.result = new Result(this._processor, root2, this._opts);
      this.result.css = css;
      let self2 = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return self2.root;
        }
      });
      let map = new MapGenerator(str, root2, this._opts, css);
      if (map.isMap()) {
        let [generatedCSS, generatedMap] = map.generate();
        if (generatedCSS) {
          this.result.css = generatedCSS;
        }
        if (generatedMap) {
          this.result.map = generatedMap;
        }
      } else {
        map.clearAnnotation();
        this.result.css = map.css;
      }
    }
    async() {
      if (this.error) return Promise.reject(this.error);
      return Promise.resolve(this.result);
    }
    catch(onRejected) {
      return this.async().catch(onRejected);
    }
    finally(onFinally) {
      return this.async().then(onFinally, onFinally);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(onFulfilled, onRejected) {
      if (process.env.NODE_ENV !== "production") {
        if (!("from" in this._opts)) {
          warnOnce2(
            "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
          );
        }
      }
      return this.async().then(onFulfilled, onRejected);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root) {
        return this._root;
      }
      let root2;
      let parser2 = parse;
      try {
        root2 = parser2(this._css, this._opts);
      } catch (error) {
        this.error = error;
      }
      if (this.error) {
        throw this.error;
      } else {
        this._root = root2;
        return root2;
      }
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  noWorkResult$1 = NoWorkResult;
  NoWorkResult.default = NoWorkResult;
  return noWorkResult$1;
}
var processor$1;
var hasRequiredProcessor$1;
function requireProcessor$1() {
  if (hasRequiredProcessor$1) return processor$1;
  hasRequiredProcessor$1 = 1;
  let NoWorkResult = requireNoWorkResult$1();
  let LazyResult = requireLazyResult$1();
  let Document2 = requireDocument$1();
  let Root = requireRoot$1();
  class Processor {
    constructor(plugins = []) {
      this.version = "8.4.38";
      this.plugins = this.normalize(plugins);
    }
    normalize(plugins) {
      let normalized = [];
      for (let i2 of plugins) {
        if (i2.postcss === true) {
          i2 = i2();
        } else if (i2.postcss) {
          i2 = i2.postcss;
        }
        if (typeof i2 === "object" && Array.isArray(i2.plugins)) {
          normalized = normalized.concat(i2.plugins);
        } else if (typeof i2 === "object" && i2.postcssPlugin) {
          normalized.push(i2);
        } else if (typeof i2 === "function") {
          normalized.push(i2);
        } else if (typeof i2 === "object" && (i2.parse || i2.stringify)) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
          }
        } else {
          throw new Error(i2 + " is not a PostCSS plugin");
        }
      }
      return normalized;
    }
    process(css, opts = {}) {
      if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
        return new NoWorkResult(this, css, opts);
      } else {
        return new LazyResult(this, css, opts);
      }
    }
    use(plugin) {
      this.plugins = this.plugins.concat(this.normalize([plugin]));
      return this;
    }
  }
  processor$1 = Processor;
  Processor.default = Processor;
  Root.registerProcessor(Processor);
  Document2.registerProcessor(Processor);
  return processor$1;
}
var fromJSON_1$1;
var hasRequiredFromJSON$1;
function requireFromJSON$1() {
  if (hasRequiredFromJSON$1) return fromJSON_1$1;
  hasRequiredFromJSON$1 = 1;
  let Declaration = requireDeclaration$1();
  let PreviousMap = requirePreviousMap$1();
  let Comment = requireComment$1();
  let AtRule = requireAtRule$1();
  let Input = requireInput$1();
  let Root = requireRoot$1();
  let Rule = requireRule$1();
  function fromJSON(json, inputs) {
    if (Array.isArray(json)) return json.map((n2) => fromJSON(n2));
    let { inputs: ownInputs, ...defaults } = json;
    if (ownInputs) {
      inputs = [];
      for (let input2 of ownInputs) {
        let inputHydrated = { ...input2, __proto__: Input.prototype };
        if (inputHydrated.map) {
          inputHydrated.map = {
            ...inputHydrated.map,
            __proto__: PreviousMap.prototype
          };
        }
        inputs.push(inputHydrated);
      }
    }
    if (defaults.nodes) {
      defaults.nodes = json.nodes.map((n2) => fromJSON(n2, inputs));
    }
    if (defaults.source) {
      let { inputId, ...source } = defaults.source;
      defaults.source = source;
      if (inputId != null) {
        defaults.source.input = inputs[inputId];
      }
    }
    if (defaults.type === "root") {
      return new Root(defaults);
    } else if (defaults.type === "decl") {
      return new Declaration(defaults);
    } else if (defaults.type === "rule") {
      return new Rule(defaults);
    } else if (defaults.type === "comment") {
      return new Comment(defaults);
    } else if (defaults.type === "atrule") {
      return new AtRule(defaults);
    } else {
      throw new Error("Unknown node type: " + json.type);
    }
  }
  fromJSON_1$1 = fromJSON;
  fromJSON.default = fromJSON;
  return fromJSON_1$1;
}
var postcss_1$1;
var hasRequiredPostcss$1;
function requirePostcss$1() {
  if (hasRequiredPostcss$1) return postcss_1$1;
  hasRequiredPostcss$1 = 1;
  let CssSyntaxError = requireCssSyntaxError$1();
  let Declaration = requireDeclaration$1();
  let LazyResult = requireLazyResult$1();
  let Container = requireContainer$1();
  let Processor = requireProcessor$1();
  let stringify = requireStringify$1();
  let fromJSON = requireFromJSON$1();
  let Document2 = requireDocument$1();
  let Warning = requireWarning$1();
  let Comment = requireComment$1();
  let AtRule = requireAtRule$1();
  let Result = requireResult$1();
  let Input = requireInput$1();
  let parse = requireParse$1();
  let list = requireList$1();
  let Rule = requireRule$1();
  let Root = requireRoot$1();
  let Node2 = requireNode$1();
  function postcss2(...plugins) {
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
      plugins = plugins[0];
    }
    return new Processor(plugins);
  }
  postcss2.plugin = function plugin(name, initializer) {
    let warningPrinted = false;
    function creator(...args) {
      if (console && console.warn && !warningPrinted) {
        warningPrinted = true;
        console.warn(
          name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration"
        );
        if (process.env.LANG && process.env.LANG.startsWith("cn")) {
          console.warn(
            name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226"
          );
        }
      }
      let transformer = initializer(...args);
      transformer.postcssPlugin = name;
      transformer.postcssVersion = new Processor().version;
      return transformer;
    }
    let cache;
    Object.defineProperty(creator, "postcss", {
      get() {
        if (!cache) cache = creator();
        return cache;
      }
    });
    creator.process = function(css, processOpts, pluginOpts) {
      return postcss2([creator(pluginOpts)]).process(css, processOpts);
    };
    return creator;
  };
  postcss2.stringify = stringify;
  postcss2.parse = parse;
  postcss2.fromJSON = fromJSON;
  postcss2.list = list;
  postcss2.comment = (defaults) => new Comment(defaults);
  postcss2.atRule = (defaults) => new AtRule(defaults);
  postcss2.decl = (defaults) => new Declaration(defaults);
  postcss2.rule = (defaults) => new Rule(defaults);
  postcss2.root = (defaults) => new Root(defaults);
  postcss2.document = (defaults) => new Document2(defaults);
  postcss2.CssSyntaxError = CssSyntaxError;
  postcss2.Declaration = Declaration;
  postcss2.Container = Container;
  postcss2.Processor = Processor;
  postcss2.Document = Document2;
  postcss2.Comment = Comment;
  postcss2.Warning = Warning;
  postcss2.AtRule = AtRule;
  postcss2.Result = Result;
  postcss2.Input = Input;
  postcss2.Rule = Rule;
  postcss2.Root = Root;
  postcss2.Node = Node2;
  LazyResult.registerPostcss(postcss2);
  postcss_1$1 = postcss2;
  postcss2.default = postcss2;
  return postcss_1$1;
}
var postcssExports$1 = requirePostcss$1();
const postcss$1 = /* @__PURE__ */ getDefaultExportFromCjs$1(postcssExports$1);
postcss$1.stringify;
postcss$1.fromJSON;
postcss$1.plugin;
postcss$1.parse;
postcss$1.list;
postcss$1.document;
postcss$1.comment;
postcss$1.atRule;
postcss$1.rule;
postcss$1.decl;
postcss$1.root;
postcss$1.CssSyntaxError;
postcss$1.Declaration;
postcss$1.Container;
postcss$1.Processor;
postcss$1.Document;
postcss$1.Comment;
postcss$1.Warning;
postcss$1.AtRule;
postcss$1.Result;
postcss$1.Input;
postcss$1.Rule;
postcss$1.Root;
postcss$1.Node;
const tagMap = {
  script: "noscript",
  // camel case svg element tag names
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
function getTagName(n2) {
  let tagName = tagMap[n2.tagName] ? tagMap[n2.tagName] : n2.tagName;
  if (tagName === "link" && n2.attributes._cssText) {
    tagName = "style";
  }
  return tagName;
}
function adaptCssForReplay(cssText, cache) {
  const cachedStyle = cache == null ? void 0 : cache.stylesWithHoverClass.get(cssText);
  if (cachedStyle) return cachedStyle;
  let result2 = cssText;
  try {
    const ast = postcss$1([
      mediaSelectorPlugin,
      pseudoClassPlugin
    ]).process(cssText);
    result2 = ast.css;
  } catch (error) {
    console.warn("Failed to adapt css for replay", error);
  }
  cache == null ? void 0 : cache.stylesWithHoverClass.set(cssText, result2);
  return result2;
}
function createCache() {
  const stylesWithHoverClass = /* @__PURE__ */ new Map();
  return {
    stylesWithHoverClass
  };
}
const REBUILD_TARGET_ERROR = "rrweb-snapshot.rebuild() cannot rebuild into an unprotected browser document. Use rebuildIntoSandboxedIframe() or set UNSAFE_allowUnprotectedRebuild: true only when you accept the script-execution risk.";
const SANDBOXED_IFRAME_ROOT_ERROR = "rrweb-snapshot.createSandboxedIframe() requires root to be connected to a document before creating a sandboxed iframe.";
const sandboxedRebuildDocuments = /* @__PURE__ */ new WeakSet();
function isSupportedSandboxedIframe(frameElement) {
  if (!frameElement || frameElement.tagName !== "IFRAME") {
    return false;
  }
  if (!("sandbox" in frameElement)) {
    return false;
  }
  const sandboxTokens = Array.from(frameElement.sandbox);
  return sandboxTokens.length === 1 && sandboxTokens[0] === "allow-same-origin";
}
function assertRebuildTargetAllowed(options) {
  if (options.UNSAFE_allowUnprotectedRebuild) {
    return;
  }
  const win = options.doc.defaultView;
  if (!win) {
    return;
  }
  if (sandboxedRebuildDocuments.has(options.doc) && isSupportedSandboxedIframe(win.frameElement)) {
    return;
  }
  throw new Error(REBUILD_TARGET_ERROR);
}
function applyCssSplits(n2, cssText, hackCss, cache) {
  const childTextNodes = [];
  for (const scn of n2.childNodes) {
    if (scn.type === NodeType$3.Text) {
      childTextNodes.push(scn);
    }
  }
  const cssTextSplits = cssText.split("/* rr_split */");
  while (cssTextSplits.length > 1 && cssTextSplits.length > childTextNodes.length) {
    cssTextSplits.splice(-2, 2, cssTextSplits.slice(-2).join(""));
  }
  let adaptedCss = "";
  if (hackCss) {
    adaptedCss = adaptCssForReplay(cssTextSplits.join(""), cache);
  }
  let startIndex = 0;
  let errorOffset = -1;
  for (let i2 = 0; i2 < childTextNodes.length; i2++) {
    if (i2 === cssTextSplits.length) {
      break;
    }
    const childTextNode = childTextNodes[i2];
    let cssTextSection = cssTextSplits[i2];
    const nextTextSection = i2 < cssTextSplits.length - 1 ? cssTextSplits[i2 + 1] : null;
    if (hackCss && nextTextSection) {
      let endIndex = startIndex;
      let endSearch = nextTextSection.length;
      endSearch = Math.min(endSearch, 30);
      let found = false;
      for (; endSearch > 2; endSearch--) {
        const searchBit = nextTextSection.substring(0, endSearch);
        const searchIndex = adaptedCss.substring(startIndex).indexOf(searchBit);
        found = searchIndex !== -1;
        if (found) {
          endIndex += searchIndex;
          break;
        }
      }
      if (!found) {
        endIndex += cssTextSection.length;
      }
      cssTextSection = adaptedCss.substring(startIndex, endIndex);
      startIndex = endIndex;
    } else if (hackCss) {
      cssTextSection = adaptedCss.substring(startIndex);
    }
    if (errorOffset !== -1) {
      cssTextSection = cssTextSection.substring(errorOffset);
    }
    if (nextTextSection && (errorOffset !== -1 || cssTextSection.endsWith("0p") && nextTextSection.startsWith("x"))) {
      errorOffset = nextTextSection.indexOf("}");
      if (errorOffset !== -1) {
        errorOffset += 1;
        cssTextSection += nextTextSection.substring(0, errorOffset);
      }
    }
    childTextNode.textContent = cssTextSection;
  }
}
function buildStyleNode(n2, styleEl, cssText, options) {
  const { doc, hackCss, cache } = options;
  if (n2.childNodes.length) {
    applyCssSplits(n2, cssText, hackCss, cache);
  } else {
    if (hackCss) {
      cssText = adaptCssForReplay(cssText, cache);
    }
    styleEl.appendChild(doc.createTextNode(cssText));
  }
}
function buildNode(n2, options) {
  var _a2;
  const { doc, hackCss, cache } = options;
  switch (n2.type) {
    case NodeType$3.Document:
      return doc.implementation.createDocument(null, "", null);
    case NodeType$3.DocumentType:
      return doc.implementation.createDocumentType(
        n2.name || "html",
        n2.publicId,
        n2.systemId
      );
    case NodeType$3.Element: {
      const tagName = getTagName(n2);
      let node2;
      if (n2.isSVG) {
        node2 = doc.createElementNS("http://www.w3.org/2000/svg", tagName);
      } else {
        if (
          // If the tag name is a custom element name
          n2.isCustom && // If the browser supports custom elements
          ((_a2 = doc.defaultView) == null ? void 0 : _a2.customElements) && // If the custom element hasn't been defined yet
          !doc.defaultView.customElements.get(n2.tagName)
        )
          doc.defaultView.customElements.define(
            n2.tagName,
            class extends doc.defaultView.HTMLElement {
            }
          );
        node2 = doc.createElement(tagName);
      }
      const specialAttributes = {};
      for (const name in n2.attributes) {
        if (!Object.prototype.hasOwnProperty.call(n2.attributes, name)) {
          continue;
        }
        let value = n2.attributes[name];
        if (tagName === "option" && name === "selected" && value === false) {
          continue;
        }
        if (value === null) {
          continue;
        }
        if (value === true) value = "";
        if (name.startsWith("rr_")) {
          specialAttributes[name] = value;
          continue;
        }
        if (typeof value !== "string") ;
        else if (tagName === "style" && name === "_cssText") {
          buildStyleNode(n2, node2, value, options);
          continue;
        } else if (tagName === "textarea" && name === "value") {
          node2.appendChild(doc.createTextNode(value));
          n2.childNodes = [];
          continue;
        }
        try {
          if (n2.isSVG && name === "xlink:href") {
            node2.setAttributeNS(
              "http://www.w3.org/1999/xlink",
              name,
              value.toString()
            );
          } else if (name === "onload" || name === "onclick" || name.substring(0, 7) === "onmouse") {
            node2.setAttribute("_" + name, value.toString());
          } else if (tagName === "meta" && n2.attributes["http-equiv"] === "Content-Security-Policy" && name === "content") {
            node2.setAttribute("csp-content", value.toString());
            continue;
          } else if (tagName === "link" && (n2.attributes.rel === "preload" && n2.attributes.as === "script" || n2.attributes.rel === "modulepreload")) {
          } else if (tagName === "link" && n2.attributes.rel === "prefetch" && typeof n2.attributes.href === "string" && extractFileExtension(n2.attributes.href) === "js") {
          } else if (tagName === "img" && n2.attributes.srcset && n2.attributes.rr_dataURL) {
            node2.setAttribute(
              "rrweb-original-srcset",
              n2.attributes.srcset
            );
          } else {
            node2.setAttribute(name, value.toString());
          }
        } catch (error) {
        }
      }
      for (const name in specialAttributes) {
        const value = specialAttributes[name];
        if (tagName === "canvas" && name === "rr_dataURL") {
          const image = doc.createElement("img");
          image.onload = () => {
            const ctx = node2.getContext("2d");
            if (ctx) {
              ctx.drawImage(image, 0, 0, image.width, image.height);
            }
          };
          image.src = value.toString();
          if (node2.RRNodeType)
            node2.rr_dataURL = value.toString();
        } else if (tagName === "img" && name === "rr_dataURL") {
          const image = node2;
          if (!image.currentSrc.startsWith("data:")) {
            image.setAttribute(
              "rrweb-original-src",
              n2.attributes.src
            );
            image.src = value.toString();
          }
        }
        if (name === "rr_width") {
          node2.style.setProperty("width", value.toString());
        } else if (name === "rr_height") {
          node2.style.setProperty("height", value.toString());
        } else if (name === "rr_mediaCurrentTime" && typeof value === "number") {
          node2.currentTime = value;
        } else if (name === "rr_mediaState") {
          switch (value) {
            case "played":
              node2.play().catch((e2) => console.warn("media playback error", e2));
              break;
            case "paused":
              node2.pause();
              break;
          }
        } else if (name === "rr_mediaPlaybackRate" && typeof value === "number") {
          node2.playbackRate = value;
        } else if (name === "rr_mediaMuted" && typeof value === "boolean") {
          node2.muted = value;
        } else if (name === "rr_mediaLoop" && typeof value === "boolean") {
          node2.loop = value;
        } else if (name === "rr_mediaVolume" && typeof value === "number") {
          node2.volume = value;
        } else if (name === "rr_open_mode") {
          node2.setAttribute(
            "rr_open_mode",
            value
          );
        }
      }
      if (n2.isShadowHost) {
        if (!node2.shadowRoot) {
          node2.attachShadow({ mode: "open" });
        } else {
          while (node2.shadowRoot.firstChild) {
            node2.shadowRoot.removeChild(node2.shadowRoot.firstChild);
          }
        }
      }
      if (tagName === "input" || tagName === "textarea") {
        node2.setAttribute("autocomplete", "off");
      }
      return node2;
    }
    case NodeType$3.Text:
      if (n2.isStyle && hackCss) {
        return doc.createTextNode(adaptCssForReplay(n2.textContent, cache));
      }
      return doc.createTextNode(n2.textContent);
    case NodeType$3.CDATA:
      return doc.createCDATASection(n2.textContent);
    case NodeType$3.Comment:
      return doc.createComment(n2.textContent);
    default:
      return null;
  }
}
function buildNodeWithSN(n2, options) {
  const {
    doc,
    mirror: mirror2,
    skipChild = false,
    hackCss = true,
    afterAppend,
    cache
  } = options;
  if (mirror2.has(n2.id)) {
    const nodeInMirror = mirror2.getNode(n2.id);
    const meta = mirror2.getMeta(nodeInMirror);
    if (isNodeMetaEqual(meta, n2)) return mirror2.getNode(n2.id);
  }
  let node2 = buildNode(n2, { doc, hackCss, cache });
  if (!node2) {
    return null;
  }
  if (n2.rootId && mirror2.getNode(n2.rootId) !== doc) {
    mirror2.replace(n2.rootId, doc);
  }
  if (n2.type === NodeType$3.Document) {
    doc.close();
    doc.open();
    if (n2.compatMode === "BackCompat" && n2.childNodes && n2.childNodes[0].type !== NodeType$3.DocumentType) {
      if (n2.childNodes[0].type === NodeType$3.Element && "xmlns" in n2.childNodes[0].attributes && n2.childNodes[0].attributes.xmlns === "http://www.w3.org/1999/xhtml") {
        doc.write(
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">'
        );
      } else {
        doc.write(
          '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">'
        );
      }
    }
    node2 = doc;
  }
  mirror2.add(node2, n2);
  if ((n2.type === NodeType$3.Document || n2.type === NodeType$3.Element) && !skipChild) {
    for (const childN of n2.childNodes) {
      const childNode = buildNodeWithSN(childN, {
        doc,
        mirror: mirror2,
        skipChild: false,
        hackCss,
        afterAppend,
        cache
      });
      if (!childNode) {
        console.warn("Failed to rebuild", childN);
        continue;
      }
      if (childN.isShadow && isElement(node2) && node2.shadowRoot) {
        node2.shadowRoot.appendChild(childNode);
      } else if (n2.type === NodeType$3.Document && childN.type == NodeType$3.Element) {
        const htmlElement = childNode;
        let body = null;
        htmlElement.childNodes.forEach((child) => {
          if (child.nodeName === "BODY") body = child;
        });
        if (body) {
          htmlElement.removeChild(body);
          node2.appendChild(childNode);
          htmlElement.appendChild(body);
        } else {
          node2.appendChild(childNode);
        }
      } else {
        node2.appendChild(childNode);
      }
      if (afterAppend) {
        afterAppend(childNode, childN.id);
      }
    }
  }
  return node2;
}
function visit(mirror2, onVisit) {
  function walk(node2) {
    onVisit(node2);
  }
  for (const id of mirror2.getIds()) {
    if (mirror2.has(id)) {
      walk(mirror2.getNode(id));
    }
  }
}
function handleScroll(node2, mirror2) {
  const n2 = mirror2.getMeta(node2);
  if ((n2 == null ? void 0 : n2.type) !== NodeType$3.Element) {
    return;
  }
  const el = node2;
  for (const name in n2.attributes) {
    if (!(Object.prototype.hasOwnProperty.call(n2.attributes, name) && name.startsWith("rr_"))) {
      continue;
    }
    const value = n2.attributes[name];
    if (name === "rr_scrollLeft") {
      el.scrollLeft = value;
    }
    if (name === "rr_scrollTop") {
      el.scrollTop = value;
    }
  }
}
function rebuild(n2, options) {
  assertRebuildTargetAllowed(options);
  const {
    doc,
    onVisit,
    hackCss = true,
    afterAppend,
    cache,
    mirror: mirror2 = new Mirror()
  } = options;
  const node2 = buildNodeWithSN(n2, {
    doc,
    mirror: mirror2,
    skipChild: false,
    hackCss,
    afterAppend,
    cache
  });
  visit(mirror2, (visitedNode) => {
    if (onVisit) {
      onVisit(visitedNode);
    }
    handleScroll(visitedNode, mirror2);
  });
  return node2;
}
function createSandboxedIframe(options) {
  var _a2;
  if (!options.root.isConnected) {
    throw new Error(SANDBOXED_IFRAME_ROOT_ERROR);
  }
  const iframe = options.root.ownerDocument.createElement("iframe");
  for (const [name, value] of Object.entries(options.iframeAttributes || {})) {
    if (name === "sandbox") {
      continue;
    }
    iframe.setAttribute(name, value);
  }
  iframe.setAttribute("sandbox", "allow-same-origin");
  options.root.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc || !iframe.contentWindow) {
    (_a2 = iframe.parentNode) == null ? void 0 : _a2.removeChild(iframe);
    throw new Error(SANDBOXED_IFRAME_ROOT_ERROR);
  }
  sandboxedRebuildDocuments.add(doc);
  return iframe;
}
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var __defProp22 = Object.defineProperty;
var __defNormalProp22 = (obj, key, value) => key in obj ? __defProp22(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField22 = (obj, key, value) => __defNormalProp22(obj, typeof key !== "symbol" ? key + "" : key, value);
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) ;
let Mirror$1 = class Mirror2 {
  constructor() {
    __publicField22(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField22(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2) return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach(
        (childNode) => this.removeNodeFromMap(childNode)
      );
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node2) {
    return this.nodeMetaMap.has(node2);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta) this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
};
function createMirror$1() {
  return new Mirror$1();
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n2) {
  if (n2.__esModule) return n2;
  var f2 = n2.default;
  if (typeof f2 == "function") {
    var a2 = function a22() {
      if (this instanceof a22) {
        return Reflect.construct(f2, arguments, this.constructor);
      }
      return f2.apply(this, arguments);
    };
    a2.prototype = f2.prototype;
  } else a2 = {};
  Object.defineProperty(a2, "__esModule", { value: true });
  Object.keys(n2).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n2, k);
    Object.defineProperty(a2, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n2[k];
      }
    });
  });
  return a2;
}
var picocolors_browser = { exports: {} };
var hasRequiredPicocolors_browser;
function requirePicocolors_browser() {
  if (hasRequiredPicocolors_browser) return picocolors_browser.exports;
  hasRequiredPicocolors_browser = 1;
  var x = String;
  var create = function() {
    return { isColorSupported: false, reset: x, bold: x, dim: x, italic: x, underline: x, inverse: x, hidden: x, strikethrough: x, black: x, red: x, green: x, yellow: x, blue: x, magenta: x, cyan: x, white: x, gray: x, bgBlack: x, bgRed: x, bgGreen: x, bgYellow: x, bgBlue: x, bgMagenta: x, bgCyan: x, bgWhite: x };
  };
  picocolors_browser.exports = create();
  picocolors_browser.exports.createColors = create;
  return picocolors_browser.exports;
}
const __viteBrowserExternal = {};
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
var cssSyntaxError;
var hasRequiredCssSyntaxError;
function requireCssSyntaxError() {
  if (hasRequiredCssSyntaxError) return cssSyntaxError;
  hasRequiredCssSyntaxError = 1;
  let pico = /* @__PURE__ */ requirePicocolors_browser();
  let terminalHighlight = require$$2;
  class CssSyntaxError extends Error {
    constructor(message, line, column, source, file, plugin) {
      super(message);
      this.name = "CssSyntaxError";
      this.reason = message;
      if (file) {
        this.file = file;
      }
      if (source) {
        this.source = source;
      }
      if (plugin) {
        this.plugin = plugin;
      }
      if (typeof line !== "undefined" && typeof column !== "undefined") {
        if (typeof line === "number") {
          this.line = line;
          this.column = column;
        } else {
          this.line = line.line;
          this.column = line.column;
          this.endLine = column.line;
          this.endColumn = column.column;
        }
      }
      this.setMessage();
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CssSyntaxError);
      }
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "";
      this.message += this.file ? this.file : "<css input>";
      if (typeof this.line !== "undefined") {
        this.message += ":" + this.line + ":" + this.column;
      }
      this.message += ": " + this.reason;
    }
    showSourceCode(color) {
      if (!this.source) return "";
      let css = this.source;
      if (color == null) color = pico.isColorSupported;
      if (terminalHighlight) {
        if (color) css = terminalHighlight(css);
      }
      let lines = css.split(/\r?\n/);
      let start = Math.max(this.line - 3, 0);
      let end = Math.min(this.line + 2, lines.length);
      let maxWidth = String(end).length;
      let mark, aside;
      if (color) {
        let { bold, gray, red } = pico.createColors(true);
        mark = (text) => bold(red(text));
        aside = (text) => gray(text);
      } else {
        mark = aside = (str) => str;
      }
      return lines.slice(start, end).map((line, index2) => {
        let number = start + 1 + index2;
        let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
        if (number === this.line) {
          let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
        }
        return " " + aside(gutter) + line;
      }).join("\n");
    }
    toString() {
      let code = this.showSourceCode();
      if (code) {
        code = "\n\n" + code + "\n";
      }
      return this.name + ": " + this.message + code;
    }
  }
  cssSyntaxError = CssSyntaxError;
  CssSyntaxError.default = CssSyntaxError;
  return cssSyntaxError;
}
var symbols = {};
var hasRequiredSymbols;
function requireSymbols() {
  if (hasRequiredSymbols) return symbols;
  hasRequiredSymbols = 1;
  symbols.isClean = Symbol("isClean");
  symbols.my = Symbol("my");
  return symbols;
}
var stringifier;
var hasRequiredStringifier;
function requireStringifier() {
  if (hasRequiredStringifier) return stringifier;
  hasRequiredStringifier = 1;
  const DEFAULT_RAW = {
    after: "\n",
    beforeClose: "\n",
    beforeComment: "\n",
    beforeDecl: "\n",
    beforeOpen: " ",
    beforeRule: "\n",
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: false
  };
  function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }
  class Stringifier {
    constructor(builder) {
      this.builder = builder;
    }
    atrule(node2, semicolon) {
      let name = "@" + node2.name;
      let params = node2.params ? this.rawValue(node2, "params") : "";
      if (typeof node2.raws.afterName !== "undefined") {
        name += node2.raws.afterName;
      } else if (params) {
        name += " ";
      }
      if (node2.nodes) {
        this.block(node2, name + params);
      } else {
        let end = (node2.raws.between || "") + (semicolon ? ";" : "");
        this.builder(name + params + end, node2);
      }
    }
    beforeAfter(node2, detect) {
      let value;
      if (node2.type === "decl") {
        value = this.raw(node2, null, "beforeDecl");
      } else if (node2.type === "comment") {
        value = this.raw(node2, null, "beforeComment");
      } else if (detect === "before") {
        value = this.raw(node2, null, "beforeRule");
      } else {
        value = this.raw(node2, null, "beforeClose");
      }
      let buf = node2.parent;
      let depth = 0;
      while (buf && buf.type !== "root") {
        depth += 1;
        buf = buf.parent;
      }
      if (value.includes("\n")) {
        let indent = this.raw(node2, null, "indent");
        if (indent.length) {
          for (let step = 0; step < depth; step++) value += indent;
        }
      }
      return value;
    }
    block(node2, start) {
      let between = this.raw(node2, "between", "beforeOpen");
      this.builder(start + between + "{", node2, "start");
      let after;
      if (node2.nodes && node2.nodes.length) {
        this.body(node2);
        after = this.raw(node2, "after");
      } else {
        after = this.raw(node2, "after", "emptyBody");
      }
      if (after) this.builder(after);
      this.builder("}", node2, "end");
    }
    body(node2) {
      let last = node2.nodes.length - 1;
      while (last > 0) {
        if (node2.nodes[last].type !== "comment") break;
        last -= 1;
      }
      let semicolon = this.raw(node2, "semicolon");
      for (let i2 = 0; i2 < node2.nodes.length; i2++) {
        let child = node2.nodes[i2];
        let before = this.raw(child, "before");
        if (before) this.builder(before);
        this.stringify(child, last !== i2 || semicolon);
      }
    }
    comment(node2) {
      let left = this.raw(node2, "left", "commentLeft");
      let right = this.raw(node2, "right", "commentRight");
      this.builder("/*" + left + node2.text + right + "*/", node2);
    }
    decl(node2, semicolon) {
      let between = this.raw(node2, "between", "colon");
      let string = node2.prop + between + this.rawValue(node2, "value");
      if (node2.important) {
        string += node2.raws.important || " !important";
      }
      if (semicolon) string += ";";
      this.builder(string, node2);
    }
    document(node2) {
      this.body(node2);
    }
    raw(node2, own, detect) {
      let value;
      if (!detect) detect = own;
      if (own) {
        value = node2.raws[own];
        if (typeof value !== "undefined") return value;
      }
      let parent = node2.parent;
      if (detect === "before") {
        if (!parent || parent.type === "root" && parent.first === node2) {
          return "";
        }
        if (parent && parent.type === "document") {
          return "";
        }
      }
      if (!parent) return DEFAULT_RAW[detect];
      let root2 = node2.root();
      if (!root2.rawCache) root2.rawCache = {};
      if (typeof root2.rawCache[detect] !== "undefined") {
        return root2.rawCache[detect];
      }
      if (detect === "before" || detect === "after") {
        return this.beforeAfter(node2, detect);
      } else {
        let method = "raw" + capitalize(detect);
        if (this[method]) {
          value = this[method](root2, node2);
        } else {
          root2.walk((i2) => {
            value = i2.raws[own];
            if (typeof value !== "undefined") return false;
          });
        }
      }
      if (typeof value === "undefined") value = DEFAULT_RAW[detect];
      root2.rawCache[detect] = value;
      return value;
    }
    rawBeforeClose(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length > 0) {
          if (typeof i2.raws.after !== "undefined") {
            value = i2.raws.after;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        }
      });
      if (value) value = value.replace(/\S/g, "");
      return value;
    }
    rawBeforeComment(root2, node2) {
      let value;
      root2.walkComments((i2) => {
        if (typeof i2.raws.before !== "undefined") {
          value = i2.raws.before;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      });
      if (typeof value === "undefined") {
        value = this.raw(node2, null, "beforeDecl");
      } else if (value) {
        value = value.replace(/\S/g, "");
      }
      return value;
    }
    rawBeforeDecl(root2, node2) {
      let value;
      root2.walkDecls((i2) => {
        if (typeof i2.raws.before !== "undefined") {
          value = i2.raws.before;
          if (value.includes("\n")) {
            value = value.replace(/[^\n]+$/, "");
          }
          return false;
        }
      });
      if (typeof value === "undefined") {
        value = this.raw(node2, null, "beforeRule");
      } else if (value) {
        value = value.replace(/\S/g, "");
      }
      return value;
    }
    rawBeforeOpen(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.type !== "decl") {
          value = i2.raws.between;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawBeforeRule(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && (i2.parent !== root2 || root2.first !== i2)) {
          if (typeof i2.raws.before !== "undefined") {
            value = i2.raws.before;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        }
      });
      if (value) value = value.replace(/\S/g, "");
      return value;
    }
    rawColon(root2) {
      let value;
      root2.walkDecls((i2) => {
        if (typeof i2.raws.between !== "undefined") {
          value = i2.raws.between.replace(/[^\s:]/g, "");
          return false;
        }
      });
      return value;
    }
    rawEmptyBody(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length === 0) {
          value = i2.raws.after;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawIndent(root2) {
      if (root2.raws.indent) return root2.raws.indent;
      let value;
      root2.walk((i2) => {
        let p = i2.parent;
        if (p && p !== root2 && p.parent && p.parent === root2) {
          if (typeof i2.raws.before !== "undefined") {
            let parts = i2.raws.before.split("\n");
            value = parts[parts.length - 1];
            value = value.replace(/\S/g, "");
            return false;
          }
        }
      });
      return value;
    }
    rawSemicolon(root2) {
      let value;
      root2.walk((i2) => {
        if (i2.nodes && i2.nodes.length && i2.last.type === "decl") {
          value = i2.raws.semicolon;
          if (typeof value !== "undefined") return false;
        }
      });
      return value;
    }
    rawValue(node2, prop) {
      let value = node2[prop];
      let raw = node2.raws[prop];
      if (raw && raw.value === value) {
        return raw.raw;
      }
      return value;
    }
    root(node2) {
      this.body(node2);
      if (node2.raws.after) this.builder(node2.raws.after);
    }
    rule(node2) {
      this.block(node2, this.rawValue(node2, "selector"));
      if (node2.raws.ownSemicolon) {
        this.builder(node2.raws.ownSemicolon, node2, "end");
      }
    }
    stringify(node2, semicolon) {
      if (!this[node2.type]) {
        throw new Error(
          "Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier."
        );
      }
      this[node2.type](node2, semicolon);
    }
  }
  stringifier = Stringifier;
  Stringifier.default = Stringifier;
  return stringifier;
}
var stringify_1;
var hasRequiredStringify;
function requireStringify() {
  if (hasRequiredStringify) return stringify_1;
  hasRequiredStringify = 1;
  let Stringifier = requireStringifier();
  function stringify(node2, builder) {
    let str = new Stringifier(builder);
    str.stringify(node2);
  }
  stringify_1 = stringify;
  stringify.default = stringify;
  return stringify_1;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  let { isClean, my } = requireSymbols();
  let CssSyntaxError = requireCssSyntaxError();
  let Stringifier = requireStringifier();
  let stringify = requireStringify();
  function cloneNode(obj, parent) {
    let cloned = new obj.constructor();
    for (let i2 in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, i2)) {
        continue;
      }
      if (i2 === "proxyCache") continue;
      let value = obj[i2];
      let type = typeof value;
      if (i2 === "parent" && type === "object") {
        if (parent) cloned[i2] = parent;
      } else if (i2 === "source") {
        cloned[i2] = value;
      } else if (Array.isArray(value)) {
        cloned[i2] = value.map((j) => cloneNode(j, cloned));
      } else {
        if (type === "object" && value !== null) value = cloneNode(value);
        cloned[i2] = value;
      }
    }
    return cloned;
  }
  class Node2 {
    constructor(defaults = {}) {
      this.raws = {};
      this[isClean] = false;
      this[my] = true;
      for (let name in defaults) {
        if (name === "nodes") {
          this.nodes = [];
          for (let node2 of defaults[name]) {
            if (typeof node2.clone === "function") {
              this.append(node2.clone());
            } else {
              this.append(node2);
            }
          }
        } else {
          this[name] = defaults[name];
        }
      }
    }
    addToError(error) {
      error.postcssNode = this;
      if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
        let s2 = this.source;
        error.stack = error.stack.replace(
          /\n\s{4}at /,
          `$&${s2.input.from}:${s2.start.line}:${s2.start.column}$&`
        );
      }
      return error;
    }
    after(add) {
      this.parent.insertAfter(this, add);
      return this;
    }
    assign(overrides = {}) {
      for (let name in overrides) {
        this[name] = overrides[name];
      }
      return this;
    }
    before(add) {
      this.parent.insertBefore(this, add);
      return this;
    }
    cleanRaws(keepBetween) {
      delete this.raws.before;
      delete this.raws.after;
      if (!keepBetween) delete this.raws.between;
    }
    clone(overrides = {}) {
      let cloned = cloneNode(this);
      for (let name in overrides) {
        cloned[name] = overrides[name];
      }
      return cloned;
    }
    cloneAfter(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertAfter(this, cloned);
      return cloned;
    }
    cloneBefore(overrides = {}) {
      let cloned = this.clone(overrides);
      this.parent.insertBefore(this, cloned);
      return cloned;
    }
    error(message, opts = {}) {
      if (this.source) {
        let { end, start } = this.rangeBy(opts);
        return this.source.input.error(
          message,
          { column: start.column, line: start.line },
          { column: end.column, line: end.line },
          opts
        );
      }
      return new CssSyntaxError(message);
    }
    getProxyProcessor() {
      return {
        get(node2, prop) {
          if (prop === "proxyOf") {
            return node2;
          } else if (prop === "root") {
            return () => node2.root().toProxy();
          } else {
            return node2[prop];
          }
        },
        set(node2, prop, value) {
          if (node2[prop] === value) return true;
          node2[prop] = value;
          if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */
          prop === "text") {
            node2.markDirty();
          }
          return true;
        }
      };
    }
    markDirty() {
      if (this[isClean]) {
        this[isClean] = false;
        let next = this;
        while (next = next.parent) {
          next[isClean] = false;
        }
      }
    }
    next() {
      if (!this.parent) return void 0;
      let index2 = this.parent.index(this);
      return this.parent.nodes[index2 + 1];
    }
    positionBy(opts, stringRepresentation) {
      let pos = this.source.start;
      if (opts.index) {
        pos = this.positionInside(opts.index, stringRepresentation);
      } else if (opts.word) {
        stringRepresentation = this.toString();
        let index2 = stringRepresentation.indexOf(opts.word);
        if (index2 !== -1) pos = this.positionInside(index2, stringRepresentation);
      }
      return pos;
    }
    positionInside(index2, stringRepresentation) {
      let string = stringRepresentation || this.toString();
      let column = this.source.start.column;
      let line = this.source.start.line;
      for (let i2 = 0; i2 < index2; i2++) {
        if (string[i2] === "\n") {
          column = 1;
          line += 1;
        } else {
          column += 1;
        }
      }
      return { column, line };
    }
    prev() {
      if (!this.parent) return void 0;
      let index2 = this.parent.index(this);
      return this.parent.nodes[index2 - 1];
    }
    rangeBy(opts) {
      let start = {
        column: this.source.start.column,
        line: this.source.start.line
      };
      let end = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: start.column + 1,
        line: start.line
      };
      if (opts.word) {
        let stringRepresentation = this.toString();
        let index2 = stringRepresentation.indexOf(opts.word);
        if (index2 !== -1) {
          start = this.positionInside(index2, stringRepresentation);
          end = this.positionInside(index2 + opts.word.length, stringRepresentation);
        }
      } else {
        if (opts.start) {
          start = {
            column: opts.start.column,
            line: opts.start.line
          };
        } else if (opts.index) {
          start = this.positionInside(opts.index);
        }
        if (opts.end) {
          end = {
            column: opts.end.column,
            line: opts.end.line
          };
        } else if (typeof opts.endIndex === "number") {
          end = this.positionInside(opts.endIndex);
        } else if (opts.index) {
          end = this.positionInside(opts.index + 1);
        }
      }
      if (end.line < start.line || end.line === start.line && end.column <= start.column) {
        end = { column: start.column + 1, line: start.line };
      }
      return { end, start };
    }
    raw(prop, defaultType) {
      let str = new Stringifier();
      return str.raw(this, prop, defaultType);
    }
    remove() {
      if (this.parent) {
        this.parent.removeChild(this);
      }
      this.parent = void 0;
      return this;
    }
    replaceWith(...nodes) {
      if (this.parent) {
        let bookmark = this;
        let foundSelf = false;
        for (let node2 of nodes) {
          if (node2 === this) {
            foundSelf = true;
          } else if (foundSelf) {
            this.parent.insertAfter(bookmark, node2);
            bookmark = node2;
          } else {
            this.parent.insertBefore(bookmark, node2);
          }
        }
        if (!foundSelf) {
          this.remove();
        }
      }
      return this;
    }
    root() {
      let result2 = this;
      while (result2.parent && result2.parent.type !== "document") {
        result2 = result2.parent;
      }
      return result2;
    }
    toJSON(_, inputs) {
      let fixed = {};
      let emitInputs = inputs == null;
      inputs = inputs || /* @__PURE__ */ new Map();
      let inputsNextIndex = 0;
      for (let name in this) {
        if (!Object.prototype.hasOwnProperty.call(this, name)) {
          continue;
        }
        if (name === "parent" || name === "proxyCache") continue;
        let value = this[name];
        if (Array.isArray(value)) {
          fixed[name] = value.map((i2) => {
            if (typeof i2 === "object" && i2.toJSON) {
              return i2.toJSON(null, inputs);
            } else {
              return i2;
            }
          });
        } else if (typeof value === "object" && value.toJSON) {
          fixed[name] = value.toJSON(null, inputs);
        } else if (name === "source") {
          let inputId = inputs.get(value.input);
          if (inputId == null) {
            inputId = inputsNextIndex;
            inputs.set(value.input, inputsNextIndex);
            inputsNextIndex++;
          }
          fixed[name] = {
            end: value.end,
            inputId,
            start: value.start
          };
        } else {
          fixed[name] = value;
        }
      }
      if (emitInputs) {
        fixed.inputs = [...inputs.keys()].map((input2) => input2.toJSON());
      }
      return fixed;
    }
    toProxy() {
      if (!this.proxyCache) {
        this.proxyCache = new Proxy(this, this.getProxyProcessor());
      }
      return this.proxyCache;
    }
    toString(stringifier2 = stringify) {
      if (stringifier2.stringify) stringifier2 = stringifier2.stringify;
      let result2 = "";
      stringifier2(this, (i2) => {
        result2 += i2;
      });
      return result2;
    }
    warn(result2, text, opts) {
      let data = { node: this };
      for (let i2 in opts) data[i2] = opts[i2];
      return result2.warn(text, data);
    }
    get proxyOf() {
      return this;
    }
  }
  node = Node2;
  Node2.default = Node2;
  return node;
}
var declaration;
var hasRequiredDeclaration;
function requireDeclaration() {
  if (hasRequiredDeclaration) return declaration;
  hasRequiredDeclaration = 1;
  let Node2 = requireNode();
  class Declaration extends Node2 {
    constructor(defaults) {
      if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
        defaults = { ...defaults, value: String(defaults.value) };
      }
      super(defaults);
      this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  declaration = Declaration;
  Declaration.default = Declaration;
  return declaration;
}
var nonSecure;
var hasRequiredNonSecure;
function requireNonSecure() {
  if (hasRequiredNonSecure) return nonSecure;
  hasRequiredNonSecure = 1;
  let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  let customAlphabet = (alphabet, defaultSize = 21) => {
    return (size = defaultSize) => {
      let id = "";
      let i2 = size;
      while (i2--) {
        id += alphabet[Math.random() * alphabet.length | 0];
      }
      return id;
    };
  };
  let nanoid = (size = 21) => {
    let id = "";
    let i2 = size;
    while (i2--) {
      id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
  };
  nonSecure = { nanoid, customAlphabet };
  return nonSecure;
}
var previousMap;
var hasRequiredPreviousMap;
function requirePreviousMap() {
  if (hasRequiredPreviousMap) return previousMap;
  hasRequiredPreviousMap = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2;
  let { existsSync, readFileSync } = require$$2;
  let { dirname, join } = require$$2;
  function fromBase64(str) {
    if (Buffer) {
      return Buffer.from(str, "base64").toString();
    } else {
      return window.atob(str);
    }
  }
  class PreviousMap {
    constructor(css, opts) {
      if (opts.map === false) return;
      this.loadAnnotation(css);
      this.inline = this.startWith(this.annotation, "data:");
      let prev = opts.map ? opts.map.prev : void 0;
      let text = this.loadMap(opts.from, prev);
      if (!this.mapFile && opts.from) {
        this.mapFile = opts.from;
      }
      if (this.mapFile) this.root = dirname(this.mapFile);
      if (text) this.text = text;
    }
    consumer() {
      if (!this.consumerCache) {
        this.consumerCache = new SourceMapConsumer(this.text);
      }
      return this.consumerCache;
    }
    decodeInline(text) {
      let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
      let baseUri = /^data:application\/json;base64,/;
      let charsetUri = /^data:application\/json;charset=utf-?8,/;
      let uri = /^data:application\/json,/;
      if (charsetUri.test(text) || uri.test(text)) {
        return decodeURIComponent(text.substr(RegExp.lastMatch.length));
      }
      if (baseCharsetUri.test(text) || baseUri.test(text)) {
        return fromBase64(text.substr(RegExp.lastMatch.length));
      }
      let encoding = text.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + encoding);
    }
    getAnnotationURL(sourceMapString) {
      return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(map) {
      if (typeof map !== "object") return false;
      return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
    }
    loadAnnotation(css) {
      let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!comments) return;
      let start = css.lastIndexOf(comments.pop());
      let end = css.indexOf("*/", start);
      if (start > -1 && end > -1) {
        this.annotation = this.getAnnotationURL(css.substring(start, end));
      }
    }
    loadFile(path) {
      this.root = dirname(path);
      if (existsSync(path)) {
        this.mapFile = path;
        return readFileSync(path, "utf-8").toString().trim();
      }
    }
    loadMap(file, prev) {
      if (prev === false) return false;
      if (prev) {
        if (typeof prev === "string") {
          return prev;
        } else if (typeof prev === "function") {
          let prevPath = prev(file);
          if (prevPath) {
            let map = this.loadFile(prevPath);
            if (!map) {
              throw new Error(
                "Unable to load previous source map: " + prevPath.toString()
              );
            }
            return map;
          }
        } else if (prev instanceof SourceMapConsumer) {
          return SourceMapGenerator.fromSourceMap(prev).toString();
        } else if (prev instanceof SourceMapGenerator) {
          return prev.toString();
        } else if (this.isMap(prev)) {
          return JSON.stringify(prev);
        } else {
          throw new Error(
            "Unsupported previous source map format: " + prev.toString()
          );
        }
      } else if (this.inline) {
        return this.decodeInline(this.annotation);
      } else if (this.annotation) {
        let map = this.annotation;
        if (file) map = join(dirname(file), map);
        return this.loadFile(map);
      }
    }
    startWith(string, start) {
      if (!string) return false;
      return string.substr(0, start.length) === start;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  previousMap = PreviousMap;
  PreviousMap.default = PreviousMap;
  return previousMap;
}
var input;
var hasRequiredInput;
function requireInput() {
  if (hasRequiredInput) return input;
  hasRequiredInput = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2;
  let { fileURLToPath, pathToFileURL } = require$$2;
  let { isAbsolute, resolve } = require$$2;
  let { nanoid } = /* @__PURE__ */ requireNonSecure();
  let terminalHighlight = require$$2;
  let CssSyntaxError = requireCssSyntaxError();
  let PreviousMap = requirePreviousMap();
  let fromOffsetCache = Symbol("fromOffsetCache");
  let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
  let pathAvailable = Boolean(resolve && isAbsolute);
  class Input {
    constructor(css, opts = {}) {
      if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) {
        throw new Error(`PostCSS received ${css} instead of CSS string`);
      }
      this.css = css.toString();
      if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
        this.hasBOM = true;
        this.css = this.css.slice(1);
      } else {
        this.hasBOM = false;
      }
      if (opts.from) {
        if (!pathAvailable || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
          this.file = opts.from;
        } else {
          this.file = resolve(opts.from);
        }
      }
      if (pathAvailable && sourceMapAvailable) {
        let map = new PreviousMap(this.css, opts);
        if (map.text) {
          this.map = map;
          let file = map.consumer().file;
          if (!this.file && file) this.file = this.mapResolve(file);
        }
      }
      if (!this.file) {
        this.id = "<input css " + nanoid(6) + ">";
      }
      if (this.map) this.map.file = this.from;
    }
    error(message, line, column, opts = {}) {
      let result2, endLine, endColumn;
      if (line && typeof line === "object") {
        let start = line;
        let end = column;
        if (typeof start.offset === "number") {
          let pos = this.fromOffset(start.offset);
          line = pos.line;
          column = pos.col;
        } else {
          line = start.line;
          column = start.column;
        }
        if (typeof end.offset === "number") {
          let pos = this.fromOffset(end.offset);
          endLine = pos.line;
          endColumn = pos.col;
        } else {
          endLine = end.line;
          endColumn = end.column;
        }
      } else if (!column) {
        let pos = this.fromOffset(line);
        line = pos.line;
        column = pos.col;
      }
      let origin = this.origin(line, column, endLine, endColumn);
      if (origin) {
        result2 = new CssSyntaxError(
          message,
          origin.endLine === void 0 ? origin.line : { column: origin.column, line: origin.line },
          origin.endLine === void 0 ? origin.column : { column: origin.endColumn, line: origin.endLine },
          origin.source,
          origin.file,
          opts.plugin
        );
      } else {
        result2 = new CssSyntaxError(
          message,
          endLine === void 0 ? line : { column, line },
          endLine === void 0 ? column : { column: endColumn, line: endLine },
          this.css,
          this.file,
          opts.plugin
        );
      }
      result2.input = { column, endColumn, endLine, line, source: this.css };
      if (this.file) {
        if (pathToFileURL) {
          result2.input.url = pathToFileURL(this.file).toString();
        }
        result2.input.file = this.file;
      }
      return result2;
    }
    fromOffset(offset) {
      let lastLine, lineToIndex;
      if (!this[fromOffsetCache]) {
        let lines = this.css.split("\n");
        lineToIndex = new Array(lines.length);
        let prevIndex = 0;
        for (let i2 = 0, l2 = lines.length; i2 < l2; i2++) {
          lineToIndex[i2] = prevIndex;
          prevIndex += lines[i2].length + 1;
        }
        this[fromOffsetCache] = lineToIndex;
      } else {
        lineToIndex = this[fromOffsetCache];
      }
      lastLine = lineToIndex[lineToIndex.length - 1];
      let min = 0;
      if (offset >= lastLine) {
        min = lineToIndex.length - 1;
      } else {
        let max = lineToIndex.length - 2;
        let mid;
        while (min < max) {
          mid = min + (max - min >> 1);
          if (offset < lineToIndex[mid]) {
            max = mid - 1;
          } else if (offset >= lineToIndex[mid + 1]) {
            min = mid + 1;
          } else {
            min = mid;
            break;
          }
        }
      }
      return {
        col: offset - lineToIndex[min] + 1,
        line: min + 1
      };
    }
    mapResolve(file) {
      if (/^\w+:\/\//.test(file)) {
        return file;
      }
      return resolve(this.map.consumer().sourceRoot || this.map.root || ".", file);
    }
    origin(line, column, endLine, endColumn) {
      if (!this.map) return false;
      let consumer = this.map.consumer();
      let from = consumer.originalPositionFor({ column, line });
      if (!from.source) return false;
      let to;
      if (typeof endLine === "number") {
        to = consumer.originalPositionFor({ column: endColumn, line: endLine });
      }
      let fromUrl;
      if (isAbsolute(from.source)) {
        fromUrl = pathToFileURL(from.source);
      } else {
        fromUrl = new URL(
          from.source,
          this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
        );
      }
      let result2 = {
        column: from.column,
        endColumn: to && to.column,
        endLine: to && to.line,
        line: from.line,
        url: fromUrl.toString()
      };
      if (fromUrl.protocol === "file:") {
        if (fileURLToPath) {
          result2.file = fileURLToPath(fromUrl);
        } else {
          throw new Error(`file: protocol is not available in this PostCSS build`);
        }
      }
      let source = consumer.sourceContentFor(from.source);
      if (source) result2.source = source;
      return result2;
    }
    toJSON() {
      let json = {};
      for (let name of ["hasBOM", "css", "file", "id"]) {
        if (this[name] != null) {
          json[name] = this[name];
        }
      }
      if (this.map) {
        json.map = { ...this.map };
        if (json.map.consumerCache) {
          json.map.consumerCache = void 0;
        }
      }
      return json;
    }
    get from() {
      return this.file || this.id;
    }
  }
  input = Input;
  Input.default = Input;
  if (terminalHighlight && terminalHighlight.registerInput) {
    terminalHighlight.registerInput(Input);
  }
  return input;
}
var mapGenerator;
var hasRequiredMapGenerator;
function requireMapGenerator() {
  if (hasRequiredMapGenerator) return mapGenerator;
  hasRequiredMapGenerator = 1;
  let { SourceMapConsumer, SourceMapGenerator } = require$$2;
  let { dirname, relative, resolve, sep } = require$$2;
  let { pathToFileURL } = require$$2;
  let Input = requireInput();
  let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
  let pathAvailable = Boolean(dirname && resolve && relative && sep);
  class MapGenerator {
    constructor(stringify, root2, opts, cssString) {
      this.stringify = stringify;
      this.mapOpts = opts.map || {};
      this.root = root2;
      this.opts = opts;
      this.css = cssString;
      this.originalCSS = cssString;
      this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
      this.memoizedFileURLs = /* @__PURE__ */ new Map();
      this.memoizedPaths = /* @__PURE__ */ new Map();
      this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let content;
      if (this.isInline()) {
        content = "data:application/json;base64," + this.toBase64(this.map.toString());
      } else if (typeof this.mapOpts.annotation === "string") {
        content = this.mapOpts.annotation;
      } else if (typeof this.mapOpts.annotation === "function") {
        content = this.mapOpts.annotation(this.opts.to, this.root);
      } else {
        content = this.outputFile() + ".map";
      }
      let eol = "\n";
      if (this.css.includes("\r\n")) eol = "\r\n";
      this.css += eol + "/*# sourceMappingURL=" + content + " */";
    }
    applyPrevMaps() {
      for (let prev of this.previous()) {
        let from = this.toUrl(this.path(prev.file));
        let root2 = prev.root || dirname(prev.file);
        let map;
        if (this.mapOpts.sourcesContent === false) {
          map = new SourceMapConsumer(prev.text);
          if (map.sourcesContent) {
            map.sourcesContent = null;
          }
        } else {
          map = prev.consumer();
        }
        this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation === false) return;
      if (this.root) {
        let node2;
        for (let i2 = this.root.nodes.length - 1; i2 >= 0; i2--) {
          node2 = this.root.nodes[i2];
          if (node2.type !== "comment") continue;
          if (node2.text.indexOf("# sourceMappingURL=") === 0) {
            this.root.removeChild(i2);
          }
        }
      } else if (this.css) {
        this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
      }
    }
    generate() {
      this.clearAnnotation();
      if (pathAvailable && sourceMapAvailable && this.isMap()) {
        return this.generateMap();
      } else {
        let result2 = "";
        this.stringify(this.root, (i2) => {
          result2 += i2;
        });
        return [result2];
      }
    }
    generateMap() {
      if (this.root) {
        this.generateString();
      } else if (this.previous().length === 1) {
        let prev = this.previous()[0].consumer();
        prev.file = this.outputFile();
        this.map = SourceMapGenerator.fromSourceMap(prev, {
          ignoreInvalidMapping: true
        });
      } else {
        this.map = new SourceMapGenerator({
          file: this.outputFile(),
          ignoreInvalidMapping: true
        });
        this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      }
      if (this.isSourcesContent()) this.setSourcesContent();
      if (this.root && this.previous().length > 0) this.applyPrevMaps();
      if (this.isAnnotation()) this.addAnnotation();
      if (this.isInline()) {
        return [this.css];
      } else {
        return [this.css, this.map];
      }
    }
    generateString() {
      this.css = "";
      this.map = new SourceMapGenerator({
        file: this.outputFile(),
        ignoreInvalidMapping: true
      });
      let line = 1;
      let column = 1;
      let noSource = "<no source>";
      let mapping = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      };
      let lines, last;
      this.stringify(this.root, (str, node2, type) => {
        this.css += str;
        if (node2 && type !== "end") {
          mapping.generated.line = line;
          mapping.generated.column = column - 1;
          if (node2.source && node2.source.start) {
            mapping.source = this.sourcePath(node2);
            mapping.original.line = node2.source.start.line;
            mapping.original.column = node2.source.start.column - 1;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            this.map.addMapping(mapping);
          }
        }
        lines = str.match(/\n/g);
        if (lines) {
          line += lines.length;
          last = str.lastIndexOf("\n");
          column = str.length - last;
        } else {
          column += str.length;
        }
        if (node2 && type !== "start") {
          let p = node2.parent || { raws: {} };
          let childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
          if (!childless || node2 !== p.last || p.raws.semicolon) {
            if (node2.source && node2.source.end) {
              mapping.source = this.sourcePath(node2);
              mapping.original.line = node2.source.end.line;
              mapping.original.column = node2.source.end.column - 1;
              mapping.generated.line = line;
              mapping.generated.column = column - 2;
              this.map.addMapping(mapping);
            } else {
              mapping.source = noSource;
              mapping.original.line = 1;
              mapping.original.column = 0;
              mapping.generated.line = line;
              mapping.generated.column = column - 1;
              this.map.addMapping(mapping);
            }
          }
        }
      });
    }
    isAnnotation() {
      if (this.isInline()) {
        return true;
      }
      if (typeof this.mapOpts.annotation !== "undefined") {
        return this.mapOpts.annotation;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.annotation);
      }
      return true;
    }
    isInline() {
      if (typeof this.mapOpts.inline !== "undefined") {
        return this.mapOpts.inline;
      }
      let annotation = this.mapOpts.annotation;
      if (typeof annotation !== "undefined" && annotation !== true) {
        return false;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.inline);
      }
      return true;
    }
    isMap() {
      if (typeof this.opts.map !== "undefined") {
        return !!this.opts.map;
      }
      return this.previous().length > 0;
    }
    isSourcesContent() {
      if (typeof this.mapOpts.sourcesContent !== "undefined") {
        return this.mapOpts.sourcesContent;
      }
      if (this.previous().length) {
        return this.previous().some((i2) => i2.withContent());
      }
      return true;
    }
    outputFile() {
      if (this.opts.to) {
        return this.path(this.opts.to);
      } else if (this.opts.from) {
        return this.path(this.opts.from);
      } else {
        return "to.css";
      }
    }
    path(file) {
      if (this.mapOpts.absolute) return file;
      if (file.charCodeAt(0) === 60) return file;
      if (/^\w+:\/\//.test(file)) return file;
      let cached = this.memoizedPaths.get(file);
      if (cached) return cached;
      let from = this.opts.to ? dirname(this.opts.to) : ".";
      if (typeof this.mapOpts.annotation === "string") {
        from = dirname(resolve(from, this.mapOpts.annotation));
      }
      let path = relative(from, file);
      this.memoizedPaths.set(file, path);
      return path;
    }
    previous() {
      if (!this.previousMaps) {
        this.previousMaps = [];
        if (this.root) {
          this.root.walk((node2) => {
            if (node2.source && node2.source.input.map) {
              let map = node2.source.input.map;
              if (!this.previousMaps.includes(map)) {
                this.previousMaps.push(map);
              }
            }
          });
        } else {
          let input2 = new Input(this.originalCSS, this.opts);
          if (input2.map) this.previousMaps.push(input2.map);
        }
      }
      return this.previousMaps;
    }
    setSourcesContent() {
      let already = {};
      if (this.root) {
        this.root.walk((node2) => {
          if (node2.source) {
            let from = node2.source.input.from;
            if (from && !already[from]) {
              already[from] = true;
              let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
              this.map.setSourceContent(fromUrl, node2.source.input.css);
            }
          }
        });
      } else if (this.css) {
        let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(from, this.css);
      }
    }
    sourcePath(node2) {
      if (this.mapOpts.from) {
        return this.toUrl(this.mapOpts.from);
      } else if (this.usesFileUrls) {
        return this.toFileUrl(node2.source.input.from);
      } else {
        return this.toUrl(this.path(node2.source.input.from));
      }
    }
    toBase64(str) {
      if (Buffer) {
        return Buffer.from(str).toString("base64");
      } else {
        return window.btoa(unescape(encodeURIComponent(str)));
      }
    }
    toFileUrl(path) {
      let cached = this.memoizedFileURLs.get(path);
      if (cached) return cached;
      if (pathToFileURL) {
        let fileURL = pathToFileURL(path).toString();
        this.memoizedFileURLs.set(path, fileURL);
        return fileURL;
      } else {
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
      }
    }
    toUrl(path) {
      let cached = this.memoizedURLs.get(path);
      if (cached) return cached;
      if (sep === "\\") {
        path = path.replace(/\\/g, "/");
      }
      let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
      this.memoizedURLs.set(path, url);
      return url;
    }
  }
  mapGenerator = MapGenerator;
  return mapGenerator;
}
var comment;
var hasRequiredComment;
function requireComment() {
  if (hasRequiredComment) return comment;
  hasRequiredComment = 1;
  let Node2 = requireNode();
  class Comment extends Node2 {
    constructor(defaults) {
      super(defaults);
      this.type = "comment";
    }
  }
  comment = Comment;
  Comment.default = Comment;
  return comment;
}
var container;
var hasRequiredContainer;
function requireContainer() {
  if (hasRequiredContainer) return container;
  hasRequiredContainer = 1;
  let { isClean, my } = requireSymbols();
  let Declaration = requireDeclaration();
  let Comment = requireComment();
  let Node2 = requireNode();
  let parse, Rule, AtRule, Root;
  function cleanSource(nodes) {
    return nodes.map((i2) => {
      if (i2.nodes) i2.nodes = cleanSource(i2.nodes);
      delete i2.source;
      return i2;
    });
  }
  function markDirtyUp(node2) {
    node2[isClean] = false;
    if (node2.proxyOf.nodes) {
      for (let i2 of node2.proxyOf.nodes) {
        markDirtyUp(i2);
      }
    }
  }
  class Container extends Node2 {
    append(...children) {
      for (let child of children) {
        let nodes = this.normalize(child, this.last);
        for (let node2 of nodes) this.proxyOf.nodes.push(node2);
      }
      this.markDirty();
      return this;
    }
    cleanRaws(keepBetween) {
      super.cleanRaws(keepBetween);
      if (this.nodes) {
        for (let node2 of this.nodes) node2.cleanRaws(keepBetween);
      }
    }
    each(callback) {
      if (!this.proxyOf.nodes) return void 0;
      let iterator = this.getIterator();
      let index2, result2;
      while (this.indexes[iterator] < this.proxyOf.nodes.length) {
        index2 = this.indexes[iterator];
        result2 = callback(this.proxyOf.nodes[index2], index2);
        if (result2 === false) break;
        this.indexes[iterator] += 1;
      }
      delete this.indexes[iterator];
      return result2;
    }
    every(condition) {
      return this.nodes.every(condition);
    }
    getIterator() {
      if (!this.lastEach) this.lastEach = 0;
      if (!this.indexes) this.indexes = {};
      this.lastEach += 1;
      let iterator = this.lastEach;
      this.indexes[iterator] = 0;
      return iterator;
    }
    getProxyProcessor() {
      return {
        get(node2, prop) {
          if (prop === "proxyOf") {
            return node2;
          } else if (!node2[prop]) {
            return node2[prop];
          } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
            return (...args) => {
              return node2[prop](
                ...args.map((i2) => {
                  if (typeof i2 === "function") {
                    return (child, index2) => i2(child.toProxy(), index2);
                  } else {
                    return i2;
                  }
                })
              );
            };
          } else if (prop === "every" || prop === "some") {
            return (cb) => {
              return node2[prop](
                (child, ...other) => cb(child.toProxy(), ...other)
              );
            };
          } else if (prop === "root") {
            return () => node2.root().toProxy();
          } else if (prop === "nodes") {
            return node2.nodes.map((i2) => i2.toProxy());
          } else if (prop === "first" || prop === "last") {
            return node2[prop].toProxy();
          } else {
            return node2[prop];
          }
        },
        set(node2, prop, value) {
          if (node2[prop] === value) return true;
          node2[prop] = value;
          if (prop === "name" || prop === "params" || prop === "selector") {
            node2.markDirty();
          }
          return true;
        }
      };
    }
    index(child) {
      if (typeof child === "number") return child;
      if (child.proxyOf) child = child.proxyOf;
      return this.proxyOf.nodes.indexOf(child);
    }
    insertAfter(exist, add) {
      let existIndex = this.index(exist);
      let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
      existIndex = this.index(exist);
      for (let node2 of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (existIndex < index2) {
          this.indexes[id] = index2 + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    insertBefore(exist, add) {
      let existIndex = this.index(exist);
      let type = existIndex === 0 ? "prepend" : false;
      let nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
      existIndex = this.index(exist);
      for (let node2 of nodes) this.proxyOf.nodes.splice(existIndex, 0, node2);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (existIndex <= index2) {
          this.indexes[id] = index2 + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    normalize(nodes, sample) {
      if (typeof nodes === "string") {
        nodes = cleanSource(parse(nodes).nodes);
      } else if (typeof nodes === "undefined") {
        nodes = [];
      } else if (Array.isArray(nodes)) {
        nodes = nodes.slice(0);
        for (let i2 of nodes) {
          if (i2.parent) i2.parent.removeChild(i2, "ignore");
        }
      } else if (nodes.type === "root" && this.type !== "document") {
        nodes = nodes.nodes.slice(0);
        for (let i2 of nodes) {
          if (i2.parent) i2.parent.removeChild(i2, "ignore");
        }
      } else if (nodes.type) {
        nodes = [nodes];
      } else if (nodes.prop) {
        if (typeof nodes.value === "undefined") {
          throw new Error("Value field is missed in node creation");
        } else if (typeof nodes.value !== "string") {
          nodes.value = String(nodes.value);
        }
        nodes = [new Declaration(nodes)];
      } else if (nodes.selector) {
        nodes = [new Rule(nodes)];
      } else if (nodes.name) {
        nodes = [new AtRule(nodes)];
      } else if (nodes.text) {
        nodes = [new Comment(nodes)];
      } else {
        throw new Error("Unknown node type in node creation");
      }
      let processed = nodes.map((i2) => {
        if (!i2[my]) Container.rebuild(i2);
        i2 = i2.proxyOf;
        if (i2.parent) i2.parent.removeChild(i2);
        if (i2[isClean]) markDirtyUp(i2);
        if (typeof i2.raws.before === "undefined") {
          if (sample && typeof sample.raws.before !== "undefined") {
            i2.raws.before = sample.raws.before.replace(/\S/g, "");
          }
        }
        i2.parent = this.proxyOf;
        return i2;
      });
      return processed;
    }
    prepend(...children) {
      children = children.reverse();
      for (let child of children) {
        let nodes = this.normalize(child, this.first, "prepend").reverse();
        for (let node2 of nodes) this.proxyOf.nodes.unshift(node2);
        for (let id in this.indexes) {
          this.indexes[id] = this.indexes[id] + nodes.length;
        }
      }
      this.markDirty();
      return this;
    }
    push(child) {
      child.parent = this;
      this.proxyOf.nodes.push(child);
      return this;
    }
    removeAll() {
      for (let node2 of this.proxyOf.nodes) node2.parent = void 0;
      this.proxyOf.nodes = [];
      this.markDirty();
      return this;
    }
    removeChild(child) {
      child = this.index(child);
      this.proxyOf.nodes[child].parent = void 0;
      this.proxyOf.nodes.splice(child, 1);
      let index2;
      for (let id in this.indexes) {
        index2 = this.indexes[id];
        if (index2 >= child) {
          this.indexes[id] = index2 - 1;
        }
      }
      this.markDirty();
      return this;
    }
    replaceValues(pattern, opts, callback) {
      if (!callback) {
        callback = opts;
        opts = {};
      }
      this.walkDecls((decl) => {
        if (opts.props && !opts.props.includes(decl.prop)) return;
        if (opts.fast && !decl.value.includes(opts.fast)) return;
        decl.value = decl.value.replace(pattern, callback);
      });
      this.markDirty();
      return this;
    }
    some(condition) {
      return this.nodes.some(condition);
    }
    walk(callback) {
      return this.each((child, i2) => {
        let result2;
        try {
          result2 = callback(child, i2);
        } catch (e2) {
          throw child.addToError(e2);
        }
        if (result2 !== false && child.walk) {
          result2 = child.walk(callback);
        }
        return result2;
      });
    }
    walkAtRules(name, callback) {
      if (!callback) {
        callback = name;
        return this.walk((child, i2) => {
          if (child.type === "atrule") {
            return callback(child, i2);
          }
        });
      }
      if (name instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "atrule" && name.test(child.name)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "atrule" && child.name === name) {
          return callback(child, i2);
        }
      });
    }
    walkComments(callback) {
      return this.walk((child, i2) => {
        if (child.type === "comment") {
          return callback(child, i2);
        }
      });
    }
    walkDecls(prop, callback) {
      if (!callback) {
        callback = prop;
        return this.walk((child, i2) => {
          if (child.type === "decl") {
            return callback(child, i2);
          }
        });
      }
      if (prop instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "decl" && prop.test(child.prop)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "decl" && child.prop === prop) {
          return callback(child, i2);
        }
      });
    }
    walkRules(selector, callback) {
      if (!callback) {
        callback = selector;
        return this.walk((child, i2) => {
          if (child.type === "rule") {
            return callback(child, i2);
          }
        });
      }
      if (selector instanceof RegExp) {
        return this.walk((child, i2) => {
          if (child.type === "rule" && selector.test(child.selector)) {
            return callback(child, i2);
          }
        });
      }
      return this.walk((child, i2) => {
        if (child.type === "rule" && child.selector === selector) {
          return callback(child, i2);
        }
      });
    }
    get first() {
      if (!this.proxyOf.nodes) return void 0;
      return this.proxyOf.nodes[0];
    }
    get last() {
      if (!this.proxyOf.nodes) return void 0;
      return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  Container.registerParse = (dependant) => {
    parse = dependant;
  };
  Container.registerRule = (dependant) => {
    Rule = dependant;
  };
  Container.registerAtRule = (dependant) => {
    AtRule = dependant;
  };
  Container.registerRoot = (dependant) => {
    Root = dependant;
  };
  container = Container;
  Container.default = Container;
  Container.rebuild = (node2) => {
    if (node2.type === "atrule") {
      Object.setPrototypeOf(node2, AtRule.prototype);
    } else if (node2.type === "rule") {
      Object.setPrototypeOf(node2, Rule.prototype);
    } else if (node2.type === "decl") {
      Object.setPrototypeOf(node2, Declaration.prototype);
    } else if (node2.type === "comment") {
      Object.setPrototypeOf(node2, Comment.prototype);
    } else if (node2.type === "root") {
      Object.setPrototypeOf(node2, Root.prototype);
    }
    node2[my] = true;
    if (node2.nodes) {
      node2.nodes.forEach((child) => {
        Container.rebuild(child);
      });
    }
  };
  return container;
}
var document$1;
var hasRequiredDocument;
function requireDocument() {
  if (hasRequiredDocument) return document$1;
  hasRequiredDocument = 1;
  let Container = requireContainer();
  let LazyResult, Processor;
  class Document2 extends Container {
    constructor(defaults) {
      super({ type: "document", ...defaults });
      if (!this.nodes) {
        this.nodes = [];
      }
    }
    toResult(opts = {}) {
      let lazy = new LazyResult(new Processor(), this, opts);
      return lazy.stringify();
    }
  }
  Document2.registerLazyResult = (dependant) => {
    LazyResult = dependant;
  };
  Document2.registerProcessor = (dependant) => {
    Processor = dependant;
  };
  document$1 = Document2;
  Document2.default = Document2;
  return document$1;
}
var warnOnce;
var hasRequiredWarnOnce;
function requireWarnOnce() {
  if (hasRequiredWarnOnce) return warnOnce;
  hasRequiredWarnOnce = 1;
  let printed = {};
  warnOnce = function warnOnce2(message) {
    if (printed[message]) return;
    printed[message] = true;
    if (typeof console !== "undefined" && console.warn) {
      console.warn(message);
    }
  };
  return warnOnce;
}
var warning;
var hasRequiredWarning;
function requireWarning() {
  if (hasRequiredWarning) return warning;
  hasRequiredWarning = 1;
  class Warning {
    constructor(text, opts = {}) {
      this.type = "warning";
      this.text = text;
      if (opts.node && opts.node.source) {
        let range = opts.node.rangeBy(opts);
        this.line = range.start.line;
        this.column = range.start.column;
        this.endLine = range.end.line;
        this.endColumn = range.end.column;
      }
      for (let opt in opts) this[opt] = opts[opt];
    }
    toString() {
      if (this.node) {
        return this.node.error(this.text, {
          index: this.index,
          plugin: this.plugin,
          word: this.word
        }).message;
      }
      if (this.plugin) {
        return this.plugin + ": " + this.text;
      }
      return this.text;
    }
  }
  warning = Warning;
  Warning.default = Warning;
  return warning;
}
var result;
var hasRequiredResult;
function requireResult() {
  if (hasRequiredResult) return result;
  hasRequiredResult = 1;
  let Warning = requireWarning();
  class Result {
    constructor(processor2, root2, opts) {
      this.processor = processor2;
      this.messages = [];
      this.root = root2;
      this.opts = opts;
      this.css = void 0;
      this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(text, opts = {}) {
      if (!opts.plugin) {
        if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
          opts.plugin = this.lastPlugin.postcssPlugin;
        }
      }
      let warning2 = new Warning(text, opts);
      this.messages.push(warning2);
      return warning2;
    }
    warnings() {
      return this.messages.filter((i2) => i2.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  result = Result;
  Result.default = Result;
  return result;
}
var tokenize;
var hasRequiredTokenize;
function requireTokenize() {
  if (hasRequiredTokenize) return tokenize;
  hasRequiredTokenize = 1;
  const SINGLE_QUOTE = "'".charCodeAt(0);
  const DOUBLE_QUOTE = '"'.charCodeAt(0);
  const BACKSLASH = "\\".charCodeAt(0);
  const SLASH = "/".charCodeAt(0);
  const NEWLINE = "\n".charCodeAt(0);
  const SPACE = " ".charCodeAt(0);
  const FEED = "\f".charCodeAt(0);
  const TAB = "	".charCodeAt(0);
  const CR = "\r".charCodeAt(0);
  const OPEN_SQUARE = "[".charCodeAt(0);
  const CLOSE_SQUARE = "]".charCodeAt(0);
  const OPEN_PARENTHESES = "(".charCodeAt(0);
  const CLOSE_PARENTHESES = ")".charCodeAt(0);
  const OPEN_CURLY = "{".charCodeAt(0);
  const CLOSE_CURLY = "}".charCodeAt(0);
  const SEMICOLON = ";".charCodeAt(0);
  const ASTERISK = "*".charCodeAt(0);
  const COLON = ":".charCodeAt(0);
  const AT = "@".charCodeAt(0);
  const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
  const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
  const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
  const RE_HEX_ESCAPE = /[\da-f]/i;
  tokenize = function tokenizer(input2, options = {}) {
    let css = input2.css.valueOf();
    let ignore = options.ignoreErrors;
    let code, next, quote, content, escape;
    let escaped, escapePos, prev, n2, currentToken;
    let length = css.length;
    let pos = 0;
    let buffer = [];
    let returned = [];
    function position() {
      return pos;
    }
    function unclosed(what) {
      throw input2.error("Unclosed " + what, pos);
    }
    function endOfFile() {
      return returned.length === 0 && pos >= length;
    }
    function nextToken(opts) {
      if (returned.length) return returned.pop();
      if (pos >= length) return;
      let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
      code = css.charCodeAt(pos);
      switch (code) {
        case NEWLINE:
        case SPACE:
        case TAB:
        case CR:
        case FEED: {
          next = pos;
          do {
            next += 1;
            code = css.charCodeAt(next);
          } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
          currentToken = ["space", css.slice(pos, next)];
          pos = next - 1;
          break;
        }
        case OPEN_SQUARE:
        case CLOSE_SQUARE:
        case OPEN_CURLY:
        case CLOSE_CURLY:
        case COLON:
        case SEMICOLON:
        case CLOSE_PARENTHESES: {
          let controlChar = String.fromCharCode(code);
          currentToken = [controlChar, controlChar, pos];
          break;
        }
        case OPEN_PARENTHESES: {
          prev = buffer.length ? buffer.pop()[1] : "";
          n2 = css.charCodeAt(pos + 1);
          if (prev === "url" && n2 !== SINGLE_QUOTE && n2 !== DOUBLE_QUOTE && n2 !== SPACE && n2 !== NEWLINE && n2 !== TAB && n2 !== FEED && n2 !== CR) {
            next = pos;
            do {
              escaped = false;
              next = css.indexOf(")", next + 1);
              if (next === -1) {
                if (ignore || ignoreUnclosed) {
                  next = pos;
                  break;
                } else {
                  unclosed("bracket");
                }
              }
              escapePos = next;
              while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                escapePos -= 1;
                escaped = !escaped;
              }
            } while (escaped);
            currentToken = ["brackets", css.slice(pos, next + 1), pos, next];
            pos = next;
          } else {
            next = css.indexOf(")", pos + 1);
            content = css.slice(pos, next + 1);
            if (next === -1 || RE_BAD_BRACKET.test(content)) {
              currentToken = ["(", "(", pos];
            } else {
              currentToken = ["brackets", content, pos, next];
              pos = next;
            }
          }
          break;
        }
        case SINGLE_QUOTE:
        case DOUBLE_QUOTE: {
          quote = code === SINGLE_QUOTE ? "'" : '"';
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(quote, next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos + 1;
                break;
              } else {
                unclosed("string");
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped);
          currentToken = ["string", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        case AT: {
          RE_AT_END.lastIndex = pos + 1;
          RE_AT_END.test(css);
          if (RE_AT_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_AT_END.lastIndex - 2;
          }
          currentToken = ["at-word", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        case BACKSLASH: {
          next = pos;
          escape = true;
          while (css.charCodeAt(next + 1) === BACKSLASH) {
            next += 1;
            escape = !escape;
          }
          code = css.charCodeAt(next + 1);
          if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
            next += 1;
            if (RE_HEX_ESCAPE.test(css.charAt(next))) {
              while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
                next += 1;
              }
              if (css.charCodeAt(next + 1) === SPACE) {
                next += 1;
              }
            }
          }
          currentToken = ["word", css.slice(pos, next + 1), pos, next];
          pos = next;
          break;
        }
        default: {
          if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
            next = css.indexOf("*/", pos + 2) + 1;
            if (next === 0) {
              if (ignore || ignoreUnclosed) {
                next = css.length;
              } else {
                unclosed("comment");
              }
            }
            currentToken = ["comment", css.slice(pos, next + 1), pos, next];
            pos = next;
          } else {
            RE_WORD_END.lastIndex = pos + 1;
            RE_WORD_END.test(css);
            if (RE_WORD_END.lastIndex === 0) {
              next = css.length - 1;
            } else {
              next = RE_WORD_END.lastIndex - 2;
            }
            currentToken = ["word", css.slice(pos, next + 1), pos, next];
            buffer.push(currentToken);
            pos = next;
          }
          break;
        }
      }
      pos++;
      return currentToken;
    }
    function back(token) {
      returned.push(token);
    }
    return {
      back,
      endOfFile,
      nextToken,
      position
    };
  };
  return tokenize;
}
var atRule;
var hasRequiredAtRule;
function requireAtRule() {
  if (hasRequiredAtRule) return atRule;
  hasRequiredAtRule = 1;
  let Container = requireContainer();
  class AtRule extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "atrule";
    }
    append(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.append(...children);
    }
    prepend(...children) {
      if (!this.proxyOf.nodes) this.nodes = [];
      return super.prepend(...children);
    }
  }
  atRule = AtRule;
  AtRule.default = AtRule;
  Container.registerAtRule(AtRule);
  return atRule;
}
var root;
var hasRequiredRoot;
function requireRoot() {
  if (hasRequiredRoot) return root;
  hasRequiredRoot = 1;
  let Container = requireContainer();
  let LazyResult, Processor;
  class Root extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "root";
      if (!this.nodes) this.nodes = [];
    }
    normalize(child, sample, type) {
      let nodes = super.normalize(child);
      if (sample) {
        if (type === "prepend") {
          if (this.nodes.length > 1) {
            sample.raws.before = this.nodes[1].raws.before;
          } else {
            delete sample.raws.before;
          }
        } else if (this.first !== sample) {
          for (let node2 of nodes) {
            node2.raws.before = sample.raws.before;
          }
        }
      }
      return nodes;
    }
    removeChild(child, ignore) {
      let index2 = this.index(child);
      if (!ignore && index2 === 0 && this.nodes.length > 1) {
        this.nodes[1].raws.before = this.nodes[index2].raws.before;
      }
      return super.removeChild(child);
    }
    toResult(opts = {}) {
      let lazy = new LazyResult(new Processor(), this, opts);
      return lazy.stringify();
    }
  }
  Root.registerLazyResult = (dependant) => {
    LazyResult = dependant;
  };
  Root.registerProcessor = (dependant) => {
    Processor = dependant;
  };
  root = Root;
  Root.default = Root;
  Container.registerRoot(Root);
  return root;
}
var list_1;
var hasRequiredList;
function requireList() {
  if (hasRequiredList) return list_1;
  hasRequiredList = 1;
  let list = {
    comma(string) {
      return list.split(string, [","], true);
    },
    space(string) {
      let spaces = [" ", "\n", "	"];
      return list.split(string, spaces);
    },
    split(string, separators, last) {
      let array = [];
      let current = "";
      let split = false;
      let func = 0;
      let inQuote = false;
      let prevQuote = "";
      let escape = false;
      for (let letter of string) {
        if (escape) {
          escape = false;
        } else if (letter === "\\") {
          escape = true;
        } else if (inQuote) {
          if (letter === prevQuote) {
            inQuote = false;
          }
        } else if (letter === '"' || letter === "'") {
          inQuote = true;
          prevQuote = letter;
        } else if (letter === "(") {
          func += 1;
        } else if (letter === ")") {
          if (func > 0) func -= 1;
        } else if (func === 0) {
          if (separators.includes(letter)) split = true;
        }
        if (split) {
          if (current !== "") array.push(current.trim());
          current = "";
          split = false;
        } else {
          current += letter;
        }
      }
      if (last || current !== "") array.push(current.trim());
      return array;
    }
  };
  list_1 = list;
  list.default = list;
  return list_1;
}
var rule;
var hasRequiredRule;
function requireRule() {
  if (hasRequiredRule) return rule;
  hasRequiredRule = 1;
  let Container = requireContainer();
  let list = requireList();
  class Rule extends Container {
    constructor(defaults) {
      super(defaults);
      this.type = "rule";
      if (!this.nodes) this.nodes = [];
    }
    get selectors() {
      return list.comma(this.selector);
    }
    set selectors(values) {
      let match = this.selector ? this.selector.match(/,\s*/) : null;
      let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
      this.selector = values.join(sep);
    }
  }
  rule = Rule;
  Rule.default = Rule;
  Container.registerRule(Rule);
  return rule;
}
var parser;
var hasRequiredParser;
function requireParser() {
  if (hasRequiredParser) return parser;
  hasRequiredParser = 1;
  let Declaration = requireDeclaration();
  let tokenizer = requireTokenize();
  let Comment = requireComment();
  let AtRule = requireAtRule();
  let Root = requireRoot();
  let Rule = requireRule();
  const SAFE_COMMENT_NEIGHBOR = {
    empty: true,
    space: true
  };
  function findLastWithPosition(tokens) {
    for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
      let token = tokens[i2];
      let pos = token[3] || token[2];
      if (pos) return pos;
    }
  }
  class Parser {
    constructor(input2) {
      this.input = input2;
      this.root = new Root();
      this.current = this.root;
      this.spaces = "";
      this.semicolon = false;
      this.createTokenizer();
      this.root.source = { input: input2, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(token) {
      let node2 = new AtRule();
      node2.name = token[1].slice(1);
      if (node2.name === "") {
        this.unnamedAtrule(node2, token);
      }
      this.init(node2, token[2]);
      let type;
      let prev;
      let shift;
      let last = false;
      let open = false;
      let params = [];
      let brackets = [];
      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();
        type = token[0];
        if (type === "(" || type === "[") {
          brackets.push(type === "(" ? ")" : "]");
        } else if (type === "{" && brackets.length > 0) {
          brackets.push("}");
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
        }
        if (brackets.length === 0) {
          if (type === ";") {
            node2.source.end = this.getPosition(token[2]);
            node2.source.end.offset++;
            this.semicolon = true;
            break;
          } else if (type === "{") {
            open = true;
            break;
          } else if (type === "}") {
            if (params.length > 0) {
              shift = params.length - 1;
              prev = params[shift];
              while (prev && prev[0] === "space") {
                prev = params[--shift];
              }
              if (prev) {
                node2.source.end = this.getPosition(prev[3] || prev[2]);
                node2.source.end.offset++;
              }
            }
            this.end(token);
            break;
          } else {
            params.push(token);
          }
        } else {
          params.push(token);
        }
        if (this.tokenizer.endOfFile()) {
          last = true;
          break;
        }
      }
      node2.raws.between = this.spacesAndCommentsFromEnd(params);
      if (params.length) {
        node2.raws.afterName = this.spacesAndCommentsFromStart(params);
        this.raw(node2, "params", params);
        if (last) {
          token = params[params.length - 1];
          node2.source.end = this.getPosition(token[3] || token[2]);
          node2.source.end.offset++;
          this.spaces = node2.raws.between;
          node2.raws.between = "";
        }
      } else {
        node2.raws.afterName = "";
        node2.params = "";
      }
      if (open) {
        node2.nodes = [];
        this.current = node2;
      }
    }
    checkMissedSemicolon(tokens) {
      let colon = this.colon(tokens);
      if (colon === false) return;
      let founded = 0;
      let token;
      for (let j = colon - 1; j >= 0; j--) {
        token = tokens[j];
        if (token[0] !== "space") {
          founded += 1;
          if (founded === 2) break;
        }
      }
      throw this.input.error(
        "Missed semicolon",
        token[0] === "word" ? token[3] + 1 : token[2]
      );
    }
    colon(tokens) {
      let brackets = 0;
      let token, type, prev;
      for (let [i2, element] of tokens.entries()) {
        token = element;
        type = token[0];
        if (type === "(") {
          brackets += 1;
        }
        if (type === ")") {
          brackets -= 1;
        }
        if (brackets === 0 && type === ":") {
          if (!prev) {
            this.doubleColon(token);
          } else if (prev[0] === "word" && prev[1] === "progid") {
            continue;
          } else {
            return i2;
          }
        }
        prev = token;
      }
      return false;
    }
    comment(token) {
      let node2 = new Comment();
      this.init(node2, token[2]);
      node2.source.end = this.getPosition(token[3] || token[2]);
      node2.source.end.offset++;
      let text = token[1].slice(2, -2);
      if (/^\s*$/.test(text)) {
        node2.text = "";
        node2.raws.left = text;
        node2.raws.right = "";
      } else {
        let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
        node2.text = match[2];
        node2.raws.left = match[1];
        node2.raws.right = match[3];
      }
    }
    createTokenizer() {
      this.tokenizer = tokenizer(this.input);
    }
    decl(tokens, customProperty) {
      let node2 = new Declaration();
      this.init(node2, tokens[0][2]);
      let last = tokens[tokens.length - 1];
      if (last[0] === ";") {
        this.semicolon = true;
        tokens.pop();
      }
      node2.source.end = this.getPosition(
        last[3] || last[2] || findLastWithPosition(tokens)
      );
      node2.source.end.offset++;
      while (tokens[0][0] !== "word") {
        if (tokens.length === 1) this.unknownWord(tokens);
        node2.raws.before += tokens.shift()[1];
      }
      node2.source.start = this.getPosition(tokens[0][2]);
      node2.prop = "";
      while (tokens.length) {
        let type = tokens[0][0];
        if (type === ":" || type === "space" || type === "comment") {
          break;
        }
        node2.prop += tokens.shift()[1];
      }
      node2.raws.between = "";
      let token;
      while (tokens.length) {
        token = tokens.shift();
        if (token[0] === ":") {
          node2.raws.between += token[1];
          break;
        } else {
          if (token[0] === "word" && /\w/.test(token[1])) {
            this.unknownWord([token]);
          }
          node2.raws.between += token[1];
        }
      }
      if (node2.prop[0] === "_" || node2.prop[0] === "*") {
        node2.raws.before += node2.prop[0];
        node2.prop = node2.prop.slice(1);
      }
      let firstSpaces = [];
      let next;
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== "space" && next !== "comment") break;
        firstSpaces.push(tokens.shift());
      }
      this.precheckMissedSemicolon(tokens);
      for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
        token = tokens[i2];
        if (token[1].toLowerCase() === "!important") {
          node2.important = true;
          let string = this.stringFrom(tokens, i2);
          string = this.spacesFromEnd(tokens) + string;
          if (string !== " !important") node2.raws.important = string;
          break;
        } else if (token[1].toLowerCase() === "important") {
          let cache = tokens.slice(0);
          let str = "";
          for (let j = i2; j > 0; j--) {
            let type = cache[j][0];
            if (str.trim().indexOf("!") === 0 && type !== "space") {
              break;
            }
            str = cache.pop()[1] + str;
          }
          if (str.trim().indexOf("!") === 0) {
            node2.important = true;
            node2.raws.important = str;
            tokens = cache;
          }
        }
        if (token[0] !== "space" && token[0] !== "comment") {
          break;
        }
      }
      let hasWord = tokens.some((i2) => i2[0] !== "space" && i2[0] !== "comment");
      if (hasWord) {
        node2.raws.between += firstSpaces.map((i2) => i2[1]).join("");
        firstSpaces = [];
      }
      this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
      if (node2.value.includes(":") && !customProperty) {
        this.checkMissedSemicolon(tokens);
      }
    }
    doubleColon(token) {
      throw this.input.error(
        "Double colon",
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      );
    }
    emptyRule(token) {
      let node2 = new Rule();
      this.init(node2, token[2]);
      node2.selector = "";
      node2.raws.between = "";
      this.current = node2;
    }
    end(token) {
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.semicolon = false;
      this.current.raws.after = (this.current.raws.after || "") + this.spaces;
      this.spaces = "";
      if (this.current.parent) {
        this.current.source.end = this.getPosition(token[2]);
        this.current.source.end.offset++;
        this.current = this.current.parent;
      } else {
        this.unexpectedClose(token);
      }
    }
    endFile() {
      if (this.current.parent) this.unclosedBlock();
      if (this.current.nodes && this.current.nodes.length) {
        this.current.raws.semicolon = this.semicolon;
      }
      this.current.raws.after = (this.current.raws.after || "") + this.spaces;
      this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(token) {
      this.spaces += token[1];
      if (this.current.nodes) {
        let prev = this.current.nodes[this.current.nodes.length - 1];
        if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
          prev.raws.ownSemicolon = this.spaces;
          this.spaces = "";
        }
      }
    }
    // Helpers
    getPosition(offset) {
      let pos = this.input.fromOffset(offset);
      return {
        column: pos.col,
        line: pos.line,
        offset
      };
    }
    init(node2, offset) {
      this.current.push(node2);
      node2.source = {
        input: this.input,
        start: this.getPosition(offset)
      };
      node2.raws.before = this.spaces;
      this.spaces = "";
      if (node2.type !== "comment") this.semicolon = false;
    }
    other(start) {
      let end = false;
      let type = null;
      let colon = false;
      let bracket = null;
      let brackets = [];
      let customProperty = start[1].startsWith("--");
      let tokens = [];
      let token = start;
      while (token) {
        type = token[0];
        tokens.push(token);
        if (type === "(" || type === "[") {
          if (!bracket) bracket = token;
          brackets.push(type === "(" ? ")" : "]");
        } else if (customProperty && colon && type === "{") {
          if (!bracket) bracket = token;
          brackets.push("}");
        } else if (brackets.length === 0) {
          if (type === ";") {
            if (colon) {
              this.decl(tokens, customProperty);
              return;
            } else {
              break;
            }
          } else if (type === "{") {
            this.rule(tokens);
            return;
          } else if (type === "}") {
            this.tokenizer.back(tokens.pop());
            end = true;
            break;
          } else if (type === ":") {
            colon = true;
          }
        } else if (type === brackets[brackets.length - 1]) {
          brackets.pop();
          if (brackets.length === 0) bracket = null;
        }
        token = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile()) end = true;
      if (brackets.length > 0) this.unclosedBracket(bracket);
      if (end && colon) {
        if (!customProperty) {
          while (tokens.length) {
            token = tokens[tokens.length - 1][0];
            if (token !== "space" && token !== "comment") break;
            this.tokenizer.back(tokens.pop());
          }
        }
        this.decl(tokens, customProperty);
      } else {
        this.unknownWord(tokens);
      }
    }
    parse() {
      let token;
      while (!this.tokenizer.endOfFile()) {
        token = this.tokenizer.nextToken();
        switch (token[0]) {
          case "space":
            this.spaces += token[1];
            break;
          case ";":
            this.freeSemicolon(token);
            break;
          case "}":
            this.end(token);
            break;
          case "comment":
            this.comment(token);
            break;
          case "at-word":
            this.atrule(token);
            break;
          case "{":
            this.emptyRule(token);
            break;
          default:
            this.other(token);
            break;
        }
      }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(node2, prop, tokens, customProperty) {
      let token, type;
      let length = tokens.length;
      let value = "";
      let clean = true;
      let next, prev;
      for (let i2 = 0; i2 < length; i2 += 1) {
        token = tokens[i2];
        type = token[0];
        if (type === "space" && i2 === length - 1 && !customProperty) {
          clean = false;
        } else if (type === "comment") {
          prev = tokens[i2 - 1] ? tokens[i2 - 1][0] : "empty";
          next = tokens[i2 + 1] ? tokens[i2 + 1][0] : "empty";
          if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
            if (value.slice(-1) === ",") {
              clean = false;
            } else {
              value += token[1];
            }
          } else {
            clean = false;
          }
        } else {
          value += token[1];
        }
      }
      if (!clean) {
        let raw = tokens.reduce((all, i2) => all + i2[1], "");
        node2.raws[prop] = { raw, value };
      }
      node2[prop] = value;
    }
    rule(tokens) {
      tokens.pop();
      let node2 = new Rule();
      this.init(node2, tokens[0][2]);
      node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
      this.raw(node2, "selector", tokens);
      this.current = node2;
    }
    spacesAndCommentsFromEnd(tokens) {
      let lastTokenType;
      let spaces = "";
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== "space" && lastTokenType !== "comment") break;
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces;
    }
    // Errors
    spacesAndCommentsFromStart(tokens) {
      let next;
      let spaces = "";
      while (tokens.length) {
        next = tokens[0][0];
        if (next !== "space" && next !== "comment") break;
        spaces += tokens.shift()[1];
      }
      return spaces;
    }
    spacesFromEnd(tokens) {
      let lastTokenType;
      let spaces = "";
      while (tokens.length) {
        lastTokenType = tokens[tokens.length - 1][0];
        if (lastTokenType !== "space") break;
        spaces = tokens.pop()[1] + spaces;
      }
      return spaces;
    }
    stringFrom(tokens, from) {
      let result2 = "";
      for (let i2 = from; i2 < tokens.length; i2++) {
        result2 += tokens[i2][1];
      }
      tokens.splice(from, tokens.length - from);
      return result2;
    }
    unclosedBlock() {
      let pos = this.current.source.start;
      throw this.input.error("Unclosed block", pos.line, pos.column);
    }
    unclosedBracket(bracket) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: bracket[2] },
        { offset: bracket[2] + 1 }
      );
    }
    unexpectedClose(token) {
      throw this.input.error(
        "Unexpected }",
        { offset: token[2] },
        { offset: token[2] + 1 }
      );
    }
    unknownWord(tokens) {
      throw this.input.error(
        "Unknown word",
        { offset: tokens[0][2] },
        { offset: tokens[0][2] + tokens[0][1].length }
      );
    }
    unnamedAtrule(node2, token) {
      throw this.input.error(
        "At-rule without name",
        { offset: token[2] },
        { offset: token[2] + token[1].length }
      );
    }
  }
  parser = Parser;
  return parser;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse_1;
  hasRequiredParse = 1;
  let Container = requireContainer();
  let Parser = requireParser();
  let Input = requireInput();
  function parse(css, opts) {
    let input2 = new Input(css, opts);
    let parser2 = new Parser(input2);
    try {
      parser2.parse();
    } catch (e2) {
      if (process.env.NODE_ENV !== "production") {
        if (e2.name === "CssSyntaxError" && opts && opts.from) {
          if (/\.scss$/i.test(opts.from)) {
            e2.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
          } else if (/\.sass/i.test(opts.from)) {
            e2.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
          } else if (/\.less$/i.test(opts.from)) {
            e2.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
          }
        }
      }
      throw e2;
    }
    return parser2.root;
  }
  parse_1 = parse;
  parse.default = parse;
  Container.registerParse(parse);
  return parse_1;
}
var lazyResult;
var hasRequiredLazyResult;
function requireLazyResult() {
  if (hasRequiredLazyResult) return lazyResult;
  hasRequiredLazyResult = 1;
  let { isClean, my } = requireSymbols();
  let MapGenerator = requireMapGenerator();
  let stringify = requireStringify();
  let Container = requireContainer();
  let Document2 = requireDocument();
  let warnOnce2 = requireWarnOnce();
  let Result = requireResult();
  let parse = requireParse();
  let Root = requireRoot();
  const TYPE_TO_CLASS_NAME = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  };
  const PLUGIN_PROPS = {
    AtRule: true,
    AtRuleExit: true,
    Comment: true,
    CommentExit: true,
    Declaration: true,
    DeclarationExit: true,
    Document: true,
    DocumentExit: true,
    Once: true,
    OnceExit: true,
    postcssPlugin: true,
    prepare: true,
    Root: true,
    RootExit: true,
    Rule: true,
    RuleExit: true
  };
  const NOT_VISITORS = {
    Once: true,
    postcssPlugin: true,
    prepare: true
  };
  const CHILDREN = 0;
  function isPromise(obj) {
    return typeof obj === "object" && typeof obj.then === "function";
  }
  function getEvents(node2) {
    let key = false;
    let type = TYPE_TO_CLASS_NAME[node2.type];
    if (node2.type === "decl") {
      key = node2.prop.toLowerCase();
    } else if (node2.type === "atrule") {
      key = node2.name.toLowerCase();
    }
    if (key && node2.append) {
      return [
        type,
        type + "-" + key,
        CHILDREN,
        type + "Exit",
        type + "Exit-" + key
      ];
    } else if (key) {
      return [type, type + "-" + key, type + "Exit", type + "Exit-" + key];
    } else if (node2.append) {
      return [type, CHILDREN, type + "Exit"];
    } else {
      return [type, type + "Exit"];
    }
  }
  function toStack(node2) {
    let events;
    if (node2.type === "document") {
      events = ["Document", CHILDREN, "DocumentExit"];
    } else if (node2.type === "root") {
      events = ["Root", CHILDREN, "RootExit"];
    } else {
      events = getEvents(node2);
    }
    return {
      eventIndex: 0,
      events,
      iterator: 0,
      node: node2,
      visitorIndex: 0,
      visitors: []
    };
  }
  function cleanMarks(node2) {
    node2[isClean] = false;
    if (node2.nodes) node2.nodes.forEach((i2) => cleanMarks(i2));
    return node2;
  }
  let postcss2 = {};
  class LazyResult {
    constructor(processor2, css, opts) {
      this.stringified = false;
      this.processed = false;
      let root2;
      if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) {
        root2 = cleanMarks(css);
      } else if (css instanceof LazyResult || css instanceof Result) {
        root2 = cleanMarks(css.root);
        if (css.map) {
          if (typeof opts.map === "undefined") opts.map = {};
          if (!opts.map.inline) opts.map.inline = false;
          opts.map.prev = css.map;
        }
      } else {
        let parser2 = parse;
        if (opts.syntax) parser2 = opts.syntax.parse;
        if (opts.parser) parser2 = opts.parser;
        if (parser2.parse) parser2 = parser2.parse;
        try {
          root2 = parser2(css, opts);
        } catch (error) {
          this.processed = true;
          this.error = error;
        }
        if (root2 && !root2[my]) {
          Container.rebuild(root2);
        }
      }
      this.result = new Result(processor2, root2, opts);
      this.helpers = { ...postcss2, postcss: postcss2, result: this.result };
      this.plugins = this.processor.plugins.map((plugin) => {
        if (typeof plugin === "object" && plugin.prepare) {
          return { ...plugin, ...plugin.prepare(this.result) };
        } else {
          return plugin;
        }
      });
    }
    async() {
      if (this.error) return Promise.reject(this.error);
      if (this.processed) return Promise.resolve(this.result);
      if (!this.processing) {
        this.processing = this.runAsync();
      }
      return this.processing;
    }
    catch(onRejected) {
      return this.async().catch(onRejected);
    }
    finally(onFinally) {
      return this.async().then(onFinally, onFinally);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(error, node2) {
      let plugin = this.result.lastPlugin;
      try {
        if (node2) node2.addToError(error);
        this.error = error;
        if (error.name === "CssSyntaxError" && !error.plugin) {
          error.plugin = plugin.postcssPlugin;
          error.setMessage();
        } else if (plugin.postcssVersion) {
          if (process.env.NODE_ENV !== "production") {
            let pluginName = plugin.postcssPlugin;
            let pluginVer = plugin.postcssVersion;
            let runtimeVer = this.result.processor.version;
            let a2 = pluginVer.split(".");
            let b = runtimeVer.split(".");
            if (a2[0] !== b[0] || parseInt(a2[1]) > parseInt(b[1])) {
              console.error(
                "Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below."
              );
            }
          }
        }
      } catch (err) {
        if (console && console.error) console.error(err);
      }
      return error;
    }
    prepareVisitors() {
      this.listeners = {};
      let add = (plugin, type, cb) => {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push([plugin, cb]);
      };
      for (let plugin of this.plugins) {
        if (typeof plugin === "object") {
          for (let event in plugin) {
            if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
              throw new Error(
                `Unknown event ${event} in ${plugin.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            }
            if (!NOT_VISITORS[event]) {
              if (typeof plugin[event] === "object") {
                for (let filter in plugin[event]) {
                  if (filter === "*") {
                    add(plugin, event, plugin[event][filter]);
                  } else {
                    add(
                      plugin,
                      event + "-" + filter.toLowerCase(),
                      plugin[event][filter]
                    );
                  }
                }
              } else if (typeof plugin[event] === "function") {
                add(plugin, event, plugin[event]);
              }
            }
          }
        }
      }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let i2 = 0; i2 < this.plugins.length; i2++) {
        let plugin = this.plugins[i2];
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          try {
            await promise;
          } catch (error) {
            throw this.handleError(error);
          }
        }
      }
      this.prepareVisitors();
      if (this.hasListener) {
        let root2 = this.result.root;
        while (!root2[isClean]) {
          root2[isClean] = true;
          let stack = [toStack(root2)];
          while (stack.length > 0) {
            let promise = this.visitTick(stack);
            if (isPromise(promise)) {
              try {
                await promise;
              } catch (e2) {
                let node2 = stack[stack.length - 1].node;
                throw this.handleError(e2, node2);
              }
            }
          }
        }
        if (this.listeners.OnceExit) {
          for (let [plugin, visitor] of this.listeners.OnceExit) {
            this.result.lastPlugin = plugin;
            try {
              if (root2.type === "document") {
                let roots = root2.nodes.map(
                  (subRoot) => visitor(subRoot, this.helpers)
                );
                await Promise.all(roots);
              } else {
                await visitor(root2, this.helpers);
              }
            } catch (e2) {
              throw this.handleError(e2);
            }
          }
        }
      }
      this.processed = true;
      return this.stringify();
    }
    runOnRoot(plugin) {
      this.result.lastPlugin = plugin;
      try {
        if (typeof plugin === "object" && plugin.Once) {
          if (this.result.root.type === "document") {
            let roots = this.result.root.nodes.map(
              (root2) => plugin.Once(root2, this.helpers)
            );
            if (isPromise(roots[0])) {
              return Promise.all(roots);
            }
            return roots;
          }
          return plugin.Once(this.result.root, this.helpers);
        } else if (typeof plugin === "function") {
          return plugin(this.result.root, this.result);
        }
      } catch (error) {
        throw this.handleError(error);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = true;
      this.sync();
      let opts = this.result.opts;
      let str = stringify;
      if (opts.syntax) str = opts.syntax.stringify;
      if (opts.stringifier) str = opts.stringifier;
      if (str.stringify) str = str.stringify;
      let map = new MapGenerator(str, this.result.root, this.result.opts);
      let data = map.generate();
      this.result.css = data[0];
      this.result.map = data[1];
      return this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      this.processed = true;
      if (this.processing) {
        throw this.getAsyncError();
      }
      for (let plugin of this.plugins) {
        let promise = this.runOnRoot(plugin);
        if (isPromise(promise)) {
          throw this.getAsyncError();
        }
      }
      this.prepareVisitors();
      if (this.hasListener) {
        let root2 = this.result.root;
        while (!root2[isClean]) {
          root2[isClean] = true;
          this.walkSync(root2);
        }
        if (this.listeners.OnceExit) {
          if (root2.type === "document") {
            for (let subRoot of root2.nodes) {
              this.visitSync(this.listeners.OnceExit, subRoot);
            }
          } else {
            this.visitSync(this.listeners.OnceExit, root2);
          }
        }
      }
      return this.result;
    }
    then(onFulfilled, onRejected) {
      if (process.env.NODE_ENV !== "production") {
        if (!("from" in this.opts)) {
          warnOnce2(
            "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
          );
        }
      }
      return this.async().then(onFulfilled, onRejected);
    }
    toString() {
      return this.css;
    }
    visitSync(visitors, node2) {
      for (let [plugin, visitor] of visitors) {
        this.result.lastPlugin = plugin;
        let promise;
        try {
          promise = visitor(node2, this.helpers);
        } catch (e2) {
          throw this.handleError(e2, node2.proxyOf);
        }
        if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
          return true;
        }
        if (isPromise(promise)) {
          throw this.getAsyncError();
        }
      }
    }
    visitTick(stack) {
      let visit2 = stack[stack.length - 1];
      let { node: node2, visitors } = visit2;
      if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
        stack.pop();
        return;
      }
      if (visitors.length > 0 && visit2.visitorIndex < visitors.length) {
        let [plugin, visitor] = visitors[visit2.visitorIndex];
        visit2.visitorIndex += 1;
        if (visit2.visitorIndex === visitors.length) {
          visit2.visitors = [];
          visit2.visitorIndex = 0;
        }
        this.result.lastPlugin = plugin;
        try {
          return visitor(node2.toProxy(), this.helpers);
        } catch (e2) {
          throw this.handleError(e2, node2);
        }
      }
      if (visit2.iterator !== 0) {
        let iterator = visit2.iterator;
        let child;
        while (child = node2.nodes[node2.indexes[iterator]]) {
          node2.indexes[iterator] += 1;
          if (!child[isClean]) {
            child[isClean] = true;
            stack.push(toStack(child));
            return;
          }
        }
        visit2.iterator = 0;
        delete node2.indexes[iterator];
      }
      let events = visit2.events;
      while (visit2.eventIndex < events.length) {
        let event = events[visit2.eventIndex];
        visit2.eventIndex += 1;
        if (event === CHILDREN) {
          if (node2.nodes && node2.nodes.length) {
            node2[isClean] = true;
            visit2.iterator = node2.getIterator();
          }
          return;
        } else if (this.listeners[event]) {
          visit2.visitors = this.listeners[event];
          return;
        }
      }
      stack.pop();
    }
    walkSync(node2) {
      node2[isClean] = true;
      let events = getEvents(node2);
      for (let event of events) {
        if (event === CHILDREN) {
          if (node2.nodes) {
            node2.each((child) => {
              if (!child[isClean]) this.walkSync(child);
            });
          }
        } else {
          let visitors = this.listeners[event];
          if (visitors) {
            if (this.visitSync(visitors, node2.toProxy())) return;
          }
        }
      }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  LazyResult.registerPostcss = (dependant) => {
    postcss2 = dependant;
  };
  lazyResult = LazyResult;
  LazyResult.default = LazyResult;
  Root.registerLazyResult(LazyResult);
  Document2.registerLazyResult(LazyResult);
  return lazyResult;
}
var noWorkResult;
var hasRequiredNoWorkResult;
function requireNoWorkResult() {
  if (hasRequiredNoWorkResult) return noWorkResult;
  hasRequiredNoWorkResult = 1;
  let MapGenerator = requireMapGenerator();
  let stringify = requireStringify();
  let warnOnce2 = requireWarnOnce();
  let parse = requireParse();
  const Result = requireResult();
  class NoWorkResult {
    constructor(processor2, css, opts) {
      css = css.toString();
      this.stringified = false;
      this._processor = processor2;
      this._css = css;
      this._opts = opts;
      this._map = void 0;
      let root2;
      let str = stringify;
      this.result = new Result(this._processor, root2, this._opts);
      this.result.css = css;
      let self2 = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return self2.root;
        }
      });
      let map = new MapGenerator(str, root2, this._opts, css);
      if (map.isMap()) {
        let [generatedCSS, generatedMap] = map.generate();
        if (generatedCSS) {
          this.result.css = generatedCSS;
        }
        if (generatedMap) {
          this.result.map = generatedMap;
        }
      } else {
        map.clearAnnotation();
        this.result.css = map.css;
      }
    }
    async() {
      if (this.error) return Promise.reject(this.error);
      return Promise.resolve(this.result);
    }
    catch(onRejected) {
      return this.async().catch(onRejected);
    }
    finally(onFinally) {
      return this.async().then(onFinally, onFinally);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(onFulfilled, onRejected) {
      if (process.env.NODE_ENV !== "production") {
        if (!("from" in this._opts)) {
          warnOnce2(
            "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
          );
        }
      }
      return this.async().then(onFulfilled, onRejected);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root) {
        return this._root;
      }
      let root2;
      let parser2 = parse;
      try {
        root2 = parser2(this._css, this._opts);
      } catch (error) {
        this.error = error;
      }
      if (this.error) {
        throw this.error;
      } else {
        this._root = root2;
        return root2;
      }
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  noWorkResult = NoWorkResult;
  NoWorkResult.default = NoWorkResult;
  return noWorkResult;
}
var processor;
var hasRequiredProcessor;
function requireProcessor() {
  if (hasRequiredProcessor) return processor;
  hasRequiredProcessor = 1;
  let NoWorkResult = requireNoWorkResult();
  let LazyResult = requireLazyResult();
  let Document2 = requireDocument();
  let Root = requireRoot();
  class Processor {
    constructor(plugins = []) {
      this.version = "8.4.38";
      this.plugins = this.normalize(plugins);
    }
    normalize(plugins) {
      let normalized = [];
      for (let i2 of plugins) {
        if (i2.postcss === true) {
          i2 = i2();
        } else if (i2.postcss) {
          i2 = i2.postcss;
        }
        if (typeof i2 === "object" && Array.isArray(i2.plugins)) {
          normalized = normalized.concat(i2.plugins);
        } else if (typeof i2 === "object" && i2.postcssPlugin) {
          normalized.push(i2);
        } else if (typeof i2 === "function") {
          normalized.push(i2);
        } else if (typeof i2 === "object" && (i2.parse || i2.stringify)) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
          }
        } else {
          throw new Error(i2 + " is not a PostCSS plugin");
        }
      }
      return normalized;
    }
    process(css, opts = {}) {
      if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
        return new NoWorkResult(this, css, opts);
      } else {
        return new LazyResult(this, css, opts);
      }
    }
    use(plugin) {
      this.plugins = this.plugins.concat(this.normalize([plugin]));
      return this;
    }
  }
  processor = Processor;
  Processor.default = Processor;
  Root.registerProcessor(Processor);
  Document2.registerProcessor(Processor);
  return processor;
}
var fromJSON_1;
var hasRequiredFromJSON;
function requireFromJSON() {
  if (hasRequiredFromJSON) return fromJSON_1;
  hasRequiredFromJSON = 1;
  let Declaration = requireDeclaration();
  let PreviousMap = requirePreviousMap();
  let Comment = requireComment();
  let AtRule = requireAtRule();
  let Input = requireInput();
  let Root = requireRoot();
  let Rule = requireRule();
  function fromJSON(json, inputs) {
    if (Array.isArray(json)) return json.map((n2) => fromJSON(n2));
    let { inputs: ownInputs, ...defaults } = json;
    if (ownInputs) {
      inputs = [];
      for (let input2 of ownInputs) {
        let inputHydrated = { ...input2, __proto__: Input.prototype };
        if (inputHydrated.map) {
          inputHydrated.map = {
            ...inputHydrated.map,
            __proto__: PreviousMap.prototype
          };
        }
        inputs.push(inputHydrated);
      }
    }
    if (defaults.nodes) {
      defaults.nodes = json.nodes.map((n2) => fromJSON(n2, inputs));
    }
    if (defaults.source) {
      let { inputId, ...source } = defaults.source;
      defaults.source = source;
      if (inputId != null) {
        defaults.source.input = inputs[inputId];
      }
    }
    if (defaults.type === "root") {
      return new Root(defaults);
    } else if (defaults.type === "decl") {
      return new Declaration(defaults);
    } else if (defaults.type === "rule") {
      return new Rule(defaults);
    } else if (defaults.type === "comment") {
      return new Comment(defaults);
    } else if (defaults.type === "atrule") {
      return new AtRule(defaults);
    } else {
      throw new Error("Unknown node type: " + json.type);
    }
  }
  fromJSON_1 = fromJSON;
  fromJSON.default = fromJSON;
  return fromJSON_1;
}
var postcss_1;
var hasRequiredPostcss;
function requirePostcss() {
  if (hasRequiredPostcss) return postcss_1;
  hasRequiredPostcss = 1;
  let CssSyntaxError = requireCssSyntaxError();
  let Declaration = requireDeclaration();
  let LazyResult = requireLazyResult();
  let Container = requireContainer();
  let Processor = requireProcessor();
  let stringify = requireStringify();
  let fromJSON = requireFromJSON();
  let Document2 = requireDocument();
  let Warning = requireWarning();
  let Comment = requireComment();
  let AtRule = requireAtRule();
  let Result = requireResult();
  let Input = requireInput();
  let parse = requireParse();
  let list = requireList();
  let Rule = requireRule();
  let Root = requireRoot();
  let Node2 = requireNode();
  function postcss2(...plugins) {
    if (plugins.length === 1 && Array.isArray(plugins[0])) {
      plugins = plugins[0];
    }
    return new Processor(plugins);
  }
  postcss2.plugin = function plugin(name, initializer) {
    let warningPrinted = false;
    function creator(...args) {
      if (console && console.warn && !warningPrinted) {
        warningPrinted = true;
        console.warn(
          name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration"
        );
        if (process.env.LANG && process.env.LANG.startsWith("cn")) {
          console.warn(
            name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226"
          );
        }
      }
      let transformer = initializer(...args);
      transformer.postcssPlugin = name;
      transformer.postcssVersion = new Processor().version;
      return transformer;
    }
    let cache;
    Object.defineProperty(creator, "postcss", {
      get() {
        if (!cache) cache = creator();
        return cache;
      }
    });
    creator.process = function(css, processOpts, pluginOpts) {
      return postcss2([creator(pluginOpts)]).process(css, processOpts);
    };
    return creator;
  };
  postcss2.stringify = stringify;
  postcss2.parse = parse;
  postcss2.fromJSON = fromJSON;
  postcss2.list = list;
  postcss2.comment = (defaults) => new Comment(defaults);
  postcss2.atRule = (defaults) => new AtRule(defaults);
  postcss2.decl = (defaults) => new Declaration(defaults);
  postcss2.rule = (defaults) => new Rule(defaults);
  postcss2.root = (defaults) => new Root(defaults);
  postcss2.document = (defaults) => new Document2(defaults);
  postcss2.CssSyntaxError = CssSyntaxError;
  postcss2.Declaration = Declaration;
  postcss2.Container = Container;
  postcss2.Processor = Processor;
  postcss2.Document = Document2;
  postcss2.Comment = Comment;
  postcss2.Warning = Warning;
  postcss2.AtRule = AtRule;
  postcss2.Result = Result;
  postcss2.Input = Input;
  postcss2.Rule = Rule;
  postcss2.Root = Root;
  postcss2.Node = Node2;
  LazyResult.registerPostcss(postcss2);
  postcss_1 = postcss2;
  postcss2.default = postcss2;
  return postcss_1;
}
var postcssExports = requirePostcss();
const postcss = /* @__PURE__ */ getDefaultExportFromCjs(postcssExports);
postcss.stringify;
postcss.fromJSON;
postcss.plugin;
postcss.parse;
postcss.list;
postcss.document;
postcss.comment;
postcss.atRule;
postcss.rule;
postcss.decl;
postcss.root;
postcss.CssSyntaxError;
postcss.Declaration;
postcss.Container;
postcss.Processor;
postcss.Document;
postcss.Comment;
postcss.Warning;
postcss.AtRule;
postcss.Result;
postcss.Input;
postcss.Rule;
postcss.Root;
postcss.Node;
var NodeType$1 = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
  return NodeType2;
})(NodeType$1 || {});
function parseCSSText(cssText) {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g;
  const propertyDelimiter = /:(.+)/;
  const comment2 = /\/\*.*?\*\//g;
  cssText.replace(comment2, "").split(listDelimiter).forEach(function(item) {
    if (item) {
      const tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[camelize(tmp[0].trim())] = tmp[1].trim());
    }
  });
  return res;
}
function toCSSText(style) {
  const properties = [];
  for (const name in style) {
    const value = style[name];
    if (typeof value !== "string") continue;
    const normalizedName = hyphenate(name);
    properties.push(`${normalizedName}: ${value};`);
  }
  return properties.join(" ");
}
const camelizeRE = /-([a-z])/g;
const CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9-]+$/;
const camelize = (str) => {
  if (CUSTOM_PROPERTY_REGEX.test(str)) return str;
  return str.replace(camelizeRE, (_, c2) => c2 ? c2.toUpperCase() : "");
};
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
};
class BaseRRNode {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(..._args) {
    __publicField2(this, "parentElement", null);
    __publicField2(this, "parentNode", null);
    __publicField2(this, "ownerDocument");
    __publicField2(this, "firstChild", null);
    __publicField2(this, "lastChild", null);
    __publicField2(this, "previousSibling", null);
    __publicField2(this, "nextSibling", null);
    __publicField2(this, "ELEMENT_NODE", 1);
    __publicField2(this, "TEXT_NODE", 3);
    __publicField2(this, "nodeType");
    __publicField2(this, "nodeName");
    __publicField2(this, "RRNodeType");
  }
  get childNodes() {
    const childNodes2 = [];
    let childIterator = this.firstChild;
    while (childIterator) {
      childNodes2.push(childIterator);
      childIterator = childIterator.nextSibling;
    }
    return childNodes2;
  }
  contains(node2) {
    if (!(node2 instanceof BaseRRNode)) return false;
    else if (node2.ownerDocument !== this.ownerDocument) return false;
    else if (node2 === this) return true;
    while (node2.parentNode) {
      if (node2.parentNode === this) return true;
      node2 = node2.parentNode;
    }
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild(_newChild) {
    throw new Error(
      `RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(_newChild, _refChild) {
    throw new Error(
      `RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild(_node) {
    throw new Error(
      `RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method.`
    );
  }
  toString() {
    return "RRNode";
  }
}
class BaseRRDocument extends BaseRRNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args) {
    super(args);
    __publicField2(this, "nodeType", 9);
    __publicField2(this, "nodeName", "#document");
    __publicField2(this, "compatMode", "CSS1Compat");
    __publicField2(this, "RRNodeType", NodeType$1.Document);
    __publicField2(this, "textContent", null);
    this.ownerDocument = this;
  }
  get documentElement() {
    return this.childNodes.find(
      (node2) => node2.RRNodeType === NodeType$1.Element && node2.tagName === "HTML"
    ) || null;
  }
  get body() {
    var _a2;
    return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(
      (node2) => node2.RRNodeType === NodeType$1.Element && node2.tagName === "BODY"
    )) || null;
  }
  get head() {
    var _a2;
    return ((_a2 = this.documentElement) == null ? void 0 : _a2.childNodes.find(
      (node2) => node2.RRNodeType === NodeType$1.Element && node2.tagName === "HEAD"
    )) || null;
  }
  get implementation() {
    return this;
  }
  get firstElementChild() {
    return this.documentElement;
  }
  appendChild(newChild) {
    const nodeType = newChild.RRNodeType;
    if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
      if (this.childNodes.some((s2) => s2.RRNodeType === nodeType)) {
        throw new Error(
          `RRDomException: Failed to execute 'appendChild' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`
        );
      }
    }
    const child = appendChild(this, newChild);
    child.parentElement = null;
    return child;
  }
  insertBefore(newChild, refChild) {
    const nodeType = newChild.RRNodeType;
    if (nodeType === NodeType$1.Element || nodeType === NodeType$1.DocumentType) {
      if (this.childNodes.some((s2) => s2.RRNodeType === nodeType)) {
        throw new Error(
          `RRDomException: Failed to execute 'insertBefore' on 'RRNode': Only one ${nodeType === NodeType$1.Element ? "RRElement" : "RRDoctype"} on RRDocument allowed.`
        );
      }
    }
    const child = insertBefore(this, newChild, refChild);
    child.parentElement = null;
    return child;
  }
  removeChild(node2) {
    return removeChild(this, node2);
  }
  open() {
    this.firstChild = null;
    this.lastChild = null;
  }
  close() {
  }
  /**
   * Adhoc implementation for setting xhtml namespace in rebuilt.ts (rrweb-snapshot).
   * There are two lines used this function:
   * 1. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ""\>')
   * 2. doc.write('\<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" ""\>')
   */
  write(content) {
    let publicId;
    if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">')
      publicId = "-//W3C//DTD XHTML 1.0 Transitional//EN";
    else if (content === '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">')
      publicId = "-//W3C//DTD HTML 4.0 Transitional//EN";
    if (publicId) {
      const doctype = this.createDocumentType("html", publicId, "");
      this.open();
      this.appendChild(doctype);
    }
  }
  createDocument(_namespace, _qualifiedName, _doctype) {
    return new BaseRRDocument();
  }
  createDocumentType(qualifiedName, publicId, systemId) {
    const doctype = new BaseRRDocumentType(qualifiedName, publicId, systemId);
    doctype.ownerDocument = this;
    return doctype;
  }
  createElement(tagName) {
    const element = new BaseRRElement(tagName);
    element.ownerDocument = this;
    return element;
  }
  createElementNS(_namespaceURI, qualifiedName) {
    return this.createElement(qualifiedName);
  }
  createTextNode(data) {
    const text = new BaseRRText(data);
    text.ownerDocument = this;
    return text;
  }
  createComment(data) {
    const comment2 = new BaseRRComment(data);
    comment2.ownerDocument = this;
    return comment2;
  }
  createCDATASection(data) {
    const CDATASection = new BaseRRCDATASection(data);
    CDATASection.ownerDocument = this;
    return CDATASection;
  }
  toString() {
    return "RRDocument";
  }
}
class BaseRRDocumentType extends BaseRRNode {
  constructor(qualifiedName, publicId, systemId) {
    super();
    __publicField2(this, "nodeType", 10);
    __publicField2(this, "RRNodeType", NodeType$1.DocumentType);
    __publicField2(this, "name");
    __publicField2(this, "publicId");
    __publicField2(this, "systemId");
    __publicField2(this, "textContent", null);
    this.name = qualifiedName;
    this.publicId = publicId;
    this.systemId = systemId;
    this.nodeName = qualifiedName;
  }
  toString() {
    return "RRDocumentType";
  }
}
class BaseRRElement extends BaseRRNode {
  constructor(tagName) {
    super();
    __publicField2(this, "nodeType", 1);
    __publicField2(this, "RRNodeType", NodeType$1.Element);
    __publicField2(this, "tagName");
    __publicField2(this, "attributes", {});
    __publicField2(this, "shadowRoot", null);
    __publicField2(this, "scrollLeft");
    __publicField2(this, "scrollTop");
    this.tagName = tagName.toUpperCase();
    this.nodeName = tagName.toUpperCase();
  }
  get textContent() {
    let result2 = "";
    this.childNodes.forEach((node2) => result2 += node2.textContent);
    return result2;
  }
  set textContent(textContent2) {
    this.firstChild = null;
    this.lastChild = null;
    this.appendChild(this.ownerDocument.createTextNode(textContent2));
  }
  get classList() {
    return new ClassList(
      this.attributes.class,
      (newClassName) => {
        this.attributes.class = newClassName;
      }
    );
  }
  get id() {
    return this.attributes.id || "";
  }
  get className() {
    return this.attributes.class || "";
  }
  get style() {
    const style = this.attributes.style ? parseCSSText(this.attributes.style) : {};
    const hyphenateRE2 = /\B([A-Z])/g;
    style.setProperty = (name, value, priority) => {
      if (hyphenateRE2.test(name)) return;
      const normalizedName = camelize(name);
      if (!value) delete style[normalizedName];
      else style[normalizedName] = value;
      if (priority === "important") style[normalizedName] += " !important";
      this.attributes.style = toCSSText(style);
    };
    style.removeProperty = (name) => {
      if (hyphenateRE2.test(name)) return "";
      const normalizedName = camelize(name);
      const value = style[normalizedName] || "";
      delete style[normalizedName];
      this.attributes.style = toCSSText(style);
      return value;
    };
    return style;
  }
  getAttribute(name) {
    if (this.attributes[name] === void 0) return null;
    return this.attributes[name];
  }
  setAttribute(name, attribute) {
    this.attributes[name] = attribute;
  }
  setAttributeNS(_namespace, qualifiedName, value) {
    this.setAttribute(qualifiedName, value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  appendChild(newChild) {
    return appendChild(this, newChild);
  }
  insertBefore(newChild, refChild) {
    return insertBefore(this, newChild, refChild);
  }
  removeChild(node2) {
    return removeChild(this, node2);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachShadow(_init) {
    const shadowRoot2 = this.ownerDocument.createElement("SHADOWROOT");
    this.shadowRoot = shadowRoot2;
    return shadowRoot2;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchEvent(_event) {
    return true;
  }
  toString() {
    let attributeString = "";
    for (const attribute in this.attributes) {
      attributeString += `${attribute}="${this.attributes[attribute]}" `;
    }
    return `${this.tagName} ${attributeString}`;
  }
}
class BaseRRMediaElement extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "currentTime");
    __publicField2(this, "volume");
    __publicField2(this, "paused");
    __publicField2(this, "muted");
    __publicField2(this, "playbackRate");
    __publicField2(this, "loop");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachShadow(_init) {
    throw new Error(
      `RRDomException: Failed to execute 'attachShadow' on 'RRElement': This RRElement does not support attachShadow`
    );
  }
  play() {
    this.paused = false;
  }
  pause() {
    this.paused = true;
  }
}
class BaseRRDialogElement extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "tagName", "DIALOG");
    __publicField2(this, "nodeName", "DIALOG");
  }
  get isModal() {
    return this.getAttribute("rr_open_mode") === "modal";
  }
  get open() {
    return this.getAttribute("open") !== null;
  }
  close() {
    this.removeAttribute("open");
    this.removeAttribute("rr_open_mode");
  }
  show() {
    this.setAttribute("open", "");
    this.setAttribute("rr_open_mode", "non-modal");
  }
  showModal() {
    this.setAttribute("open", "");
    this.setAttribute("rr_open_mode", "modal");
  }
}
class BaseRRText extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeType", 3);
    __publicField2(this, "nodeName", "#text");
    __publicField2(this, "RRNodeType", NodeType$1.Text);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRText text=${JSON.stringify(this.data)}`;
  }
}
class BaseRRComment extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeType", 8);
    __publicField2(this, "nodeName", "#comment");
    __publicField2(this, "RRNodeType", NodeType$1.Comment);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRComment text=${JSON.stringify(this.data)}`;
  }
}
class BaseRRCDATASection extends BaseRRNode {
  constructor(data) {
    super();
    __publicField2(this, "nodeName", "#cdata-section");
    __publicField2(this, "nodeType", 4);
    __publicField2(this, "RRNodeType", NodeType$1.CDATA);
    __publicField2(this, "data");
    this.data = data;
  }
  get textContent() {
    return this.data;
  }
  set textContent(textContent2) {
    this.data = textContent2;
  }
  toString() {
    return `RRCDATASection data=${JSON.stringify(this.data)}`;
  }
}
class ClassList {
  constructor(classText, onChange) {
    __publicField2(this, "onChange");
    __publicField2(this, "classes", []);
    __publicField2(this, "add", (...classNames) => {
      for (const item of classNames) {
        const className = String(item);
        if (this.classes.indexOf(className) >= 0) continue;
        this.classes.push(className);
      }
      this.onChange && this.onChange(this.classes.join(" "));
    });
    __publicField2(this, "remove", (...classNames) => {
      this.classes = this.classes.filter(
        (item) => classNames.indexOf(item) === -1
      );
      this.onChange && this.onChange(this.classes.join(" "));
    });
    if (classText) {
      const classes = classText.trim().split(/\s+/);
      this.classes.push(...classes);
    }
    this.onChange = onChange;
  }
}
function appendChild(parent, newChild) {
  if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
  if (parent.lastChild) {
    parent.lastChild.nextSibling = newChild;
    newChild.previousSibling = parent.lastChild;
  } else {
    parent.firstChild = newChild;
    newChild.previousSibling = null;
  }
  parent.lastChild = newChild;
  newChild.nextSibling = null;
  newChild.parentNode = parent;
  newChild.parentElement = parent;
  newChild.ownerDocument = parent.ownerDocument;
  return newChild;
}
function insertBefore(parent, newChild, refChild) {
  if (!refChild) return appendChild(parent, newChild);
  if (refChild.parentNode !== parent)
    throw new Error(
      "Failed to execute 'insertBefore' on 'RRNode': The RRNode before which the new node is to be inserted is not a child of this RRNode."
    );
  if (newChild === refChild) return newChild;
  if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
  newChild.previousSibling = refChild.previousSibling;
  refChild.previousSibling = newChild;
  newChild.nextSibling = refChild;
  if (newChild.previousSibling) newChild.previousSibling.nextSibling = newChild;
  else parent.firstChild = newChild;
  newChild.parentElement = parent;
  newChild.parentNode = parent;
  newChild.ownerDocument = parent.ownerDocument;
  return newChild;
}
function removeChild(parent, child) {
  if (child.parentNode !== parent)
    throw new Error(
      "Failed to execute 'removeChild' on 'RRNode': The RRNode to be removed is not a child of this RRNode."
    );
  if (child.previousSibling)
    child.previousSibling.nextSibling = child.nextSibling;
  else parent.firstChild = child.nextSibling;
  if (child.nextSibling)
    child.nextSibling.previousSibling = child.previousSibling;
  else parent.lastChild = child.previousSibling;
  child.previousSibling = null;
  child.nextSibling = null;
  child.parentElement = null;
  child.parentNode = null;
  return child;
}
var NodeType$2 = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["PLACEHOLDER"] = 0] = "PLACEHOLDER";
  NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
  NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
  NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
  NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
  NodeType2[NodeType2["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
  NodeType2[NodeType2["ENTITY_NODE"] = 6] = "ENTITY_NODE";
  NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
  NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
  NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
  return NodeType2;
})(NodeType$2 || {});
const NAMESPACES = {
  svg: "http://www.w3.org/2000/svg",
  "xlink:href": "http://www.w3.org/1999/xlink",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
const SVGTagMap = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient"
};
let createdNodeSet = null;
function diff(oldTree, newTree, replayer, rrnodeMirror = newTree.mirror || newTree.ownerDocument.mirror) {
  oldTree = diffBeforeUpdatingChildren(
    oldTree,
    newTree,
    replayer,
    rrnodeMirror
  );
  diffChildren(oldTree, newTree, replayer, rrnodeMirror);
  diffAfterUpdatingChildren(oldTree, newTree, replayer);
}
function diffBeforeUpdatingChildren(oldTree, newTree, replayer, rrnodeMirror) {
  var _a2;
  if (replayer.afterAppend && !createdNodeSet) {
    createdNodeSet = /* @__PURE__ */ new WeakSet();
    setTimeout(() => {
      createdNodeSet = null;
    }, 0);
  }
  if (!sameNodeType(oldTree, newTree)) {
    const calibratedOldTree = createOrGetNode(
      newTree,
      replayer.mirror,
      rrnodeMirror
    );
    (_a2 = oldTree.parentNode) == null ? void 0 : _a2.replaceChild(calibratedOldTree, oldTree);
    oldTree = calibratedOldTree;
  }
  switch (newTree.RRNodeType) {
    case NodeType$1.Document: {
      if (!nodeMatching(oldTree, newTree, replayer.mirror, rrnodeMirror)) {
        const newMeta = rrnodeMirror.getMeta(newTree);
        if (newMeta) {
          replayer.mirror.removeNodeFromMap(oldTree);
          oldTree.close();
          oldTree.open();
          replayer.mirror.add(oldTree, newMeta);
          createdNodeSet == null ? void 0 : createdNodeSet.add(oldTree);
        }
      }
      break;
    }
    case NodeType$1.Element: {
      const oldElement = oldTree;
      const newRRElement = newTree;
      switch (newRRElement.tagName) {
        case "IFRAME": {
          const oldContentDocument = oldTree.contentDocument;
          if (!oldContentDocument) break;
          diff(
            oldContentDocument,
            newTree.contentDocument,
            replayer,
            rrnodeMirror
          );
          break;
        }
      }
      if (newRRElement.shadowRoot) {
        if (!oldElement.shadowRoot) oldElement.attachShadow({ mode: "open" });
        diffChildren(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          oldElement.shadowRoot,
          newRRElement.shadowRoot,
          replayer,
          rrnodeMirror
        );
      }
      diffProps(oldElement, newRRElement, rrnodeMirror);
      break;
    }
  }
  return oldTree;
}
function diffAfterUpdatingChildren(oldTree, newTree, replayer) {
  var _a2;
  switch (newTree.RRNodeType) {
    case NodeType$1.Document: {
      const scrollData = newTree.scrollData;
      scrollData && replayer.applyScroll(scrollData, true);
      break;
    }
    case NodeType$1.Element: {
      const oldElement = oldTree;
      const newRRElement = newTree;
      newRRElement.scrollData && replayer.applyScroll(newRRElement.scrollData, true);
      newRRElement.inputData && replayer.applyInput(newRRElement.inputData);
      switch (newRRElement.tagName) {
        case "AUDIO":
        case "VIDEO": {
          const oldMediaElement = oldTree;
          const newMediaRRElement = newRRElement;
          if (newMediaRRElement.paused !== void 0)
            newMediaRRElement.paused ? void oldMediaElement.pause() : void oldMediaElement.play();
          if (newMediaRRElement.muted !== void 0)
            oldMediaElement.muted = newMediaRRElement.muted;
          if (newMediaRRElement.volume !== void 0)
            oldMediaElement.volume = newMediaRRElement.volume;
          if (newMediaRRElement.currentTime !== void 0)
            oldMediaElement.currentTime = newMediaRRElement.currentTime;
          if (newMediaRRElement.playbackRate !== void 0)
            oldMediaElement.playbackRate = newMediaRRElement.playbackRate;
          if (newMediaRRElement.loop !== void 0)
            oldMediaElement.loop = newMediaRRElement.loop;
          break;
        }
        case "CANVAS": {
          const rrCanvasElement = newTree;
          if (rrCanvasElement.rr_dataURL !== null) {
            const image = document.createElement("img");
            image.onload = () => {
              const ctx = oldElement.getContext("2d");
              if (ctx) {
                ctx.drawImage(image, 0, 0, image.width, image.height);
              }
            };
            image.src = rrCanvasElement.rr_dataURL;
          }
          rrCanvasElement.canvasMutations.forEach(
            (canvasMutation2) => replayer.applyCanvas(
              canvasMutation2.event,
              canvasMutation2.mutation,
              oldTree
            )
          );
          break;
        }
        // Props of style elements have to be updated after all children are updated. Otherwise the props can be overwritten by textContent.
        case "STYLE": {
          const styleSheet = oldElement.sheet;
          styleSheet && newTree.rules.forEach(
            (data) => replayer.applyStyleSheetMutation(data, styleSheet)
          );
          break;
        }
        case "DIALOG": {
          const dialog = oldElement;
          const rrDialog = newRRElement;
          const wasOpen = dialog.open;
          const wasModal = dialog.matches("dialog:modal");
          const shouldBeOpen = rrDialog.open;
          const shouldBeModal = rrDialog.isModal;
          const modalChanged = wasModal !== shouldBeModal;
          const openChanged = wasOpen !== shouldBeOpen;
          if (modalChanged || wasOpen && openChanged) dialog.close();
          if (shouldBeOpen && (openChanged || modalChanged)) {
            try {
              if (shouldBeModal) dialog.showModal();
              else dialog.show();
            } catch (e2) {
              console.warn(e2);
            }
          }
          break;
        }
      }
      break;
    }
    case NodeType$1.Text:
    case NodeType$1.Comment:
    case NodeType$1.CDATA: {
      if (oldTree.textContent !== newTree.data)
        oldTree.textContent = newTree.data;
      break;
    }
  }
  if (createdNodeSet == null ? void 0 : createdNodeSet.has(oldTree)) {
    createdNodeSet.delete(oldTree);
    (_a2 = replayer.afterAppend) == null ? void 0 : _a2.call(replayer, oldTree, replayer.mirror.getId(oldTree));
  }
}
function diffProps(oldTree, newTree, rrnodeMirror) {
  const oldAttributes = oldTree.attributes;
  const newAttributes = newTree.attributes;
  for (const name in newAttributes) {
    const newValue = newAttributes[name];
    const sn = rrnodeMirror.getMeta(newTree);
    if ((sn == null ? void 0 : sn.isSVG) && NAMESPACES[name])
      oldTree.setAttributeNS(NAMESPACES[name], name, newValue);
    else if (newTree.tagName === "CANVAS" && name === "rr_dataURL") {
      const image = document.createElement("img");
      image.src = newValue;
      image.onload = () => {
        const ctx = oldTree.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, image.width, image.height);
        }
      };
    } else if (newTree.tagName === "IFRAME" && name === "srcdoc") continue;
    else {
      try {
        oldTree.setAttribute(name, newValue);
      } catch (err) {
        console.warn(err);
      }
    }
  }
  for (const { name } of Array.from(oldAttributes))
    if (!(name in newAttributes)) oldTree.removeAttribute(name);
  newTree.scrollLeft && (oldTree.scrollLeft = newTree.scrollLeft);
  newTree.scrollTop && (oldTree.scrollTop = newTree.scrollTop);
}
function diffChildren(oldTree, newTree, replayer, rrnodeMirror) {
  const oldChildren = Array.from(oldTree.childNodes);
  const newChildren = newTree.childNodes;
  if (oldChildren.length === 0 && newChildren.length === 0) return;
  let oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, newStartIndex = 0, newEndIndex = newChildren.length - 1;
  let oldStartNode = oldChildren[oldStartIndex], oldEndNode = oldChildren[oldEndIndex], newStartNode = newChildren[newStartIndex], newEndNode = newChildren[newEndIndex];
  let oldIdToIndex = void 0, indexInOld = void 0;
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (oldStartNode === void 0) {
      oldStartNode = oldChildren[++oldStartIndex];
    } else if (oldEndNode === void 0) {
      oldEndNode = oldChildren[--oldEndIndex];
    } else if (
      // same first node?
      nodeMatching(oldStartNode, newStartNode, replayer.mirror, rrnodeMirror)
    ) {
      oldStartNode = oldChildren[++oldStartIndex];
      newStartNode = newChildren[++newStartIndex];
    } else if (
      // same last node?
      nodeMatching(oldEndNode, newEndNode, replayer.mirror, rrnodeMirror)
    ) {
      oldEndNode = oldChildren[--oldEndIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (
      // is the first old node the same as the last new node?
      nodeMatching(oldStartNode, newEndNode, replayer.mirror, rrnodeMirror)
    ) {
      try {
        oldTree.insertBefore(oldStartNode, oldEndNode.nextSibling);
      } catch (e2) {
        console.warn(e2);
      }
      oldStartNode = oldChildren[++oldStartIndex];
      newEndNode = newChildren[--newEndIndex];
    } else if (
      // is the last old node the same as the first new node?
      nodeMatching(oldEndNode, newStartNode, replayer.mirror, rrnodeMirror)
    ) {
      try {
        oldTree.insertBefore(oldEndNode, oldStartNode);
      } catch (e2) {
        console.warn(e2);
      }
      oldEndNode = oldChildren[--oldEndIndex];
      newStartNode = newChildren[++newStartIndex];
    } else {
      if (!oldIdToIndex) {
        oldIdToIndex = {};
        for (let i2 = oldStartIndex; i2 <= oldEndIndex; i2++) {
          const oldChild2 = oldChildren[i2];
          if (oldChild2 && replayer.mirror.hasNode(oldChild2))
            oldIdToIndex[replayer.mirror.getId(oldChild2)] = i2;
        }
      }
      indexInOld = oldIdToIndex[rrnodeMirror.getId(newStartNode)];
      const nodeToMove = oldChildren[indexInOld];
      if (indexInOld !== void 0 && nodeToMove && nodeMatching(nodeToMove, newStartNode, replayer.mirror, rrnodeMirror)) {
        try {
          oldTree.insertBefore(nodeToMove, oldStartNode);
        } catch (e2) {
          console.warn(e2);
        }
        oldChildren[indexInOld] = void 0;
      } else {
        const newNode = createOrGetNode(
          newStartNode,
          replayer.mirror,
          rrnodeMirror
        );
        if (oldTree.nodeName === "#document" && oldStartNode && /**
        * Special case 1: one document isn't allowed to have two doctype nodes at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A parent document in the old tree already has a doctype node with an id e.g. #1. A new full snapshot rebuilds the replayer with a new doctype node with another id #2. According to the algorithm, the new doctype node will be inserted before the old one, which is not allowed by the Document standard.
        */
        (newNode.nodeType === newNode.DOCUMENT_TYPE_NODE && oldStartNode.nodeType === oldStartNode.DOCUMENT_TYPE_NODE || /**
        * Special case 2: one document isn't allowed to have two HTMLElements at the same time, so we need to remove the old one first before inserting the new one.
        * How this case happens: A mounted iframe element has an automatically created HTML element. We should delete it before inserting a serialized one. Otherwise, an error 'Only one element on document allowed' will be thrown.
        */
        newNode.nodeType === newNode.ELEMENT_NODE && oldStartNode.nodeType === oldStartNode.ELEMENT_NODE)) {
          oldTree.removeChild(oldStartNode);
          replayer.mirror.removeNodeFromMap(oldStartNode);
          oldStartNode = oldChildren[++oldStartIndex];
        }
        try {
          oldTree.insertBefore(newNode, oldStartNode || null);
        } catch (e2) {
          console.warn(e2);
        }
      }
      newStartNode = newChildren[++newStartIndex];
    }
  }
  if (oldStartIndex > oldEndIndex) {
    const referenceRRNode = newChildren[newEndIndex + 1];
    let referenceNode = null;
    if (referenceRRNode)
      referenceNode = replayer.mirror.getNode(
        rrnodeMirror.getId(referenceRRNode)
      );
    for (; newStartIndex <= newEndIndex; ++newStartIndex) {
      const newNode = createOrGetNode(
        newChildren[newStartIndex],
        replayer.mirror,
        rrnodeMirror
      );
      try {
        oldTree.insertBefore(newNode, referenceNode);
      } catch (e2) {
        console.warn(e2);
      }
    }
  } else if (newStartIndex > newEndIndex) {
    for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
      const node2 = oldChildren[oldStartIndex];
      if (!node2 || node2.parentNode !== oldTree) continue;
      try {
        oldTree.removeChild(node2);
        replayer.mirror.removeNodeFromMap(node2);
      } catch (e2) {
        console.warn(e2);
      }
    }
  }
  let oldChild = oldTree.firstChild;
  let newChild = newTree.firstChild;
  while (oldChild !== null && newChild !== null) {
    diff(oldChild, newChild, replayer, rrnodeMirror);
    oldChild = oldChild.nextSibling;
    newChild = newChild.nextSibling;
  }
}
function createOrGetNode(rrNode, domMirror, rrnodeMirror) {
  const nodeId = rrnodeMirror.getId(rrNode);
  const sn = rrnodeMirror.getMeta(rrNode);
  let node2 = null;
  if (nodeId > -1) node2 = domMirror.getNode(nodeId);
  if (node2 !== null && sameNodeType(node2, rrNode)) return node2;
  switch (rrNode.RRNodeType) {
    case NodeType$1.Document:
      node2 = new Document();
      break;
    case NodeType$1.DocumentType:
      node2 = document.implementation.createDocumentType(
        rrNode.name,
        rrNode.publicId,
        rrNode.systemId
      );
      break;
    case NodeType$1.Element: {
      let tagName = rrNode.tagName.toLowerCase();
      tagName = SVGTagMap[tagName] || tagName;
      if (sn && "isSVG" in sn && (sn == null ? void 0 : sn.isSVG)) {
        node2 = document.createElementNS(NAMESPACES["svg"], tagName);
      } else node2 = document.createElement(rrNode.tagName);
      break;
    }
    case NodeType$1.Text:
      node2 = document.createTextNode(rrNode.data);
      break;
    case NodeType$1.Comment:
      node2 = document.createComment(rrNode.data);
      break;
    case NodeType$1.CDATA:
      node2 = document.createCDATASection(rrNode.data);
      break;
  }
  if (sn) domMirror.add(node2, { ...sn });
  try {
    createdNodeSet == null ? void 0 : createdNodeSet.add(node2);
  } catch (e2) {
  }
  return node2;
}
function sameNodeType(node1, node2) {
  if (node1.nodeType !== node2.nodeType) return false;
  return node1.nodeType !== node1.ELEMENT_NODE || node1.tagName.toUpperCase() === node2.tagName;
}
function nodeMatching(node1, node2, domMirror, rrdomMirror) {
  const node1Id = domMirror.getId(node1);
  const node2Id = rrdomMirror.getId(node2);
  if (node1Id === -1 || node1Id !== node2Id) return false;
  return sameNodeType(node1, node2);
}
class RRDocument extends BaseRRDocument {
  constructor(mirror2) {
    super();
    __publicField2(this, "UNSERIALIZED_STARTING_ID", -2);
    __publicField2(this, "_unserializedId", this.UNSERIALIZED_STARTING_ID);
    __publicField2(this, "mirror", createMirror());
    __publicField2(this, "scrollData", null);
    if (mirror2) {
      this.mirror = mirror2;
    }
  }
  /**
   * Every time the id is used, it will minus 1 automatically to avoid collisions.
   */
  get unserializedId() {
    return this._unserializedId--;
  }
  createDocument(_namespace, _qualifiedName, _doctype) {
    return new RRDocument();
  }
  createDocumentType(qualifiedName, publicId, systemId) {
    const documentTypeNode = new RRDocumentType(
      qualifiedName,
      publicId,
      systemId
    );
    documentTypeNode.ownerDocument = this;
    return documentTypeNode;
  }
  createElement(tagName) {
    const upperTagName = tagName.toUpperCase();
    let element;
    switch (upperTagName) {
      case "AUDIO":
      case "VIDEO":
        element = new RRMediaElement(upperTagName);
        break;
      case "IFRAME":
        element = new RRIFrameElement(upperTagName, this.mirror);
        break;
      case "CANVAS":
        element = new RRCanvasElement(upperTagName);
        break;
      case "STYLE":
        element = new RRStyleElement(upperTagName);
        break;
      case "DIALOG":
        element = new RRDialogElement(upperTagName);
        break;
      default:
        element = new RRElement(upperTagName);
        break;
    }
    element.ownerDocument = this;
    return element;
  }
  createComment(data) {
    const commentNode = new RRComment(data);
    commentNode.ownerDocument = this;
    return commentNode;
  }
  createCDATASection(data) {
    const sectionNode = new RRCDATASection(data);
    sectionNode.ownerDocument = this;
    return sectionNode;
  }
  createTextNode(data) {
    const textNode = new RRText(data);
    textNode.ownerDocument = this;
    return textNode;
  }
  destroyTree() {
    this.firstChild = null;
    this.lastChild = null;
    this.mirror.reset();
  }
  open() {
    super.open();
    this._unserializedId = this.UNSERIALIZED_STARTING_ID;
  }
}
const RRDocumentType = BaseRRDocumentType;
class RRElement extends BaseRRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "inputData", null);
    __publicField2(this, "scrollData", null);
  }
}
class RRMediaElement extends BaseRRMediaElement {
}
class RRDialogElement extends BaseRRDialogElement {
}
class RRCanvasElement extends RRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "rr_dataURL", null);
    __publicField2(this, "canvasMutations", []);
  }
  /**
   * This is a dummy implementation to distinguish RRCanvasElement from real HTMLCanvasElement.
   */
  getContext() {
    return null;
  }
}
class RRStyleElement extends RRElement {
  constructor() {
    super(...arguments);
    __publicField2(this, "rules", []);
  }
}
class RRIFrameElement extends RRElement {
  constructor(upperTagName, mirror2) {
    super(upperTagName);
    __publicField2(this, "contentDocument", new RRDocument());
    this.contentDocument.mirror = mirror2;
  }
}
const RRText = BaseRRText;
const RRComment = BaseRRComment;
const RRCDATASection = BaseRRCDATASection;
function getValidTagName(element) {
  if (element instanceof HTMLFormElement) {
    return "FORM";
  }
  return element.tagName.toUpperCase();
}
function buildFromNode(node2, rrdom, domMirror, parentRRNode) {
  let rrNode;
  switch (node2.nodeType) {
    case NodeType$2.DOCUMENT_NODE:
      if (parentRRNode && parentRRNode.nodeName === "IFRAME")
        rrNode = parentRRNode.contentDocument;
      else {
        rrNode = rrdom;
        rrNode.compatMode = node2.compatMode;
      }
      break;
    case NodeType$2.DOCUMENT_TYPE_NODE: {
      const documentType = node2;
      rrNode = rrdom.createDocumentType(
        documentType.name,
        documentType.publicId,
        documentType.systemId
      );
      break;
    }
    case NodeType$2.ELEMENT_NODE: {
      const elementNode = node2;
      const tagName = getValidTagName(elementNode);
      rrNode = rrdom.createElement(tagName);
      const rrElement = rrNode;
      for (const { name, value } of Array.from(elementNode.attributes)) {
        rrElement.attributes[name] = value;
      }
      elementNode.scrollLeft && (rrElement.scrollLeft = elementNode.scrollLeft);
      elementNode.scrollTop && (rrElement.scrollTop = elementNode.scrollTop);
      break;
    }
    case NodeType$2.TEXT_NODE:
      rrNode = rrdom.createTextNode(node2.textContent || "");
      break;
    case NodeType$2.CDATA_SECTION_NODE:
      rrNode = rrdom.createCDATASection(node2.data);
      break;
    case NodeType$2.COMMENT_NODE:
      rrNode = rrdom.createComment(node2.textContent || "");
      break;
    // if node is a shadow root
    case NodeType$2.DOCUMENT_FRAGMENT_NODE:
      rrNode = parentRRNode.attachShadow({ mode: "open" });
      break;
    default:
      return null;
  }
  let sn = domMirror.getMeta(node2);
  if (rrdom instanceof RRDocument) {
    if (!sn) {
      sn = getDefaultSN(rrNode, rrdom.unserializedId);
      domMirror.add(node2, sn);
    }
    rrdom.mirror.add(rrNode, { ...sn });
  }
  return rrNode;
}
function buildFromDom(dom, domMirror = createMirror$1(), rrdom = new RRDocument()) {
  function walk2(node2, parentRRNode) {
    const rrNode = buildFromNode(node2, rrdom, domMirror, parentRRNode);
    if (rrNode === null) return;
    if (
      // if the parentRRNode isn't a RRIFrameElement
      (parentRRNode == null ? void 0 : parentRRNode.nodeName) !== "IFRAME" && // if node isn't a shadow root
      node2.nodeType !== NodeType$2.DOCUMENT_FRAGMENT_NODE
    ) {
      parentRRNode == null ? void 0 : parentRRNode.appendChild(rrNode);
      rrNode.parentNode = parentRRNode;
      rrNode.parentElement = parentRRNode;
    }
    if (node2.nodeName === "IFRAME") {
      const iframeDoc = node2.contentDocument;
      iframeDoc && walk2(iframeDoc, rrNode);
    } else if (node2.nodeType === NodeType$2.DOCUMENT_NODE || node2.nodeType === NodeType$2.ELEMENT_NODE || node2.nodeType === NodeType$2.DOCUMENT_FRAGMENT_NODE) {
      if (node2.nodeType === NodeType$2.ELEMENT_NODE && node2.shadowRoot)
        walk2(node2.shadowRoot, rrNode);
      node2.childNodes.forEach((childNode) => walk2(childNode, rrNode));
    }
  }
  walk2(dom, null);
  return rrdom;
}
function createMirror() {
  return new Mirror22();
}
class Mirror22 {
  constructor() {
    __publicField2(this, "idNodeMap", /* @__PURE__ */ new Map());
    __publicField2(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(n2) {
    var _a2;
    if (!n2) return -1;
    const id = (_a2 = this.getMeta(n2)) == null ? void 0 : _a2.id;
    return id ?? -1;
  }
  getNode(id) {
    return this.idNodeMap.get(id) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(n2) {
    return this.nodeMetaMap.get(n2) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(n2) {
    const id = this.getId(n2);
    this.idNodeMap.delete(id);
    if (n2.childNodes) {
      n2.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
    }
  }
  has(id) {
    return this.idNodeMap.has(id);
  }
  hasNode(node2) {
    return this.nodeMetaMap.has(node2);
  }
  add(n2, meta) {
    const id = meta.id;
    this.idNodeMap.set(id, n2);
    this.nodeMetaMap.set(n2, meta);
  }
  replace(id, n2) {
    const oldNode = this.getNode(id);
    if (oldNode) {
      const meta = this.nodeMetaMap.get(oldNode);
      if (meta) this.nodeMetaMap.set(n2, meta);
    }
    this.idNodeMap.set(id, n2);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function getDefaultSN(node2, id) {
  switch (node2.RRNodeType) {
    case NodeType$1.Document:
      return {
        id,
        type: node2.RRNodeType,
        childNodes: []
      };
    case NodeType$1.DocumentType: {
      const doctype = node2;
      return {
        id,
        type: node2.RRNodeType,
        name: doctype.name,
        publicId: doctype.publicId,
        systemId: doctype.systemId
      };
    }
    case NodeType$1.Element:
      return {
        id,
        type: node2.RRNodeType,
        tagName: node2.tagName.toLowerCase(),
        // In rrweb data, all tagNames are lowercase.
        attributes: {},
        childNodes: []
      };
    case NodeType$1.Text:
      return {
        id,
        type: node2.RRNodeType,
        textContent: node2.textContent || ""
      };
    case NodeType$1.Comment:
      return {
        id,
        type: node2.RRNodeType,
        textContent: node2.textContent || ""
      };
    case NodeType$1.CDATA:
      return {
        id,
        type: node2.RRNodeType,
        textContent: ""
      };
  }
}
const testableAccessors = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument",
    "firstChild",
    "lastChild",
    "nextSibling",
    "previousSibling"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
};
const testableMethods = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
};
const untaintedBasePrototype = {};
const untaintedBaseIframeCleanup = {};
const isAngularZonePresent = () => {
  return !!globalThis.Zone;
};
function getUntaintedPrototype(key) {
  if (untaintedBasePrototype[key])
    return untaintedBasePrototype[key];
  const defaultObj = globalThis[key];
  const defaultPrototype = defaultObj.prototype;
  const accessorNames = key in testableAccessors ? testableAccessors[key] : void 0;
  const isUntaintedAccessors = Boolean(
    accessorNames && // @ts-expect-error 2345
    accessorNames.every(
      (accessor) => {
        var _a2, _b;
        return Boolean(
          (_b = (_a2 = Object.getOwnPropertyDescriptor(defaultPrototype, accessor)) == null ? void 0 : _a2.get) == null ? void 0 : _b.toString().includes("[native code]")
        );
      }
    )
  );
  const methodNames = key in testableMethods ? testableMethods[key] : void 0;
  const isUntaintedMethods = Boolean(
    methodNames && methodNames.every(
      // @ts-expect-error 2345
      (method) => {
        var _a2;
        return typeof defaultPrototype[method] === "function" && ((_a2 = defaultPrototype[method]) == null ? void 0 : _a2.toString().includes("[native code]"));
      }
    )
  );
  if (isUntaintedAccessors && isUntaintedMethods && !isAngularZonePresent()) {
    untaintedBasePrototype[key] = defaultObj.prototype;
    return defaultObj.prototype;
  }
  try {
    const iframeEl = document.createElement("iframe");
    iframeEl.style.display = "none";
    document.body.appendChild(iframeEl);
    const win = iframeEl.contentWindow;
    if (!win) return defaultObj.prototype;
    const untaintedObject = win[key].prototype;
    if (!untaintedObject) {
      iframeEl.remove();
      return defaultPrototype;
    }
    const ua = navigator.userAgent;
    if (ua.includes("Safari") && !ua.includes("Chrome")) {
      iframeEl.classList.add("rr-block");
      iframeEl.setAttribute("__rrwebUntaintedMutationObserver", "");
      untaintedBaseIframeCleanup[key] = () => iframeEl.remove();
    } else {
      iframeEl.remove();
    }
    return untaintedBasePrototype[key] = untaintedObject;
  } catch {
    return defaultPrototype;
  }
}
const untaintedAccessorCache = {};
function getUntaintedAccessor(key, instance, accessor) {
  var _a2, _b;
  const cached = (_a2 = untaintedAccessorCache[key]) == null ? void 0 : _a2[accessor];
  if (cached) return cached.call(instance);
  const untaintedPrototype = getUntaintedPrototype(key);
  const untaintedAccessor = (_b = Object.getOwnPropertyDescriptor(
    untaintedPrototype,
    accessor
  )) == null ? void 0 : _b.get;
  if (!untaintedAccessor) return instance[accessor];
  (untaintedAccessorCache[key] || (untaintedAccessorCache[key] = {}))[accessor] = untaintedAccessor;
  return untaintedAccessor.call(instance);
}
const untaintedMethodCache = {};
function getUntaintedMethod(key, instance, method) {
  const cacheKey = `${key}.${String(method)}`;
  if (untaintedMethodCache[cacheKey])
    return untaintedMethodCache[cacheKey].bind(
      instance
    );
  const untaintedPrototype = getUntaintedPrototype(key);
  const untaintedMethod = untaintedPrototype[method];
  if (typeof untaintedMethod !== "function") return instance[method];
  untaintedMethodCache[cacheKey] = untaintedMethod;
  return untaintedMethod.bind(instance);
}
function ownerDocument(n2) {
  return getUntaintedAccessor("Node", n2, "ownerDocument");
}
function childNodes(n2) {
  return getUntaintedAccessor("Node", n2, "childNodes");
}
function parentNode(n2) {
  return getUntaintedAccessor("Node", n2, "parentNode");
}
function parentElement(n2) {
  return getUntaintedAccessor("Node", n2, "parentElement");
}
function textContent(n2) {
  return getUntaintedAccessor("Node", n2, "textContent");
}
function firstChild(n2) {
  return getUntaintedAccessor("Node", n2, "firstChild");
}
function lastChild(n2) {
  return getUntaintedAccessor("Node", n2, "lastChild");
}
function nextSibling(n2) {
  return getUntaintedAccessor("Node", n2, "nextSibling");
}
function previousSibling(n2) {
  return getUntaintedAccessor("Node", n2, "previousSibling");
}
function contains(n2, other) {
  return getUntaintedMethod("Node", n2, "contains")(other);
}
function getRootNode(n2) {
  return getUntaintedMethod("Node", n2, "getRootNode")();
}
function host(n2) {
  if (!n2 || !("host" in n2)) return null;
  return getUntaintedAccessor("ShadowRoot", n2, "host");
}
function styleSheets(n2) {
  return n2.styleSheets;
}
function shadowRoot(n2) {
  if (!n2 || !("shadowRoot" in n2)) return null;
  return getUntaintedAccessor("Element", n2, "shadowRoot");
}
function querySelector(n2, selectors) {
  return getUntaintedAccessor("Element", n2, "querySelector")(selectors);
}
function querySelectorAll(n2, selectors) {
  return getUntaintedAccessor("Element", n2, "querySelectorAll")(selectors);
}
function mutationObserverCtor() {
  return [
    getUntaintedPrototype("MutationObserver").constructor,
    untaintedBaseIframeCleanup["MutationObserver"] ?? (() => {
    })
  ];
}
let nowTimestamp = Date.now;
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) {
  nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
}
function patch(source, name, replacement) {
  try {
    if (!(name in source)) {
      return () => {
      };
    }
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      wrapped.prototype = wrapped.prototype || {};
      Object.defineProperties(wrapped, {
        __rrweb_original__: {
          enumerable: false,
          value: original
        }
      });
    }
    source[name] = wrapped;
    return () => {
      source[name] = original;
    };
  } catch {
    return () => {
    };
  }
}
const index = {
  ownerDocument,
  childNodes,
  parentNode,
  parentElement,
  textContent,
  firstChild,
  lastChild,
  nextSibling,
  previousSibling,
  contains,
  getRootNode,
  host,
  styleSheets,
  shadowRoot,
  querySelector,
  querySelectorAll,
  nowTimestamp,
  mutationObserverCtor,
  patch
};
const DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
let _mirror = {
  map: {},
  getId() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return -1;
  },
  getNode() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  },
  has() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return false;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
  _mirror = new Proxy(_mirror, {
    get(target, prop, receiver) {
      if (prop === "map") {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function polyfill$1(win = window) {
  if ("NodeList" in win && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
    win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
  }
}
function queueToResolveTrees(queue) {
  const queueNodeMap = {};
  const putIntoMap = (m, parent) => {
    const nodeInTree = {
      value: m,
      parent,
      children: []
    };
    queueNodeMap[m.node.id] = nodeInTree;
    return nodeInTree;
  };
  const queueNodeTrees = [];
  for (const mutation of queue) {
    const { nextId, parentId } = mutation;
    if (nextId && nextId in queueNodeMap) {
      const nextInTree = queueNodeMap[nextId];
      if (nextInTree.parent) {
        const idx = nextInTree.parent.children.indexOf(nextInTree);
        nextInTree.parent.children.splice(
          idx,
          0,
          putIntoMap(mutation, nextInTree.parent)
        );
      } else {
        const idx = queueNodeTrees.indexOf(nextInTree);
        queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
      }
      continue;
    }
    if (parentId in queueNodeMap) {
      const parentInTree = queueNodeMap[parentId];
      parentInTree.children.push(putIntoMap(mutation, parentInTree));
      continue;
    }
    queueNodeTrees.push(putIntoMap(mutation, null));
  }
  return queueNodeTrees;
}
function iterateResolveTree(tree, cb) {
  cb(tree.value);
  for (let i2 = tree.children.length - 1; i2 >= 0; i2--) {
    iterateResolveTree(tree.children[i2], cb);
  }
}
function isSerializedIframe(n2, mirror2) {
  return Boolean(n2.nodeName === "IFRAME" && mirror2.getMeta(n2));
}
function getBaseDimension(node2, rootIframe) {
  var _a2, _b;
  const frameElement = (_b = (_a2 = node2.ownerDocument) == null ? void 0 : _a2.defaultView) == null ? void 0 : _b.frameElement;
  if (!frameElement || frameElement === rootIframe) {
    return {
      x: 0,
      y: 0,
      relativeScale: 1,
      absoluteScale: 1
    };
  }
  const frameDimension = frameElement.getBoundingClientRect();
  const frameBaseDimension = getBaseDimension(frameElement, rootIframe);
  const relativeScale = frameDimension.height / frameElement.clientHeight;
  return {
    x: frameDimension.x * frameBaseDimension.relativeScale + frameBaseDimension.x,
    y: frameDimension.y * frameBaseDimension.relativeScale + frameBaseDimension.y,
    relativeScale,
    absoluteScale: frameBaseDimension.absoluteScale * relativeScale
  };
}
function hasShadowRoot(n2) {
  if (!n2) return false;
  if (n2 instanceof BaseRRNode && "shadowRoot" in n2) {
    return Boolean(n2.shadowRoot);
  }
  return Boolean(index.shadowRoot(n2));
}
function getNestedRule(rules2, position) {
  const rule2 = rules2 == null ? void 0 : rules2[position[0]];
  if (!rule2) {
    return null;
  }
  if (position.length === 1) {
    return rule2;
  } else {
    return getNestedRule(rule2.cssRules, position.slice(1));
  }
}
function getPositionsAndIndex(nestedIndex) {
  const positions = [...nestedIndex];
  const index2 = positions.pop();
  return { positions, index: index2 };
}
function uniqueTextMutations(mutations) {
  const idSet = /* @__PURE__ */ new Set();
  const uniqueMutations = [];
  for (let i2 = mutations.length; i2--; ) {
    const mutation = mutations[i2];
    if (!idSet.has(mutation.id)) {
      uniqueMutations.push(mutation);
      idSet.add(mutation.id);
    }
  }
  return uniqueMutations;
}
class StyleSheetMirror {
  constructor() {
    __publicField(this, "id", 1);
    __publicField(this, "styleIDMap", /* @__PURE__ */ new WeakMap());
    __publicField(this, "idStyleMap", /* @__PURE__ */ new Map());
  }
  getId(stylesheet) {
    return this.styleIDMap.get(stylesheet) ?? -1;
  }
  has(stylesheet) {
    return this.styleIDMap.has(stylesheet);
  }
  /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */
  add(stylesheet, id) {
    if (this.has(stylesheet)) return this.getId(stylesheet);
    let newId;
    if (id === void 0) {
      newId = this.id++;
    } else newId = id;
    this.styleIDMap.set(stylesheet, newId);
    this.idStyleMap.set(newId, stylesheet);
    return newId;
  }
  getStyle(id) {
    return this.idStyleMap.get(id) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap();
    this.idStyleMap = /* @__PURE__ */ new Map();
    this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
  EventType2[EventType2["Load"] = 1] = "Load";
  EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
  EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
  EventType2[EventType2["Meta"] = 4] = "Meta";
  EventType2[EventType2["Custom"] = 5] = "Custom";
  EventType2[EventType2["Plugin"] = 6] = "Plugin";
  EventType2[EventType2["Asset"] = 7] = "Asset";
  return EventType2;
})(EventType || {});
var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
  IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
  IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
  IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
  IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
  IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
  IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
  IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
  IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
  IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
  IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
  IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
  IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
  IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
  IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
  IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
  IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
  IncrementalSource2[IncrementalSource2["CustomElement"] = 16] = "CustomElement";
  return IncrementalSource2;
})(IncrementalSource || {});
var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
  MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
  MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
  MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
  MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
  MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
  MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
  MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
  MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
  MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
  MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
  MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
  return MouseInteractions2;
})(MouseInteractions || {});
var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
  return CanvasContext2;
})(CanvasContext || {});
var MediaInteractions = /* @__PURE__ */ ((MediaInteractions2) => {
  MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
  MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
  MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
  MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
  MediaInteractions2[MediaInteractions2["RateChange"] = 4] = "RateChange";
  return MediaInteractions2;
})(MediaInteractions || {});
var ReplayerEvents = /* @__PURE__ */ ((ReplayerEvents2) => {
  ReplayerEvents2["Start"] = "start";
  ReplayerEvents2["Pause"] = "pause";
  ReplayerEvents2["Resume"] = "resume";
  ReplayerEvents2["Resize"] = "resize";
  ReplayerEvents2["Finish"] = "finish";
  ReplayerEvents2["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
  ReplayerEvents2["LoadStylesheetStart"] = "load-stylesheet-start";
  ReplayerEvents2["LoadStylesheetEnd"] = "load-stylesheet-end";
  ReplayerEvents2["SkipStart"] = "skip-start";
  ReplayerEvents2["SkipEnd"] = "skip-end";
  ReplayerEvents2["MouseInteraction"] = "mouse-interaction";
  ReplayerEvents2["EventCast"] = "event-cast";
  ReplayerEvents2["CustomEvent"] = "custom-event";
  ReplayerEvents2["Flush"] = "flush";
  ReplayerEvents2["StateChange"] = "state-change";
  ReplayerEvents2["PlayBack"] = "play-back";
  ReplayerEvents2["Destroy"] = "destroy";
  return ReplayerEvents2;
})(ReplayerEvents || {});
var NodeType = /* @__PURE__ */ ((NodeType2) => {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
  return NodeType2;
})(NodeType || {});
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (var i$1 = 0; i$1 < chars.length; i$1++) {
  lookup[chars.charCodeAt(i$1)] = i$1;
}
var decode = function(base64) {
  var bufferLength = base64.length * 0.75, len = base64.length, i2, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i2 = 0; i2 < len; i2 += 4) {
    encoded1 = lookup[base64.charCodeAt(i2)];
    encoded2 = lookup[base64.charCodeAt(i2 + 1)];
    encoded3 = lookup[base64.charCodeAt(i2 + 2)];
    encoded4 = lookup[base64.charCodeAt(i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};
const jsContent = '(function() {\n  "use strict";\n  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";\n  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);\n  for (var i = 0; i < chars.length; i++) {\n    lookup[chars.charCodeAt(i)] = i;\n  }\n  var encode = function(arraybuffer) {\n    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";\n    for (i2 = 0; i2 < len; i2 += 3) {\n      base64 += chars[bytes[i2] >> 2];\n      base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];\n      base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];\n      base64 += chars[bytes[i2 + 2] & 63];\n    }\n    if (len % 3 === 2) {\n      base64 = base64.substring(0, base64.length - 1) + "=";\n    } else if (len % 3 === 1) {\n      base64 = base64.substring(0, base64.length - 2) + "==";\n    }\n    return base64;\n  };\n  const lastBlobMap = /* @__PURE__ */ new Map();\n  const transparentBlobMap = /* @__PURE__ */ new Map();\n  async function getTransparentBlobFor(width, height, dataURLOptions) {\n    const id = `${width}-${height}`;\n    if ("OffscreenCanvas" in globalThis) {\n      if (transparentBlobMap.has(id)) return transparentBlobMap.get(id);\n      const offscreen = new OffscreenCanvas(width, height);\n      offscreen.getContext("2d");\n      const blob = await offscreen.convertToBlob(dataURLOptions);\n      const arrayBuffer = await blob.arrayBuffer();\n      const base64 = encode(arrayBuffer);\n      transparentBlobMap.set(id, base64);\n      return base64;\n    } else {\n      return "";\n    }\n  }\n  const worker = self;\n  worker.onmessage = async function(e) {\n    if ("OffscreenCanvas" in globalThis) {\n      const { id, bitmap, width, height, dataURLOptions } = e.data;\n      const transparentBase64 = getTransparentBlobFor(\n        width,\n        height,\n        dataURLOptions\n      );\n      const offscreen = new OffscreenCanvas(width, height);\n      const ctx = offscreen.getContext("2d");\n      ctx.drawImage(bitmap, 0, 0);\n      bitmap.close();\n      const blob = await offscreen.convertToBlob(dataURLOptions);\n      const type = blob.type;\n      const arrayBuffer = await blob.arrayBuffer();\n      const base64 = encode(arrayBuffer);\n      if (!lastBlobMap.has(id) && await transparentBase64 === base64) {\n        lastBlobMap.set(id, base64);\n        return worker.postMessage({ id });\n      }\n      if (lastBlobMap.get(id) === base64) return worker.postMessage({ id });\n      worker.postMessage({\n        id,\n        type,\n        base64,\n        width,\n        height\n      });\n      lastBlobMap.set(id, base64);\n    } else {\n      return worker.postMessage({ id: e.data.id });\n    }\n  };\n})();\n//# sourceMappingURL=image-bitmap-data-url-worker-IJpC7g_b.js.map\n';
typeof self !== "undefined" && self.Blob && new Blob([jsContent], { type: "text/javascript;charset=utf-8" });
try {
  if (Array.from([1], (x) => x * 2)[0] !== 2) {
    const cleanFrame = document.createElement("iframe");
    document.body.appendChild(cleanFrame);
    Array.from = ((_a = cleanFrame.contentWindow) == null ? void 0 : _a.Array.from) || Array.from;
    document.body.removeChild(cleanFrame);
  }
} catch (err) {
  console.debug("Unable to override Array.from", err);
}
createMirror$2();
function mitt$1(n2) {
  return { all: n2 = n2 || /* @__PURE__ */ new Map(), on: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 ? i2.push(e2) : n2.set(t2, [e2]);
  }, off: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 && (e2 ? i2.splice(i2.indexOf(e2) >>> 0, 1) : n2.set(t2, []));
  }, emit: function(t2, e2) {
    var i2 = n2.get(t2);
    i2 && i2.slice().map(function(n3) {
      n3(e2);
    }), (i2 = n2.get("*")) && i2.slice().map(function(n3) {
      n3(t2, e2);
    });
  } };
}
function polyfill(w = window, d = document) {
  if ("scrollBehavior" in d.documentElement.style && w.__forceSmoothScrollPolyfill__ !== true) {
    return;
  }
  const Element2 = w.HTMLElement || w.Element;
  const SCROLL_TIME = 468;
  const original = {
    scroll: w.scroll || w.scrollTo,
    scrollBy: w.scrollBy,
    elementScroll: Element2.prototype.scroll || scrollElement,
    scrollIntoView: Element2.prototype.scrollIntoView
  };
  const now = w.performance && w.performance.now ? w.performance.now.bind(w.performance) : Date.now;
  function isMicrosoftBrowser(userAgent) {
    const userAgentPatterns = ["MSIE ", "Trident/", "Edge/"];
    return new RegExp(userAgentPatterns.join("|")).test(userAgent);
  }
  const ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
  function scrollElement(x, y) {
    this.scrollLeft = x;
    this.scrollTop = y;
  }
  function ease(k) {
    return 0.5 * (1 - Math.cos(Math.PI * k));
  }
  function shouldBailOut(firstArg) {
    if (firstArg === null || typeof firstArg !== "object" || firstArg.behavior === void 0 || firstArg.behavior === "auto" || firstArg.behavior === "instant") {
      return true;
    }
    if (typeof firstArg === "object" && firstArg.behavior === "smooth") {
      return false;
    }
    throw new TypeError(
      "behavior member of ScrollOptions " + firstArg.behavior + " is not a valid value for enumeration ScrollBehavior."
    );
  }
  function hasScrollableSpace(el, axis) {
    if (axis === "Y") {
      return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
    }
    if (axis === "X") {
      return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
    }
  }
  function canOverflow(el, axis) {
    const overflowValue = w.getComputedStyle(el, null)["overflow" + axis];
    return overflowValue === "auto" || overflowValue === "scroll";
  }
  function isScrollable(el) {
    const isScrollableY = hasScrollableSpace(el, "Y") && canOverflow(el, "Y");
    const isScrollableX = hasScrollableSpace(el, "X") && canOverflow(el, "X");
    return isScrollableY || isScrollableX;
  }
  function findScrollableParent(el) {
    while (el !== d.body && isScrollable(el) === false) {
      el = el.parentNode || el.host;
    }
    return el;
  }
  function step(context) {
    const time = now();
    let value;
    let currentX;
    let currentY;
    let elapsed = (time - context.startTime) / SCROLL_TIME;
    elapsed = elapsed > 1 ? 1 : elapsed;
    value = ease(elapsed);
    currentX = context.startX + (context.x - context.startX) * value;
    currentY = context.startY + (context.y - context.startY) * value;
    context.method.call(context.scrollable, currentX, currentY);
    if (currentX !== context.x || currentY !== context.y) {
      w.requestAnimationFrame(step.bind(w, context));
    }
  }
  function smoothScroll(el, x, y) {
    let scrollable;
    let startX;
    let startY;
    let method;
    const startTime = now();
    if (el === d.body) {
      scrollable = w;
      startX = w.scrollX || w.pageXOffset;
      startY = w.scrollY || w.pageYOffset;
      method = original.scroll;
    } else {
      scrollable = el;
      startX = el.scrollLeft;
      startY = el.scrollTop;
      method = scrollElement;
    }
    step({
      scrollable,
      method,
      startTime,
      startX,
      startY,
      x,
      y
    });
  }
  w.scroll = w.scrollTo = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      original.scroll.call(
        w,
        arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : w.scrollX || w.pageXOffset,
        // use top prop, second argument if present or fallback to scrollY
        arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : w.scrollY || w.pageYOffset
      );
      return;
    }
    smoothScroll.call(
      w,
      d.body,
      arguments[0].left !== void 0 ? ~~arguments[0].left : w.scrollX || w.pageXOffset,
      arguments[0].top !== void 0 ? ~~arguments[0].top : w.scrollY || w.pageYOffset
    );
  };
  w.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0])) {
      original.scrollBy.call(
        w,
        arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] !== "object" ? arguments[0] : 0,
        arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0
      );
      return;
    }
    smoothScroll.call(
      w,
      d.body,
      ~~arguments[0].left + (w.scrollX || w.pageXOffset),
      ~~arguments[0].top + (w.scrollY || w.pageYOffset)
    );
  };
  Element2.prototype.scroll = Element2.prototype.scrollTo = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      if (typeof arguments[0] === "number" && arguments[1] === void 0) {
        throw new SyntaxError("Value could not be converted");
      }
      original.elementScroll.call(
        this,
        // use left prop, first number argument or fallback to scrollLeft
        arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] !== "object" ? ~~arguments[0] : this.scrollLeft,
        // use top prop, second argument or fallback to scrollTop
        arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop
      );
      return;
    }
    const left = arguments[0].left;
    const top = arguments[0].top;
    smoothScroll.call(
      this,
      this,
      typeof left === "undefined" ? this.scrollLeft : ~~left,
      typeof top === "undefined" ? this.scrollTop : ~~top
    );
  };
  Element2.prototype.scrollBy = function() {
    if (arguments[0] === void 0) {
      return;
    }
    if (shouldBailOut(arguments[0]) === true) {
      original.elementScroll.call(
        this,
        arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft,
        arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop
      );
      return;
    }
    this.scroll({
      left: ~~arguments[0].left + this.scrollLeft,
      top: ~~arguments[0].top + this.scrollTop,
      behavior: arguments[0].behavior
    });
  };
  Element2.prototype.scrollIntoView = function() {
    if (shouldBailOut(arguments[0]) === true) {
      original.scrollIntoView.call(
        this,
        arguments[0] === void 0 ? true : arguments[0]
      );
      return;
    }
    const scrollableParent = findScrollableParent(this);
    const parentRects = scrollableParent.getBoundingClientRect();
    const clientRects = this.getBoundingClientRect();
    if (scrollableParent !== d.body) {
      smoothScroll.call(
        this,
        scrollableParent,
        scrollableParent.scrollLeft + clientRects.left - parentRects.left,
        scrollableParent.scrollTop + clientRects.top - parentRects.top
      );
      if (w.getComputedStyle(scrollableParent).position !== "fixed") {
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: "smooth"
        });
      }
    } else {
      w.scrollBy({
        left: clientRects.left,
        top: clientRects.top,
        behavior: "smooth"
      });
    }
  };
}
class Timer {
  constructor(actions = [], config) {
    __publicField(this, "timeOffset", 0);
    __publicField(this, "speed");
    __publicField(this, "actions");
    __publicField(this, "raf", null);
    __publicField(this, "lastTimestamp");
    this.actions = actions;
    this.speed = config.speed;
  }
  /**
   * Add an action, possibly after the timer starts.
   */
  addAction(action) {
    const rafWasActive = this.raf === true;
    if (!this.actions.length || this.actions[this.actions.length - 1].delay <= action.delay) {
      this.actions.push(action);
    } else {
      const index2 = this.findActionIndex(action);
      this.actions.splice(index2, 0, action);
    }
    if (rafWasActive) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    }
  }
  start() {
    this.timeOffset = 0;
    this.lastTimestamp = performance.now();
    this.raf = requestAnimationFrame(this.rafCheck.bind(this));
  }
  updateLiveTime() {
    if (this.raf === true) {
      this.rafCheck();
    }
  }
  rafCheck() {
    const time = performance.now();
    this.timeOffset += (time - this.lastTimestamp) * this.speed;
    this.lastTimestamp = time;
    while (this.actions.length) {
      const action = this.actions[0];
      if (this.timeOffset >= action.delay) {
        this.actions.shift();
        action.doAction();
      } else {
        break;
      }
    }
    if (this.actions.length > 0) {
      this.raf = requestAnimationFrame(this.rafCheck.bind(this));
    } else {
      this.raf = true;
    }
  }
  clear() {
    if (this.raf) {
      if (this.raf !== true) {
        cancelAnimationFrame(this.raf);
      }
      this.raf = null;
    }
    this.actions.length = 0;
  }
  setSpeed(speed) {
    this.speed = speed;
  }
  isActive() {
    return this.raf !== null;
  }
  findActionIndex(action) {
    let start = 0;
    let end = this.actions.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (this.actions[mid].delay < action.delay) {
        start = mid + 1;
      } else if (this.actions[mid].delay > action.delay) {
        end = mid - 1;
      } else {
        return mid + 1;
      }
    }
    return start;
  }
}
function addDelay(event, baselineTime) {
  if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions && event.data.positions.length) {
    const firstOffset = event.data.positions[0].timeOffset;
    const firstTimestamp = event.timestamp + firstOffset;
    event.delay = firstTimestamp - baselineTime;
    return firstTimestamp - baselineTime;
  }
  event.delay = event.timestamp - baselineTime;
  return event.delay;
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function t(t2, n2) {
  var e2 = "function" == typeof Symbol && t2[Symbol.iterator];
  if (!e2) return t2;
  var r2, o2, i2 = e2.call(t2), a2 = [];
  try {
    for (; (void 0 === n2 || n2-- > 0) && !(r2 = i2.next()).done; ) a2.push(r2.value);
  } catch (t3) {
    o2 = { error: t3 };
  } finally {
    try {
      r2 && !r2.done && (e2 = i2.return) && e2.call(i2);
    } finally {
      if (o2) throw o2.error;
    }
  }
  return a2;
}
var n;
!function(t2) {
  t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
}(n || (n = {}));
var e = { type: "xstate.init" };
function r(t2) {
  return void 0 === t2 ? [] : [].concat(t2);
}
function o(t2) {
  return { type: "xstate.assign", assignment: t2 };
}
function i(t2, n2) {
  return "string" == typeof (t2 = "string" == typeof t2 && n2 && n2[t2] ? n2[t2] : t2) ? { type: t2 } : "function" == typeof t2 ? { type: t2.name, exec: t2 } : t2;
}
function a(t2) {
  return function(n2) {
    return t2 === n2;
  };
}
function u(t2) {
  return "string" == typeof t2 ? { type: t2 } : t2;
}
function c(t2, n2) {
  return { value: t2, context: n2, actions: [], changed: false, matches: a(t2) };
}
function f(t2, n2, e2) {
  var r2 = n2, o2 = false;
  return [t2.filter(function(t3) {
    if ("xstate.assign" === t3.type) {
      o2 = true;
      var n3 = Object.assign({}, r2);
      return "function" == typeof t3.assignment ? n3 = t3.assignment(r2, e2) : Object.keys(t3.assignment).forEach(function(o3) {
        n3[o3] = "function" == typeof t3.assignment[o3] ? t3.assignment[o3](r2, e2) : t3.assignment[o3];
      }), r2 = n3, false;
    }
    return true;
  }), r2, o2];
}
function s(n2, o2) {
  void 0 === o2 && (o2 = {});
  var s2 = t(f(r(n2.states[n2.initial].entry).map(function(t2) {
    return i(t2, o2.actions);
  }), n2.context, e), 2), l2 = s2[0], v2 = s2[1], y = { config: n2, _options: o2, initialState: { value: n2.initial, actions: l2, context: v2, matches: a(n2.initial) }, transition: function(e2, o3) {
    var s3, l3, v3 = "string" == typeof e2 ? { value: e2, context: n2.context } : e2, p = v3.value, g = v3.context, d = u(o3), x = n2.states[p];
    if (x.on) {
      var m = r(x.on[d.type]);
      try {
        for (var h = function(t2) {
          var n3 = "function" == typeof Symbol && Symbol.iterator, e3 = n3 && t2[n3], r2 = 0;
          if (e3) return e3.call(t2);
          if (t2 && "number" == typeof t2.length) return { next: function() {
            return t2 && r2 >= t2.length && (t2 = void 0), { value: t2 && t2[r2++], done: !t2 };
          } };
          throw new TypeError(n3 ? "Object is not iterable." : "Symbol.iterator is not defined.");
        }(m), b = h.next(); !b.done; b = h.next()) {
          var S = b.value;
          if (void 0 === S) return c(p, g);
          var w = "string" == typeof S ? { target: S } : S, j = w.target, E = w.actions, R = void 0 === E ? [] : E, N = w.cond, O = void 0 === N ? function() {
            return true;
          } : N, _ = void 0 === j, k = null != j ? j : p, T = n2.states[k];
          if (O(g, d)) {
            var q = t(f((_ ? r(R) : [].concat(x.exit, R, T.entry).filter(function(t2) {
              return t2;
            })).map(function(t2) {
              return i(t2, y._options.actions);
            }), g, d), 3), z = q[0], A = q[1], B = q[2], C = null != j ? j : p;
            return { value: C, context: A, actions: z, changed: j !== p || z.length > 0 || B, matches: a(C) };
          }
        }
      } catch (t2) {
        s3 = { error: t2 };
      } finally {
        try {
          b && !b.done && (l3 = h.return) && l3.call(h);
        } finally {
          if (s3) throw s3.error;
        }
      }
    }
    return c(p, g);
  } };
  return y;
}
var l = function(t2, n2) {
  return t2.actions.forEach(function(e2) {
    var r2 = e2.exec;
    return r2 && r2(t2.context, n2);
  });
};
function v(t2) {
  var r2 = t2.initialState, o2 = n.NotStarted, i2 = /* @__PURE__ */ new Set(), c2 = { _machine: t2, send: function(e2) {
    o2 === n.Running && (r2 = t2.transition(r2, e2), l(r2, u(e2)), i2.forEach(function(t3) {
      return t3(r2);
    }));
  }, subscribe: function(t3) {
    return i2.add(t3), t3(r2), { unsubscribe: function() {
      return i2.delete(t3);
    } };
  }, start: function(i3) {
    if (i3) {
      var u2 = "object" == typeof i3 ? i3 : { context: t2.config.context, value: i3 };
      r2 = { value: u2.value, actions: [], context: u2.context, matches: a(u2.value) };
    }
    return o2 = n.Running, l(r2, e), c2;
  }, stop: function() {
    return o2 = n.Stopped, i2.clear(), c2;
  }, get state() {
    return r2;
  }, get status() {
    return o2;
  } };
  return c2;
}
function discardPriorSnapshots(events, baselineTime) {
  for (let idx = events.length - 1; idx >= 0; idx--) {
    const event = events[idx];
    if (event.type === EventType.Meta) {
      if (event.timestamp <= baselineTime) {
        return events.slice(idx);
      }
    }
  }
  return events;
}
function createPlayerService(context, { getCastFn, applyEventsSynchronously, emitter }) {
  const playerMachine = s(
    {
      id: "player",
      context,
      initial: "paused",
      states: {
        playing: {
          on: {
            PAUSE: {
              target: "paused",
              actions: ["pause"]
            },
            CAST_EVENT: {
              target: "playing",
              actions: "castEvent"
            },
            END: {
              target: "paused",
              actions: ["resetLastPlayedEvent", "pause"]
            },
            ADD_EVENT: {
              target: "playing",
              actions: ["addEvent"]
            }
          }
        },
        paused: {
          on: {
            PLAY: {
              target: "playing",
              actions: ["recordTimeOffset", "play"]
            },
            CAST_EVENT: {
              target: "paused",
              actions: "castEvent"
            },
            TO_LIVE: {
              target: "live",
              actions: ["startLive"]
            },
            ADD_EVENT: {
              target: "paused",
              actions: ["addEvent"]
            }
          }
        },
        live: {
          on: {
            ADD_EVENT: {
              target: "live",
              actions: ["addEvent"]
            },
            CAST_EVENT: {
              target: "live",
              actions: ["castEvent"]
            }
          }
        }
      }
    },
    {
      actions: {
        castEvent: o({
          lastPlayedEvent: (ctx, event) => {
            if (event.type === "CAST_EVENT") {
              return event.payload.event;
            }
            return ctx.lastPlayedEvent;
          }
        }),
        recordTimeOffset: o((ctx, event) => {
          let timeOffset = ctx.timeOffset;
          if ("payload" in event && "timeOffset" in event.payload) {
            timeOffset = event.payload.timeOffset;
          }
          return {
            ...ctx,
            timeOffset,
            baselineTime: ctx.events[0].timestamp + timeOffset
          };
        }),
        play(ctx) {
          var _a2;
          const { timer, events, baselineTime, lastPlayedEvent } = ctx;
          timer.clear();
          for (const event of events) {
            addDelay(event, baselineTime);
          }
          const neededEvents = discardPriorSnapshots(events, baselineTime);
          let lastPlayedTimestamp = lastPlayedEvent == null ? void 0 : lastPlayedEvent.timestamp;
          if ((lastPlayedEvent == null ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot && lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
            lastPlayedTimestamp = lastPlayedEvent.timestamp + ((_a2 = lastPlayedEvent.data.positions[0]) == null ? void 0 : _a2.timeOffset);
          }
          if (baselineTime < (lastPlayedTimestamp || 0)) {
            emitter.emit(ReplayerEvents.PlayBack);
          }
          const syncEvents = new Array();
          for (const event of neededEvents) {
            if (lastPlayedTimestamp && lastPlayedTimestamp < baselineTime && (event.timestamp <= lastPlayedTimestamp || event === lastPlayedEvent)) {
              continue;
            }
            if (event.timestamp < baselineTime) {
              syncEvents.push(event);
            } else {
              const castFn = getCastFn(event, false);
              timer.addAction({
                doAction: () => {
                  castFn();
                },
                delay: event.delay
              });
            }
          }
          applyEventsSynchronously(syncEvents);
          emitter.emit(ReplayerEvents.Flush);
          timer.start();
        },
        pause(ctx) {
          ctx.timer.clear();
        },
        resetLastPlayedEvent: o((ctx) => {
          return {
            ...ctx,
            lastPlayedEvent: null
          };
        }),
        startLive: o({
          baselineTime: (ctx, event) => {
            ctx.timer.start();
            if (event.type === "TO_LIVE" && event.payload.baselineTime) {
              return event.payload.baselineTime;
            }
            return Date.now();
          }
        }),
        addEvent: o((ctx, machineEvent) => {
          const { baselineTime, timer, events } = ctx;
          if (machineEvent.type === "ADD_EVENT") {
            const { event } = machineEvent.payload;
            addDelay(event, baselineTime);
            let end = events.length - 1;
            if (!events[end] || events[end].timestamp <= event.timestamp) {
              events.push(event);
            } else {
              let insertionIndex = -1;
              let start = 0;
              while (start <= end) {
                const mid = Math.floor((start + end) / 2);
                if (events[mid].timestamp <= event.timestamp) {
                  start = mid + 1;
                } else {
                  end = mid - 1;
                }
              }
              if (insertionIndex === -1) {
                insertionIndex = start;
              }
              events.splice(insertionIndex, 0, event);
            }
            const isSync = event.timestamp < baselineTime;
            const castFn = getCastFn(event, isSync);
            if (isSync) {
              castFn();
            } else if (timer.isActive()) {
              timer.addAction({
                doAction: () => {
                  castFn();
                },
                delay: event.delay
              });
            }
          }
          return { ...ctx, events };
        })
      }
    }
  );
  return v(playerMachine);
}
function createSpeedService(context) {
  const speedMachine = s(
    {
      id: "speed",
      context,
      initial: "normal",
      states: {
        normal: {
          on: {
            FAST_FORWARD: {
              target: "skipping",
              actions: ["recordSpeed", "setSpeed"]
            },
            SET_SPEED: {
              target: "normal",
              actions: ["setSpeed"]
            }
          }
        },
        skipping: {
          on: {
            BACK_TO_NORMAL: {
              target: "normal",
              actions: ["restoreSpeed"]
            },
            SET_SPEED: {
              target: "normal",
              actions: ["setSpeed"]
            }
          }
        }
      }
    },
    {
      actions: {
        setSpeed: (ctx, event) => {
          if ("payload" in event) {
            ctx.timer.setSpeed(event.payload.speed);
          }
        },
        recordSpeed: o({
          normalSpeed: (ctx) => ctx.timer.speed
        }),
        restoreSpeed: (ctx) => {
          ctx.timer.setSpeed(ctx.normalSpeed);
        }
      }
    }
  );
  return v(speedMachine);
}
const rules = (blockClass) => [
  `.${blockClass} { background: currentColor }`,
  "noscript { display: none !important; }"
];
const webGLVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
  let contextMap = webGLVarMap.get(ctx);
  if (!contextMap) {
    contextMap = /* @__PURE__ */ new Map();
    webGLVarMap.set(ctx, contextMap);
  }
  if (!contextMap.has(ctor)) {
    contextMap.set(ctor, []);
  }
  return contextMap.get(ctor);
}
function deserializeArg(imageMap, ctx, preload) {
  return async (arg) => {
    if (arg && typeof arg === "object" && "rr_type" in arg) {
      if (preload) preload.isUnchanged = false;
      if (arg.rr_type === "ImageBitmap" && "args" in arg) {
        const args = await deserializeArg(imageMap, ctx, preload)(arg.args);
        return await createImageBitmap.apply(null, args);
      } else if ("index" in arg) {
        if (preload || ctx === null) return arg;
        const { rr_type: name, index: index2 } = arg;
        return variableListFor(ctx, name)[index2];
      } else if ("args" in arg) {
        const { rr_type: name, args } = arg;
        const ctor = window[name];
        return new ctor(
          ...await Promise.all(
            args.map(deserializeArg(imageMap, ctx, preload))
          )
        );
      } else if ("base64" in arg) {
        return decode(arg.base64);
      } else if ("src" in arg) {
        const image = imageMap.get(arg.src);
        if (image) {
          return image;
        } else {
          const image2 = new Image();
          image2.src = arg.src;
          imageMap.set(arg.src, image2);
          return image2;
        }
      } else if ("data" in arg && arg.rr_type === "Blob") {
        const blobContents = await Promise.all(
          arg.data.map(deserializeArg(imageMap, ctx, preload))
        );
        const blob2 = new Blob(blobContents, {
          type: arg.type
        });
        return blob2;
      }
    } else if (Array.isArray(arg)) {
      const result2 = await Promise.all(
        arg.map(deserializeArg(imageMap, ctx, preload))
      );
      return result2;
    }
    return arg;
  };
}
function getContext(target, type) {
  try {
    if (type === CanvasContext.WebGL) {
      return target.getContext("webgl") || target.getContext("experimental-webgl");
    }
    return target.getContext("webgl2");
  } catch (e2) {
    return null;
  }
}
const WebGLVariableConstructorsNames = [
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject"
];
function saveToWebGLVarMap(ctx, result2) {
  if (!(result2 == null ? void 0 : result2.constructor)) return;
  const { name } = result2.constructor;
  if (!WebGLVariableConstructorsNames.includes(name)) return;
  const variables = variableListFor(ctx, name);
  if (!variables.includes(result2)) variables.push(result2);
}
async function webglMutation({
  mutation,
  target,
  type,
  imageMap,
  errorHandler: errorHandler2
}) {
  try {
    const ctx = getContext(target, type);
    if (!ctx) return;
    if (mutation.setter) {
      ctx[mutation.property] = mutation.args[0];
      return;
    }
    const original = ctx[mutation.property];
    const args = await Promise.all(
      mutation.args.map(deserializeArg(imageMap, ctx))
    );
    const result2 = original.apply(ctx, args);
    saveToWebGLVarMap(ctx, result2);
    const debugMode = false;
    if (debugMode) ;
  } catch (error) {
    errorHandler2(mutation, error);
  }
}
async function canvasMutation$1({
  event,
  mutations,
  target,
  imageMap,
  errorHandler: errorHandler2
}) {
  const ctx = target.getContext("2d");
  if (!ctx) {
    errorHandler2(mutations[0], new Error("Canvas context is null"));
    return;
  }
  const mutationArgsPromises = mutations.map(
    async (mutation) => {
      return Promise.all(mutation.args.map(deserializeArg(imageMap, ctx)));
    }
  );
  const args = await Promise.all(mutationArgsPromises);
  args.forEach((args2, index2) => {
    const mutation = mutations[index2];
    try {
      if (mutation.setter) {
        ctx[mutation.property] = mutation.args[0];
        return;
      }
      const original = ctx[mutation.property];
      if (mutation.property === "drawImage" && typeof mutation.args[0] === "string") {
        imageMap.get(event);
        original.apply(ctx, mutation.args);
      } else {
        original.apply(ctx, args2);
      }
    } catch (error) {
      errorHandler2(mutation, error);
    }
    return;
  });
}
async function canvasMutation({
  event,
  mutation,
  target,
  imageMap,
  canvasEventMap,
  errorHandler: errorHandler2
}) {
  try {
    const precomputedMutation = canvasEventMap.get(event) || mutation;
    const commands = "commands" in precomputedMutation ? precomputedMutation.commands : [precomputedMutation];
    if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
      for (let i2 = 0; i2 < commands.length; i2++) {
        const command = commands[i2];
        await webglMutation({
          mutation: command,
          type: mutation.type,
          target,
          imageMap,
          errorHandler: errorHandler2
        });
      }
      return;
    }
    await canvasMutation$1({
      event,
      mutations: commands,
      target,
      imageMap,
      errorHandler: errorHandler2
    });
  } catch (error) {
    errorHandler2(mutation, error);
  }
}
class MediaManager {
  constructor(options) {
    __publicField(this, "mediaMap", /* @__PURE__ */ new Map());
    __publicField(this, "warn");
    __publicField(this, "service");
    __publicField(this, "speedService");
    __publicField(this, "emitter");
    __publicField(this, "getCurrentTime");
    __publicField(this, "metadataCallbackMap", /* @__PURE__ */ new Map());
    this.warn = options.warn;
    this.service = options.service;
    this.speedService = options.speedService;
    this.emitter = options.emitter;
    this.getCurrentTime = options.getCurrentTime;
    this.emitter.on(ReplayerEvents.Start, this.start.bind(this));
    this.emitter.on(ReplayerEvents.SkipStart, this.start.bind(this));
    this.emitter.on(ReplayerEvents.Pause, this.pause.bind(this));
    this.emitter.on(ReplayerEvents.Finish, this.pause.bind(this));
    this.speedService.subscribe(() => {
      this.syncAllMediaElements();
    });
  }
  syncAllMediaElements(options = { pause: false }) {
    this.mediaMap.forEach((_mediaState, target) => {
      this.syncTargetWithState(target);
      if (options.pause) {
        target.pause();
      }
    });
  }
  start() {
    this.syncAllMediaElements();
  }
  pause() {
    this.syncAllMediaElements({ pause: true });
  }
  seekTo({
    time,
    target,
    mediaState
  }) {
    if (mediaState.isPlaying) {
      const differenceBetweenCurrentTimeAndMediaMutationTimestamp = time - mediaState.lastInteractionTimeOffset;
      const mediaPlaybackOffset = differenceBetweenCurrentTimeAndMediaMutationTimestamp / 1e3 * mediaState.playbackRate;
      const duration = "duration" in target && target.duration;
      if (Number.isNaN(duration)) {
        this.waitForMetadata(target);
        return;
      }
      let seekToTime = mediaState.currentTimeAtLastInteraction + mediaPlaybackOffset;
      if (target.loop && // RRMediaElement doesn't have a duration property
      duration !== false) {
        seekToTime = seekToTime % duration;
      }
      target.currentTime = seekToTime;
    } else {
      target.pause();
      target.currentTime = mediaState.currentTimeAtLastInteraction;
    }
  }
  waitForMetadata(target) {
    if (this.metadataCallbackMap.has(target)) return;
    if (!("addEventListener" in target)) return;
    const onLoadedMetadata = () => {
      this.metadataCallbackMap.delete(target);
      const mediaState = this.mediaMap.get(target);
      if (!mediaState) return;
      this.seekTo({
        time: this.getCurrentTime(),
        target,
        mediaState
      });
    };
    this.metadataCallbackMap.set(target, onLoadedMetadata);
    target.addEventListener("loadedmetadata", onLoadedMetadata, {
      once: true
    });
  }
  getMediaStateFromMutation({
    target,
    timeOffset,
    mutation
  }) {
    const lastState = this.mediaMap.get(target);
    const { type, playbackRate, currentTime, muted, volume, loop } = mutation;
    const isPlaying = type === MediaInteractions.Play || type !== MediaInteractions.Pause && ((lastState == null ? void 0 : lastState.isPlaying) || target.getAttribute("autoplay") !== null);
    const mediaState = {
      isPlaying,
      currentTimeAtLastInteraction: currentTime ?? (lastState == null ? void 0 : lastState.currentTimeAtLastInteraction) ?? 0,
      lastInteractionTimeOffset: timeOffset,
      playbackRate: playbackRate ?? (lastState == null ? void 0 : lastState.playbackRate) ?? 1,
      volume: volume ?? (lastState == null ? void 0 : lastState.volume) ?? 1,
      muted: muted ?? (lastState == null ? void 0 : lastState.muted) ?? target.getAttribute("muted") === null,
      loop: loop ?? (lastState == null ? void 0 : lastState.loop) ?? target.getAttribute("loop") === null
    };
    return mediaState;
  }
  syncTargetWithState(target) {
    const mediaState = this.mediaMap.get(target);
    if (!mediaState) return;
    const { muted, loop, volume, isPlaying } = mediaState;
    const playerIsPaused = this.service.state.matches("paused");
    const playbackRate = mediaState.playbackRate * this.speedService.state.context.timer.speed;
    try {
      this.seekTo({
        time: this.getCurrentTime(),
        target,
        mediaState
      });
      if (target.volume !== volume) {
        target.volume = volume;
      }
      target.muted = muted;
      target.loop = loop;
      if (target.playbackRate !== playbackRate) {
        target.playbackRate = playbackRate;
      }
      if (isPlaying && !playerIsPaused) {
        void target.play();
      } else {
        target.pause();
      }
    } catch (error) {
      this.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
        `Failed to replay media interactions: ${error.message || error}`
      );
    }
  }
  addMediaElements(node2, timeOffset, mirror2) {
    if (!["AUDIO", "VIDEO"].includes(node2.nodeName)) return;
    const target = node2;
    const serializedNode = mirror2.getMeta(target);
    if (!serializedNode || !("attributes" in serializedNode)) return;
    const playerIsPaused = this.service.state.matches("paused");
    const mediaAttributes = serializedNode.attributes;
    let isPlaying = false;
    if (mediaAttributes.rr_mediaState) {
      isPlaying = mediaAttributes.rr_mediaState === "played";
    } else {
      isPlaying = target.getAttribute("autoplay") !== null;
    }
    if (isPlaying && playerIsPaused) target.pause();
    let playbackRate = 1;
    if (typeof mediaAttributes.rr_mediaPlaybackRate === "number") {
      playbackRate = mediaAttributes.rr_mediaPlaybackRate;
    }
    let muted = false;
    if (typeof mediaAttributes.rr_mediaMuted === "boolean") {
      muted = mediaAttributes.rr_mediaMuted;
    } else {
      muted = target.getAttribute("muted") !== null;
    }
    let loop = false;
    if (typeof mediaAttributes.rr_mediaLoop === "boolean") {
      loop = mediaAttributes.rr_mediaLoop;
    } else {
      loop = target.getAttribute("loop") !== null;
    }
    let volume = 1;
    if (typeof mediaAttributes.rr_mediaVolume === "number") {
      volume = mediaAttributes.rr_mediaVolume;
    }
    let currentTimeAtLastInteraction = 0;
    if (typeof mediaAttributes.rr_mediaCurrentTime === "number") {
      currentTimeAtLastInteraction = mediaAttributes.rr_mediaCurrentTime;
    }
    this.mediaMap.set(target, {
      isPlaying,
      currentTimeAtLastInteraction,
      lastInteractionTimeOffset: timeOffset,
      playbackRate,
      volume,
      muted,
      loop
    });
    this.syncTargetWithState(target);
  }
  mediaMutation({
    target,
    timeOffset,
    mutation
  }) {
    this.mediaMap.set(
      target,
      this.getMediaStateFromMutation({
        target,
        timeOffset,
        mutation
      })
    );
    this.syncTargetWithState(target);
  }
  isSupportedMediaElement(node2) {
    return ["AUDIO", "VIDEO"].includes(node2.nodeName);
  }
  reset() {
    this.mediaMap.clear();
  }
}
function applyDialogToTopLevel(node2, attributeMutation) {
  if (node2.nodeName !== "DIALOG" || node2 instanceof BaseRRNode) return;
  const dialog = node2;
  const oldIsOpen = dialog.open;
  const oldIsModalState = oldIsOpen && dialog.matches("dialog:modal");
  const rrOpenMode = dialog.getAttribute("rr_open_mode");
  const newIsOpen = typeof (attributeMutation == null ? void 0 : attributeMutation.attributes.open) === "string" || typeof dialog.getAttribute("open") === "string";
  const newIsModalState = rrOpenMode === "modal";
  const newIsNonModalState = rrOpenMode === "non-modal";
  const modalStateChanged = oldIsModalState && newIsNonModalState || !oldIsModalState && newIsModalState;
  if (oldIsOpen && !modalStateChanged) return;
  if (!dialog.isConnected) {
    console.warn("dialog is not attached to the dom", dialog);
    return;
  }
  if (oldIsOpen) dialog.close();
  if (!newIsOpen) return;
  if (newIsModalState) dialog.showModal();
  else dialog.show();
}
function removeDialogFromTopLevel(node2, attributeMutation) {
  if (node2.nodeName !== "DIALOG" || node2 instanceof BaseRRNode) return;
  const dialog = node2;
  if (!dialog.isConnected) {
    console.warn("dialog is not attached to the dom", dialog);
    return;
  }
  if (attributeMutation.attributes.open === null) {
    dialog.removeAttribute("open");
    dialog.removeAttribute("rr_open_mode");
  }
}
const SKIP_TIME_INTERVAL = 5 * 1e3;
const mitt = mitt$1;
const REPLAY_CONSOLE_PREFIX = "[replayer]";
const defaultMouseTailConfig = {
  duration: 500,
  lineCap: "round",
  lineWidth: 3,
  strokeStyle: "red"
};
function indicatesTouchDevice(e2) {
  return e2.type == EventType.IncrementalSnapshot && (e2.data.source == IncrementalSource.TouchMove || e2.data.source == IncrementalSource.MouseInteraction && e2.data.type == MouseInteractions.TouchStart);
}
class Replayer {
  constructor(events, config) {
    __publicField(this, "wrapper");
    __publicField(this, "iframe");
    __publicField(this, "UNSAFE_replayCanvas", false);
    __publicField(this, "service");
    __publicField(this, "speedService");
    __publicField(this, "config");
    __publicField(this, "usingVirtualDom", false);
    __publicField(this, "virtualDom", new RRDocument());
    __publicField(this, "mouse");
    __publicField(this, "mouseTail", null);
    __publicField(this, "tailPositions", []);
    __publicField(this, "emitter", mitt());
    __publicField(this, "nextUserInteractionEvent");
    __publicField(this, "legacy_missingNodeRetryMap", {});
    __publicField(this, "cache", createCache());
    __publicField(this, "imageMap", /* @__PURE__ */ new Map());
    __publicField(this, "canvasEventMap", /* @__PURE__ */ new Map());
    __publicField(this, "mirror", createMirror$2());
    __publicField(this, "styleMirror", new StyleSheetMirror());
    __publicField(this, "mediaManager");
    __publicField(this, "firstFullSnapshot", null);
    __publicField(this, "newDocumentQueue", []);
    __publicField(this, "mousePos", null);
    __publicField(this, "touchActive", null);
    __publicField(this, "lastMouseDownEvent", null);
    __publicField(this, "lastHoveredRootNode");
    __publicField(this, "lastSelectionData", null);
    __publicField(this, "constructedStyleMutations", []);
    __publicField(this, "adoptedStyleSheets", []);
    __publicField(this, "handleResize", (dimension) => {
      this.iframe.style.display = "inherit";
      for (const el of [this.mouseTail, this.iframe]) {
        if (!el) {
          continue;
        }
        el.setAttribute("width", String(dimension.width));
        el.setAttribute("height", String(dimension.height));
      }
    });
    __publicField(this, "applyEventsSynchronously", (events2) => {
      for (const event of events2) {
        switch (event.type) {
          case EventType.DomContentLoaded:
          case EventType.Load:
            continue;
          case EventType.FullSnapshot:
          case EventType.Meta:
          case EventType.Plugin:
          case EventType.IncrementalSnapshot:
            break;
        }
        const castFn = this.getCastFn(event, true);
        castFn();
      }
    });
    __publicField(this, "getCastFn", (event, isSync = false) => {
      let castFn;
      switch (event.type) {
        case EventType.DomContentLoaded:
        case EventType.Load:
          break;
        case EventType.Custom:
          castFn = () => {
            this.emitter.emit(ReplayerEvents.CustomEvent, event);
          };
          break;
        case EventType.Meta:
          castFn = () => this.emitter.emit(ReplayerEvents.Resize, {
            width: event.data.width,
            height: event.data.height
          });
          break;
        case EventType.FullSnapshot:
          castFn = () => {
            var _a2;
            if (this.firstFullSnapshot) {
              if (this.firstFullSnapshot === event) {
                this.firstFullSnapshot = true;
                return;
              }
            } else {
              this.firstFullSnapshot = true;
            }
            this.mediaManager.reset();
            this.styleMirror.reset();
            this.rebuildFullSnapshot(event, isSync);
            (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(event.data.initialOffset);
          };
          break;
        case EventType.IncrementalSnapshot:
          castFn = () => {
            this.applyIncremental(event, isSync);
            if (isSync) {
              return;
            }
            if (event === this.nextUserInteractionEvent) {
              this.nextUserInteractionEvent = null;
              this.backToNormal();
            }
            if (this.config.skipInactive && !this.nextUserInteractionEvent) {
              for (const _event of this.service.state.context.events) {
                if (_event.timestamp <= event.timestamp) {
                  continue;
                }
                if (this.isUserInteraction(_event)) {
                  if (
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    _event.delay - event.delay > this.config.inactivePeriodThreshold * this.speedService.state.context.timer.speed
                  ) {
                    this.nextUserInteractionEvent = _event;
                  }
                  break;
                }
              }
              if (this.nextUserInteractionEvent) {
                const skipTime = (
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  this.nextUserInteractionEvent.delay - event.delay
                );
                const payload = {
                  speed: Math.min(
                    Math.round(skipTime / SKIP_TIME_INTERVAL),
                    this.config.maxSpeed
                  )
                };
                this.speedService.send({ type: "FAST_FORWARD", payload });
                this.emitter.emit(ReplayerEvents.SkipStart, payload);
              }
            }
          };
          break;
      }
      const wrappedCastFn = () => {
        if (castFn) {
          castFn();
        }
        for (const plugin of this.config.plugins || []) {
          if (plugin.handler) plugin.handler(event, isSync, { replayer: this });
        }
        this.service.send({ type: "CAST_EVENT", payload: { event } });
        const lastIndex = this.service.state.context.events.length - 1;
        if (!this.config.liveMode && event === this.service.state.context.events[lastIndex]) {
          const finish = () => {
            if (lastIndex < this.service.state.context.events.length - 1) {
              return;
            }
            this.backToNormal();
            this.service.send("END");
            this.emitter.emit(ReplayerEvents.Finish);
          };
          let finishBuffer = 50;
          if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.MouseMove && event.data.positions.length) {
            finishBuffer += Math.max(0, -event.data.positions[0].timeOffset);
          }
          setTimeout(finish, finishBuffer);
        }
        this.emitter.emit(ReplayerEvents.EventCast, event);
      };
      return wrappedCastFn;
    });
    if (!(config == null ? void 0 : config.liveMode) && events.length < 2) {
      throw new Error("Replayer need at least 2 events.");
    }
    const defaultConfig = {
      speed: 1,
      maxSpeed: 360,
      root: document.body,
      loadTimeout: 0,
      skipInactive: false,
      inactivePeriodThreshold: 10 * 1e3,
      showWarning: true,
      showDebug: false,
      blockClass: "rr-block",
      liveMode: false,
      insertStyleRules: [],
      triggerFocus: true,
      UNSAFE_replayCanvas: false,
      pauseAnimation: true,
      mouseTail: defaultMouseTailConfig,
      useVirtualDom: true,
      // Virtual-dom optimization is enabled by default.
      logger: console
    };
    this.config = Object.assign({}, defaultConfig, config);
    this.handleResize = this.handleResize.bind(this);
    this.getCastFn = this.getCastFn.bind(this);
    this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
    this.emitter.on(ReplayerEvents.Resize, this.handleResize);
    this.setupDom();
    for (const plugin of this.config.plugins || []) {
      if (plugin.getMirror) plugin.getMirror({ nodeMirror: this.mirror });
    }
    this.emitter.on(ReplayerEvents.Flush, () => {
      if (this.usingVirtualDom) {
        const replayerHandler = {
          mirror: this.mirror,
          applyCanvas: (canvasEvent, canvasMutationData, target) => {
            void canvasMutation({
              event: canvasEvent,
              mutation: canvasMutationData,
              target,
              imageMap: this.imageMap,
              canvasEventMap: this.canvasEventMap,
              errorHandler: this.warnCanvasMutationFailed.bind(this)
            });
          },
          applyInput: this.applyInput.bind(this),
          applyScroll: this.applyScroll.bind(this),
          applyStyleSheetMutation: (data, styleSheet) => {
            if (data.source === IncrementalSource.StyleSheetRule)
              this.applyStyleSheetRule(data, styleSheet);
            else if (data.source === IncrementalSource.StyleDeclaration)
              this.applyStyleDeclaration(data, styleSheet);
          },
          afterAppend: (node2, id) => {
            for (const plugin of this.config.plugins || []) {
              if (plugin.onBuild) plugin.onBuild(node2, { id, replayer: this });
            }
          }
        };
        if (this.iframe.contentDocument)
          try {
            diff(
              this.iframe.contentDocument,
              this.virtualDom,
              replayerHandler,
              this.virtualDom.mirror
            );
          } catch (e2) {
            this.warn(e2);
          }
        this.virtualDom.destroyTree();
        this.usingVirtualDom = false;
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
          for (const key in this.legacy_missingNodeRetryMap) {
            try {
              const value = this.legacy_missingNodeRetryMap[key];
              const realNode = createOrGetNode(
                value.node,
                this.mirror,
                this.virtualDom.mirror
              );
              diff(
                realNode,
                value.node,
                replayerHandler,
                this.virtualDom.mirror
              );
              value.node = realNode;
            } catch (error) {
              this.warn(error);
            }
          }
        }
        this.constructedStyleMutations.forEach((data) => {
          this.applyStyleSheetMutation(data);
        });
        this.constructedStyleMutations = [];
        this.adoptedStyleSheets.forEach((data) => {
          this.applyAdoptedStyleSheet(data);
        });
        this.adoptedStyleSheets = [];
      }
      if (this.mousePos) {
        this.moveAndHover(
          this.mousePos.x,
          this.mousePos.y,
          this.mousePos.id,
          true,
          this.mousePos.debugData
        );
        this.mousePos = null;
      }
      if (this.touchActive === true) {
        this.mouse.classList.add("touch-active");
      } else if (this.touchActive === false) {
        this.mouse.classList.remove("touch-active");
      }
      this.touchActive = null;
      if (this.lastMouseDownEvent) {
        const [target, event] = this.lastMouseDownEvent;
        target.dispatchEvent(event);
      }
      this.lastMouseDownEvent = null;
      if (this.lastSelectionData) {
        this.applySelection(this.lastSelectionData);
        this.lastSelectionData = null;
      }
    });
    this.emitter.on(ReplayerEvents.PlayBack, () => {
      this.firstFullSnapshot = null;
      this.mirror.reset();
      this.styleMirror.reset();
      this.mediaManager.reset();
    });
    const timer = new Timer([], {
      speed: this.config.speed
    });
    this.service = createPlayerService(
      {
        events: events.map((e2) => {
          if (config && config.unpackFn) {
            return config.unpackFn(e2);
          }
          return e2;
        }).sort((a1, a2) => a1.timestamp - a2.timestamp),
        timer,
        timeOffset: 0,
        baselineTime: 0,
        lastPlayedEvent: null
      },
      {
        getCastFn: this.getCastFn,
        applyEventsSynchronously: this.applyEventsSynchronously,
        emitter: this.emitter
      }
    );
    this.service.start();
    this.service.subscribe((state) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        player: state
      });
    });
    this.speedService = createSpeedService({
      normalSpeed: -1,
      timer
    });
    this.speedService.start();
    this.speedService.subscribe((state) => {
      this.emitter.emit(ReplayerEvents.StateChange, {
        speed: state
      });
    });
    this.mediaManager = new MediaManager({
      warn: this.warn.bind(this),
      service: this.service,
      speedService: this.speedService,
      emitter: this.emitter,
      getCurrentTime: this.getCurrentTime.bind(this)
    });
    const firstMeta = this.service.state.context.events.find(
      (e2) => e2.type === EventType.Meta
    );
    const firstFullsnapshot = this.service.state.context.events.find(
      (e2) => e2.type === EventType.FullSnapshot
    );
    if (firstMeta) {
      const { width, height } = firstMeta.data;
      setTimeout(() => {
        this.emitter.emit(ReplayerEvents.Resize, {
          width,
          height
        });
      }, 0);
    }
    if (firstFullsnapshot) {
      setTimeout(() => {
        var _a2;
        if (this.firstFullSnapshot) {
          return;
        }
        this.firstFullSnapshot = firstFullsnapshot;
        this.rebuildFullSnapshot(
          firstFullsnapshot
        );
        (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo(
          firstFullsnapshot.data.initialOffset
        );
      }, 1);
    }
    if (this.service.state.context.events.find(indicatesTouchDevice)) {
      this.mouse.classList.add("touch-device");
    }
  }
  get timer() {
    return this.service.state.context.timer;
  }
  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }
  off(event, handler) {
    this.emitter.off(event, handler);
    return this;
  }
  setConfig(config) {
    Object.keys(config).forEach((key) => {
      config[key];
      this.config[key] = config[key];
    });
    if (!this.config.skipInactive) {
      this.backToNormal();
    }
    if (typeof config.speed !== "undefined") {
      this.speedService.send({
        type: "SET_SPEED",
        payload: {
          speed: config.speed
        }
      });
    }
    if (typeof config.mouseTail !== "undefined") {
      if (config.mouseTail === false) {
        if (this.mouseTail) {
          this.mouseTail.style.display = "none";
        }
      } else {
        if (!this.mouseTail) {
          this.mouseTail = document.createElement("canvas");
          this.mouseTail.width = Number.parseFloat(this.iframe.width);
          this.mouseTail.height = Number.parseFloat(this.iframe.height);
          this.mouseTail.classList.add("replayer-mouse-tail");
          this.wrapper.insertBefore(this.mouseTail, this.iframe);
        }
        this.mouseTail.style.display = "inherit";
      }
    }
  }
  getMetaData() {
    const firstEvent = this.service.state.context.events[0];
    const lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
    return {
      startTime: firstEvent.timestamp,
      endTime: lastEvent.timestamp,
      totalTime: lastEvent.timestamp - firstEvent.timestamp
    };
  }
  /**
   * Get the actual time offset the player is at now compared to the first event.
   */
  getCurrentTime() {
    if (this.config.liveMode) {
      this.timer.updateLiveTime();
    }
    return this.timer.timeOffset + this.getTimeOffset();
  }
  /**
   * Get the time offset the player is at now compared to the first event, but without regard for the timer.
   */
  getTimeOffset() {
    const { baselineTime, events } = this.service.state.context;
    return baselineTime - events[0].timestamp;
  }
  getMirror() {
    return this.mirror;
  }
  /**
   * This API was designed to be used as play at any time offset.
   * Since we minimized the data collected from recorder, we do not
   * have the ability of undo an event.
   * So the implementation of play at any time offset will always iterate
   * all of the events, cast event before the offset synchronously
   * and cast event after the offset asynchronously with timer.
   * @param timeOffset - number
   */
  play(timeOffset = 0) {
    var _a2, _b;
    if (this.service.state.matches("paused")) {
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    } else {
      this.service.send({ type: "PAUSE" });
      this.service.send({ type: "PLAY", payload: { timeOffset } });
    }
    (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.remove("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Start);
  }
  pause(timeOffset) {
    var _a2, _b;
    if (timeOffset === void 0 && this.service.state.matches("playing")) {
      this.service.send({ type: "PAUSE" });
    }
    if (typeof timeOffset === "number") {
      this.play(timeOffset);
      this.service.send({ type: "PAUSE" });
    }
    (_b = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.getElementsByTagName("html")[0]) == null ? void 0 : _b.classList.add("rrweb-paused");
    this.emitter.emit(ReplayerEvents.Pause);
  }
  resume(timeOffset = 0) {
    this.warn(
      `The 'resume' was deprecated in 1.0. Please use 'play' method which has the same interface.`
    );
    this.play(timeOffset);
    this.emitter.emit(ReplayerEvents.Resume);
  }
  /**
   * Totally destroy this replayer and please be careful that this operation is irreversible.
   * Memory occupation can be released by removing all references to this replayer.
   */
  destroy() {
    this.pause();
    this.mirror.reset();
    this.styleMirror.reset();
    this.mediaManager.reset();
    this.config.root.removeChild(this.wrapper);
    this.emitter.emit(ReplayerEvents.Destroy);
  }
  startLive(baselineTime) {
    this.service.send({ type: "TO_LIVE", payload: { baselineTime } });
  }
  addEvent(rawEvent) {
    const event = this.config.unpackFn ? this.config.unpackFn(rawEvent) : rawEvent;
    if (indicatesTouchDevice(event)) {
      this.mouse.classList.add("touch-device");
    }
    void Promise.resolve().then(
      () => this.service.send({ type: "ADD_EVENT", payload: { event } })
    );
  }
  enableInteract() {
    this.iframe.setAttribute("scrolling", "auto");
    this.iframe.style.pointerEvents = "auto";
  }
  disableInteract() {
    this.iframe.setAttribute("scrolling", "no");
    this.iframe.style.pointerEvents = "none";
  }
  /**
   * Empties the replayer's cache and reclaims memory.
   * The replayer will use this cache to speed up the playback.
   */
  resetCache() {
    this.cache = createCache();
  }
  setupDom() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("replayer-wrapper");
    this.config.root.appendChild(this.wrapper);
    this.mouse = document.createElement("div");
    this.mouse.classList.add("replayer-mouse");
    this.wrapper.appendChild(this.mouse);
    if (this.config.mouseTail !== false) {
      this.mouseTail = document.createElement("canvas");
      this.mouseTail.classList.add("replayer-mouse-tail");
      this.mouseTail.style.display = "inherit";
      this.wrapper.appendChild(this.mouseTail);
    }
    if (this.config.UNSAFE_replayCanvas) {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
      this.wrapper.appendChild(this.iframe);
      this.UNSAFE_replayCanvas = true;
    } else {
      this.iframe = createSandboxedIframe({
        root: this.wrapper
      });
      this.UNSAFE_replayCanvas = false;
    }
    this.iframe.style.display = "none";
    this.disableInteract();
    if (this.iframe.contentWindow && this.iframe.contentDocument) {
      polyfill(
        this.iframe.contentWindow,
        this.iframe.contentDocument
      );
      polyfill$1(this.iframe.contentWindow);
    }
  }
  rebuildFullSnapshot(event, isSync = false) {
    if (!this.iframe.contentDocument) {
      return this.warn("Looks like your replayer has been destroyed.");
    }
    if (Object.keys(this.legacy_missingNodeRetryMap).length) {
      this.warn(
        "Found unresolved missing node map",
        this.legacy_missingNodeRetryMap
      );
    }
    this.legacy_missingNodeRetryMap = {};
    const collectedIframes = [];
    const collectedDialogs = /* @__PURE__ */ new Set();
    const afterAppend = (builtNode, id) => {
      if (builtNode.nodeName === "DIALOG")
        collectedDialogs.add(builtNode);
      this.collectIframeAndAttachDocument(collectedIframes, builtNode);
      if (this.mediaManager.isSupportedMediaElement(builtNode)) {
        const { events } = this.service.state.context;
        this.mediaManager.addMediaElements(
          builtNode,
          event.timestamp - events[0].timestamp,
          this.mirror
        );
      }
      for (const plugin of this.config.plugins || []) {
        if (plugin.onBuild)
          plugin.onBuild(builtNode, {
            id,
            replayer: this
          });
      }
    };
    if (this.usingVirtualDom) {
      this.virtualDom.destroyTree();
      this.usingVirtualDom = false;
    }
    this.mirror.reset();
    rebuild(event.data.node, {
      doc: this.iframe.contentDocument,
      afterAppend,
      cache: this.cache,
      mirror: this.mirror,
      UNSAFE_allowUnprotectedRebuild: this.UNSAFE_replayCanvas
    });
    afterAppend(this.iframe.contentDocument, event.data.node.id);
    for (const { mutationInQueue, builtNode } of collectedIframes) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter(
        (m) => m !== mutationInQueue
      );
    }
    const { documentElement, head } = this.iframe.contentDocument;
    this.insertStyleRules(documentElement, head);
    collectedDialogs.forEach((d) => applyDialogToTopLevel(d));
    if (!this.service.state.matches("playing")) {
      this.iframe.contentDocument.getElementsByTagName("html")[0].classList.add("rrweb-paused");
    }
    this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
    if (!isSync) {
      this.waitForStylesheetLoad();
    }
    if (this.config.UNSAFE_replayCanvas) {
      void this.preloadAllImages();
    }
  }
  insertStyleRules(documentElement, head) {
    var _a2;
    const injectStylesRules = rules(
      this.config.blockClass
    ).concat(this.config.insertStyleRules);
    if (this.config.pauseAnimation) {
      injectStylesRules.push(
        "html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }"
      );
    }
    if (!injectStylesRules.length) {
      return;
    }
    if (this.usingVirtualDom) {
      const styleEl = this.virtualDom.createElement("style");
      this.virtualDom.mirror.add(
        styleEl,
        getDefaultSN(styleEl, this.virtualDom.unserializedId)
      );
      documentElement.insertBefore(styleEl, head);
      styleEl.rules.push({
        source: IncrementalSource.StyleSheetRule,
        adds: injectStylesRules.map((cssText, index2) => ({
          rule: cssText,
          index: index2
        }))
      });
    } else {
      const styleEl = document.createElement("style");
      documentElement.insertBefore(
        styleEl,
        head
      );
      for (let idx = 0; idx < injectStylesRules.length; idx++) {
        (_a2 = styleEl.sheet) == null ? void 0 : _a2.insertRule(injectStylesRules[idx], idx);
      }
    }
  }
  attachDocumentToIframe(mutation, iframeEl) {
    const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    const collectedIframes = [];
    const collectedDialogs = /* @__PURE__ */ new Set();
    const afterAppend = (builtNode, id) => {
      if (builtNode.nodeName === "DIALOG")
        collectedDialogs.add(builtNode);
      this.collectIframeAndAttachDocument(collectedIframes, builtNode);
      const sn = mirror2.getMeta(builtNode);
      if ((sn == null ? void 0 : sn.type) === NodeType.Element && (sn == null ? void 0 : sn.tagName.toUpperCase()) === "HTML") {
        const { documentElement, head } = iframeEl.contentDocument;
        this.insertStyleRules(
          documentElement,
          head
        );
      }
      if (this.usingVirtualDom) return;
      for (const plugin of this.config.plugins || []) {
        if (plugin.onBuild)
          plugin.onBuild(builtNode, {
            id,
            replayer: this
          });
      }
    };
    buildNodeWithSN(mutation.node, {
      doc: iframeEl.contentDocument,
      mirror: mirror2,
      hackCss: true,
      skipChild: false,
      afterAppend,
      cache: this.cache
    });
    afterAppend(iframeEl.contentDocument, mutation.node.id);
    for (const { mutationInQueue, builtNode } of collectedIframes) {
      this.attachDocumentToIframe(mutationInQueue, builtNode);
      this.newDocumentQueue = this.newDocumentQueue.filter(
        (m) => m !== mutationInQueue
      );
    }
    collectedDialogs.forEach((d) => applyDialogToTopLevel(d));
  }
  collectIframeAndAttachDocument(collected, builtNode) {
    if (isSerializedIframe(builtNode, this.mirror)) {
      const mutationInQueue = this.newDocumentQueue.find(
        (m) => m.parentId === this.mirror.getId(builtNode)
      );
      if (mutationInQueue) {
        collected.push({
          mutationInQueue,
          builtNode
        });
      }
    }
  }
  /**
   * pause when loading style sheet, resume when loaded all timeout exceed
   */
  waitForStylesheetLoad() {
    var _a2;
    const head = (_a2 = this.iframe.contentDocument) == null ? void 0 : _a2.head;
    if (head) {
      const unloadSheets = /* @__PURE__ */ new Set();
      let timer;
      let beforeLoadState = this.service.state;
      const stateHandler = () => {
        beforeLoadState = this.service.state;
      };
      this.emitter.on(ReplayerEvents.Start, stateHandler);
      this.emitter.on(ReplayerEvents.Pause, stateHandler);
      const unsubscribe = () => {
        this.emitter.off(ReplayerEvents.Start, stateHandler);
        this.emitter.off(ReplayerEvents.Pause, stateHandler);
      };
      head.querySelectorAll('link[rel="stylesheet"]').forEach((css) => {
        if (!css.sheet) {
          unloadSheets.add(css);
          css.addEventListener("load", () => {
            unloadSheets.delete(css);
            if (unloadSheets.size === 0 && timer !== -1) {
              if (beforeLoadState.matches("playing")) {
                this.play(this.getCurrentTime());
              }
              this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
              if (timer) {
                clearTimeout(timer);
              }
              unsubscribe();
            }
          });
        }
      });
      if (unloadSheets.size > 0) {
        this.service.send({ type: "PAUSE" });
        this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
        timer = setTimeout(() => {
          if (beforeLoadState.matches("playing")) {
            this.play(this.getCurrentTime());
          }
          timer = -1;
          unsubscribe();
        }, this.config.loadTimeout);
      }
    }
  }
  /**
   * pause when there are some canvas drawImage args need to be loaded
   */
  async preloadAllImages() {
    const promises = [];
    for (const event of this.service.state.context.events) {
      if (event.type === EventType.IncrementalSnapshot && event.data.source === IncrementalSource.CanvasMutation) {
        promises.push(
          this.deserializeAndPreloadCanvasEvents(event.data, event)
        );
        const commands = "commands" in event.data ? event.data.commands : [event.data];
        commands.forEach((c2) => {
          this.preloadImages(c2, event);
        });
      }
    }
    return Promise.all(promises);
  }
  preloadImages(data, event) {
    if (data.property === "drawImage" && typeof data.args[0] === "string" && !this.imageMap.has(event)) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const imgd = ctx == null ? void 0 : ctx.createImageData(canvas.width, canvas.height);
      ctx == null ? void 0 : ctx.putImageData(imgd, 0, 0);
    }
  }
  async deserializeAndPreloadCanvasEvents(data, event) {
    if (!this.canvasEventMap.has(event)) {
      const status = {
        isUnchanged: true
      };
      if ("commands" in data) {
        const commands = await Promise.all(
          data.commands.map(async (c2) => {
            const args = await Promise.all(
              c2.args.map(deserializeArg(this.imageMap, null, status))
            );
            return { ...c2, args };
          })
        );
        if (status.isUnchanged === false)
          this.canvasEventMap.set(event, { ...data, commands });
      } else {
        const args = await Promise.all(
          data.args.map(deserializeArg(this.imageMap, null, status))
        );
        if (status.isUnchanged === false)
          this.canvasEventMap.set(event, { ...data, args });
      }
    }
  }
  applyIncremental(e2, isSync) {
    var _a2, _b, _c;
    const { data: d } = e2;
    switch (d.source) {
      case IncrementalSource.Mutation: {
        try {
          this.applyMutation(d, isSync);
        } catch (error) {
          this.warn(`Exception in mutation ${error.message || error}`, d);
        }
        break;
      }
      case IncrementalSource.Drag:
      case IncrementalSource.TouchMove:
      case IncrementalSource.MouseMove:
        if (isSync) {
          const lastPosition = d.positions[d.positions.length - 1];
          this.mousePos = {
            x: lastPosition.x,
            y: lastPosition.y,
            id: lastPosition.id,
            debugData: d
          };
        } else {
          d.positions.forEach((p) => {
            const action = {
              doAction: () => {
                this.moveAndHover(p.x, p.y, p.id, isSync, d);
              },
              delay: p.timeOffset + e2.timestamp - this.service.state.context.baselineTime
            };
            this.timer.addAction(action);
          });
          this.timer.addAction({
            doAction() {
            },
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            delay: e2.delay - ((_a2 = d.positions[0]) == null ? void 0 : _a2.timeOffset)
          });
        }
        break;
      case IncrementalSource.MouseInteraction: {
        if (d.id === -1) {
          break;
        }
        const event = new Event(toLowerCase(MouseInteractions[d.type]));
        const target = this.mirror.getNode(d.id);
        if (!target) {
          return this.debugNodeNotFound(d, d.id);
        }
        this.emitter.emit(ReplayerEvents.MouseInteraction, {
          type: d.type,
          target
        });
        const { triggerFocus } = this.config;
        switch (d.type) {
          case MouseInteractions.Blur:
            if ("blur" in target) {
              target.blur();
            }
            break;
          case MouseInteractions.Focus:
            if (triggerFocus && target.focus) {
              target.focus({
                preventScroll: true
              });
            }
            break;
          case MouseInteractions.Click:
          case MouseInteractions.TouchStart:
          case MouseInteractions.TouchEnd:
          case MouseInteractions.MouseDown:
          case MouseInteractions.MouseUp:
            if (isSync) {
              if (d.type === MouseInteractions.TouchStart) {
                this.touchActive = true;
              } else if (d.type === MouseInteractions.TouchEnd) {
                this.touchActive = false;
              }
              if (d.type === MouseInteractions.MouseDown) {
                this.lastMouseDownEvent = [target, event];
              } else if (d.type === MouseInteractions.MouseUp) {
                this.lastMouseDownEvent = null;
              }
              this.mousePos = {
                x: d.x || 0,
                y: d.y || 0,
                id: d.id,
                debugData: d
              };
            } else {
              if (d.type === MouseInteractions.TouchStart) {
                this.tailPositions.length = 0;
              }
              this.moveAndHover(d.x || 0, d.y || 0, d.id, isSync, d);
              if (d.type === MouseInteractions.Click) {
                this.mouse.classList.remove("active");
                void this.mouse.offsetWidth;
                this.mouse.classList.add("active");
              } else if (d.type === MouseInteractions.TouchStart) {
                void this.mouse.offsetWidth;
                this.mouse.classList.add("touch-active");
              } else if (d.type === MouseInteractions.TouchEnd) {
                this.mouse.classList.remove("touch-active");
              } else {
                target.dispatchEvent(event);
              }
            }
            break;
          case MouseInteractions.TouchCancel:
            if (isSync) {
              this.touchActive = false;
            } else {
              this.mouse.classList.remove("touch-active");
            }
            break;
          default:
            target.dispatchEvent(event);
        }
        break;
      }
      case IncrementalSource.Scroll: {
        if (d.id === -1) {
          break;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.scrollData = d;
          break;
        }
        this.applyScroll(d, isSync);
        break;
      }
      case IncrementalSource.ViewportResize:
        this.emitter.emit(ReplayerEvents.Resize, {
          width: d.width,
          height: d.height
        });
        break;
      case IncrementalSource.Input: {
        if (d.id === -1) {
          break;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.inputData = d;
          break;
        }
        this.applyInput(d);
        break;
      }
      case IncrementalSource.MediaInteraction: {
        const target = this.usingVirtualDom ? this.virtualDom.mirror.getNode(d.id) : this.mirror.getNode(d.id);
        if (!target) {
          return this.debugNodeNotFound(d, d.id);
        }
        const mediaEl = target;
        const { events } = this.service.state.context;
        this.mediaManager.mediaMutation({
          target: mediaEl,
          timeOffset: e2.timestamp - events[0].timestamp,
          mutation: d
        });
        break;
      }
      case IncrementalSource.StyleSheetRule:
      case IncrementalSource.StyleDeclaration: {
        if (this.usingVirtualDom) {
          if (d.styleId) this.constructedStyleMutations.push(d);
          else if (d.id)
            (_b = this.virtualDom.mirror.getNode(d.id)) == null ? void 0 : _b.rules.push(d);
        } else this.applyStyleSheetMutation(d);
        break;
      }
      case IncrementalSource.CanvasMutation: {
        if (!this.config.UNSAFE_replayCanvas) {
          return;
        }
        if (this.usingVirtualDom) {
          const target = this.virtualDom.mirror.getNode(
            d.id
          );
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          target.canvasMutations.push({
            event: e2,
            mutation: d
          });
        } else {
          const target = this.mirror.getNode(d.id);
          if (!target) {
            return this.debugNodeNotFound(d, d.id);
          }
          void canvasMutation({
            event: e2,
            mutation: d,
            target,
            imageMap: this.imageMap,
            canvasEventMap: this.canvasEventMap,
            errorHandler: this.warnCanvasMutationFailed.bind(this)
          });
        }
        break;
      }
      case IncrementalSource.Font: {
        try {
          const fontFace = new FontFace(
            d.family,
            d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource,
            d.descriptors
          );
          (_c = this.iframe.contentDocument) == null ? void 0 : _c.fonts.add(fontFace);
        } catch (error) {
          this.warn(error);
        }
        break;
      }
      case IncrementalSource.Selection: {
        if (isSync) {
          this.lastSelectionData = d;
          break;
        }
        this.applySelection(d);
        break;
      }
      case IncrementalSource.AdoptedStyleSheet: {
        if (this.usingVirtualDom) this.adoptedStyleSheets.push(d);
        else this.applyAdoptedStyleSheet(d);
        break;
      }
    }
  }
  /**
   * Apply the mutation to the virtual dom or the real dom.
   * @param d - The mutation data.
   * @param isSync - Whether the mutation should be applied synchronously (while fast-forwarding).
   */
  applyMutation(d, isSync) {
    if (this.config.useVirtualDom && !this.usingVirtualDom && isSync) {
      this.usingVirtualDom = true;
      buildFromDom(this.iframe.contentDocument, this.mirror, this.virtualDom);
      if (Object.keys(this.legacy_missingNodeRetryMap).length) {
        for (const key in this.legacy_missingNodeRetryMap) {
          try {
            const value = this.legacy_missingNodeRetryMap[key];
            const virtualNode = buildFromNode(
              value.node,
              this.virtualDom,
              this.mirror
            );
            if (virtualNode) value.node = virtualNode;
          } catch (error) {
            this.warn(error);
          }
        }
      }
    }
    const mirror2 = this.usingVirtualDom ? this.virtualDom.mirror : this.mirror;
    d.removes = d.removes.filter((mutation) => {
      if (!mirror2.getNode(mutation.id)) {
        this.warnNodeNotFound(d, mutation.id);
        return false;
      }
      return true;
    });
    d.removes.forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        return;
      }
      let parent = mirror2.getNode(
        mutation.parentId
      );
      if (!parent) {
        return this.warnNodeNotFound(d, mutation.parentId);
      }
      if (mutation.isShadow && hasShadowRoot(parent)) {
        parent = parent.shadowRoot;
      }
      mirror2.removeNodeFromMap(target);
      if (parent)
        try {
          parent.removeChild(target);
          if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_a2 = parent.rules) == null ? void 0 : _a2.length) > 0)
            parent.rules = [];
        } catch (error) {
          if (error instanceof DOMException) {
            this.warn(
              "parent could not remove child in mutation",
              parent,
              target,
              d
            );
          } else {
            throw error;
          }
        }
    });
    const legacy_missingNodeMap = {
      ...this.legacy_missingNodeRetryMap
    };
    const legacy_queue = [];
    const nextNotInDOM = (mutation) => {
      let next = null;
      if (mutation.nextId) {
        next = mirror2.getNode(mutation.nextId);
      }
      if (mutation.nextId !== null && mutation.nextId !== void 0 && mutation.nextId !== -1 && !next) {
        return true;
      }
      return false;
    };
    const appendNode = (mutation) => {
      var _a2, _b;
      if (!this.iframe.contentDocument) {
        return this.warn("Looks like your replayer has been destroyed.");
      }
      let parent = mirror2.getNode(
        mutation.parentId
      );
      if (!parent) {
        if (mutation.node.type === NodeType.Document) {
          return this.newDocumentQueue.push(mutation);
        }
        return legacy_queue.push(mutation);
      }
      if (mutation.node.isShadow) {
        if (!hasShadowRoot(parent)) {
          parent.attachShadow({ mode: "open" });
          parent = parent.shadowRoot;
        } else parent = parent.shadowRoot;
      }
      let previous = null;
      let next = null;
      if (mutation.previousId) {
        previous = mirror2.getNode(mutation.previousId);
      }
      if (mutation.nextId) {
        next = mirror2.getNode(mutation.nextId);
      }
      if (nextNotInDOM(mutation)) {
        return legacy_queue.push(mutation);
      }
      if (mutation.node.rootId && !mirror2.getNode(mutation.node.rootId)) {
        return;
      }
      const targetDoc = mutation.node.rootId ? mirror2.getNode(mutation.node.rootId) : this.usingVirtualDom ? this.virtualDom : this.iframe.contentDocument;
      if (isSerializedIframe(parent, mirror2)) {
        this.attachDocumentToIframe(
          mutation,
          parent
        );
        return;
      }
      const afterAppend = (node2, id) => {
        if (this.usingVirtualDom) return;
        applyDialogToTopLevel(node2);
        for (const plugin of this.config.plugins || []) {
          if (plugin.onBuild) plugin.onBuild(node2, { id, replayer: this });
        }
      };
      const target = buildNodeWithSN(mutation.node, {
        doc: targetDoc,
        // can be Document or RRDocument
        mirror: mirror2,
        // can be this.mirror or virtualDom.mirror
        skipChild: true,
        hackCss: true,
        cache: this.cache,
        /**
         * caveat: `afterAppend` only gets called on child nodes of target
         * we have to call it again below when this target was added to the DOM
         */
        afterAppend
      });
      if (mutation.previousId === -1 || mutation.nextId === -1) {
        legacy_missingNodeMap[mutation.node.id] = {
          node: target,
          mutation
        };
        return;
      }
      const parentSn = mirror2.getMeta(parent);
      if (parentSn && parentSn.type === NodeType.Element && mutation.node.type === NodeType.Text) {
        const prospectiveSiblings = Array.isArray(parent.childNodes) ? parent.childNodes : Array.from(parent.childNodes);
        if (parentSn.tagName === "textarea") {
          for (const c2 of prospectiveSiblings) {
            if (c2.nodeType === parent.TEXT_NODE) {
              parent.removeChild(c2);
            }
          }
        } else if (parentSn.tagName === "style" && prospectiveSiblings.length === 1) {
          for (const cssText of prospectiveSiblings) {
            if (cssText.nodeType === parent.TEXT_NODE && !mirror2.hasNode(cssText)) {
              target.textContent = cssText.textContent;
              parent.removeChild(cssText);
            }
          }
        }
      } else if ((parentSn == null ? void 0 : parentSn.type) === NodeType.Document) {
        const parentDoc = parent;
        if (mutation.node.type === NodeType.DocumentType && ((_a2 = parentDoc.childNodes[0]) == null ? void 0 : _a2.nodeType) === Node.DOCUMENT_TYPE_NODE)
          parentDoc.removeChild(parentDoc.childNodes[0]);
        if (target.nodeName === "HTML" && parentDoc.documentElement)
          parentDoc.removeChild(
            parentDoc.documentElement
          );
      }
      if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
        parent.insertBefore(
          target,
          previous.nextSibling
        );
      } else if (next && next.parentNode) {
        parent.contains(next) ? parent.insertBefore(target, next) : parent.insertBefore(target, null);
      } else {
        parent.appendChild(target);
      }
      afterAppend(target, mutation.node.id);
      if (this.usingVirtualDom && target.nodeName === "#text" && parent.nodeName === "STYLE" && ((_b = parent.rules) == null ? void 0 : _b.length) > 0)
        parent.rules = [];
      if (isSerializedIframe(target, this.mirror)) {
        const targetId = this.mirror.getId(target);
        const mutationInQueue = this.newDocumentQueue.find(
          (m) => m.parentId === targetId
        );
        if (mutationInQueue) {
          this.attachDocumentToIframe(
            mutationInQueue,
            target
          );
          this.newDocumentQueue = this.newDocumentQueue.filter(
            (m) => m !== mutationInQueue
          );
        }
      }
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(
          legacy_missingNodeMap,
          parent,
          target,
          mutation
        );
      }
    };
    d.adds.forEach((mutation) => {
      appendNode(mutation);
    });
    const startTime = Date.now();
    while (legacy_queue.length) {
      const resolveTrees = queueToResolveTrees(legacy_queue);
      legacy_queue.length = 0;
      if (Date.now() - startTime > 500) {
        this.warn(
          "Timeout in the loop, please check the resolve tree data:",
          resolveTrees
        );
        break;
      }
      for (const tree of resolveTrees) {
        const parent = mirror2.getNode(tree.value.parentId);
        if (!parent) {
          this.debug(
            "Drop resolve tree since there is no parent for the root node.",
            tree
          );
        } else {
          iterateResolveTree(tree, (mutation) => {
            appendNode(mutation);
          });
        }
      }
    }
    if (Object.keys(legacy_missingNodeMap).length) {
      Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
    }
    uniqueTextMutations(d.texts).forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        if (d.removes.find((r2) => r2.id === mutation.id)) {
          return;
        }
        return this.warnNodeNotFound(d, mutation.id);
      }
      const parentEl = target.parentElement;
      if (mutation.value && parentEl && parentEl.tagName === "STYLE") {
        target.textContent = adaptCssForReplay(mutation.value, this.cache);
      } else {
        target.textContent = mutation.value;
      }
      if (this.usingVirtualDom) {
        const parent = target.parentNode;
        if (((_a2 = parent == null ? void 0 : parent.rules) == null ? void 0 : _a2.length) > 0) parent.rules = [];
      }
    });
    d.attributes.forEach((mutation) => {
      var _a2;
      const target = mirror2.getNode(mutation.id);
      if (!target) {
        if (d.removes.find((r2) => r2.id === mutation.id)) {
          return;
        }
        return this.warnNodeNotFound(d, mutation.id);
      }
      for (const attributeName in mutation.attributes) {
        if (typeof attributeName === "string") {
          const value = mutation.attributes[attributeName];
          if (value === null) {
            target.removeAttribute(attributeName);
            if (attributeName === "open")
              removeDialogFromTopLevel(target, mutation);
          } else if (typeof value === "string") {
            try {
              if (attributeName === "_cssText" && (target.nodeName === "LINK" || target.nodeName === "STYLE")) {
                try {
                  const newSn = mirror2.getMeta(
                    target
                  );
                  const newNode = buildNodeWithSN(
                    {
                      ...newSn,
                      attributes: {
                        ...newSn.attributes,
                        ...mutation.attributes
                      }
                    },
                    {
                      doc: target.ownerDocument,
                      // can be Document or RRDocument
                      mirror: mirror2,
                      skipChild: true,
                      hackCss: true,
                      cache: this.cache
                    }
                  );
                  Object.assign(
                    newSn.attributes,
                    mutation.attributes
                  );
                  const siblingNode = target.nextSibling;
                  const parentNode2 = target.parentNode;
                  if (newNode && parentNode2) {
                    parentNode2.removeChild(target);
                    parentNode2.insertBefore(
                      newNode,
                      siblingNode
                    );
                    mirror2.replace(mutation.id, newNode);
                    break;
                  }
                } catch (e2) {
                }
              }
              if (attributeName === "value" && target.nodeName === "TEXTAREA") {
                const textarea = target;
                textarea.childNodes.forEach(
                  (c2) => textarea.removeChild(c2)
                );
                const tn = (_a2 = target.ownerDocument) == null ? void 0 : _a2.createTextNode(value);
                if (tn) {
                  textarea.appendChild(tn);
                }
              } else {
                target.setAttribute(
                  attributeName,
                  value
                );
              }
              if (attributeName === "rr_open_mode" && target.nodeName === "DIALOG") {
                applyDialogToTopLevel(target, mutation);
              }
            } catch (error) {
              this.warn(
                "An error occurred may due to the checkout feature.",
                error
              );
            }
          } else if (attributeName === "style") {
            const styleValues = value;
            const targetEl = target;
            for (const s2 in styleValues) {
              if (styleValues[s2] === false) {
                targetEl.style.removeProperty(s2);
              } else if (styleValues[s2] instanceof Array) {
                const svp = styleValues[s2];
                targetEl.style.setProperty(s2, svp[0], svp[1]);
              } else {
                const svs = styleValues[s2];
                targetEl.style.setProperty(s2, svs);
              }
            }
          }
        }
      }
    });
  }
  /**
   * Apply the scroll data on real elements.
   * If the replayer is in sync mode, smooth scroll behavior should be disabled.
   * @param d - the scroll data
   * @param isSync - whether the replayer is in sync mode(fast-forward)
   */
  applyScroll(d, isSync) {
    var _a2, _b;
    const target = this.mirror.getNode(d.id);
    if (!target) {
      return this.debugNodeNotFound(d, d.id);
    }
    const sn = this.mirror.getMeta(target);
    if (target === this.iframe.contentDocument) {
      (_a2 = this.iframe.contentWindow) == null ? void 0 : _a2.scrollTo({
        top: d.y,
        left: d.x,
        behavior: isSync ? "auto" : "smooth"
      });
    } else if ((sn == null ? void 0 : sn.type) === NodeType.Document) {
      (_b = target.defaultView) == null ? void 0 : _b.scrollTo({
        top: d.y,
        left: d.x,
        behavior: isSync ? "auto" : "smooth"
      });
    } else {
      try {
        target.scrollTo({
          top: d.y,
          left: d.x,
          behavior: isSync ? "auto" : "smooth"
        });
      } catch (error) {
      }
    }
  }
  applyInput(d) {
    const target = this.mirror.getNode(d.id);
    if (!target) {
      return this.debugNodeNotFound(d, d.id);
    }
    try {
      target.checked = d.isChecked;
      target.value = d.text;
    } catch (error) {
    }
  }
  applySelection(d) {
    try {
      const selectionSet = /* @__PURE__ */ new Set();
      const ranges = d.ranges.map(({ start, startOffset, end, endOffset }) => {
        const startContainer = this.mirror.getNode(start);
        const endContainer = this.mirror.getNode(end);
        if (!startContainer || !endContainer) return;
        const result2 = new Range();
        result2.setStart(startContainer, startOffset);
        result2.setEnd(endContainer, endOffset);
        const doc = startContainer.ownerDocument;
        const selection = doc == null ? void 0 : doc.getSelection();
        selection && selectionSet.add(selection);
        return {
          range: result2,
          selection
        };
      });
      selectionSet.forEach((s2) => s2.removeAllRanges());
      ranges.forEach((r2) => {
        var _a2;
        return r2 && ((_a2 = r2.selection) == null ? void 0 : _a2.addRange(r2.range));
      });
    } catch (error) {
    }
  }
  applyStyleSheetMutation(data) {
    var _a2;
    let styleSheet = null;
    if (data.styleId) styleSheet = this.styleMirror.getStyle(data.styleId);
    else if (data.id)
      styleSheet = ((_a2 = this.mirror.getNode(data.id)) == null ? void 0 : _a2.sheet) || null;
    if (!styleSheet) return;
    if (data.source === IncrementalSource.StyleSheetRule)
      this.applyStyleSheetRule(data, styleSheet);
    else if (data.source === IncrementalSource.StyleDeclaration)
      this.applyStyleDeclaration(data, styleSheet);
  }
  applyStyleSheetRule(data, styleSheet) {
    var _a2, _b, _c, _d;
    (_a2 = data.adds) == null ? void 0 : _a2.forEach(({ rule: rule2, index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index: index2 } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule == null ? void 0 : nestedRule.insertRule(rule2, index2);
        } else {
          const index2 = nestedIndex === void 0 ? void 0 : Math.min(nestedIndex, styleSheet.cssRules.length);
          styleSheet == null ? void 0 : styleSheet.insertRule(rule2, index2);
        }
      } catch (e2) {
      }
    });
    (_b = data.removes) == null ? void 0 : _b.forEach(({ index: nestedIndex }) => {
      try {
        if (Array.isArray(nestedIndex)) {
          const { positions, index: index2 } = getPositionsAndIndex(nestedIndex);
          const nestedRule = getNestedRule(styleSheet.cssRules, positions);
          nestedRule == null ? void 0 : nestedRule.deleteRule(index2 || 0);
        } else {
          styleSheet == null ? void 0 : styleSheet.deleteRule(nestedIndex);
        }
      } catch (e2) {
      }
    });
    if (typeof data.replace === "string")
      try {
        void ((_c = styleSheet.replace) == null ? void 0 : _c.call(styleSheet, data.replace));
      } catch (e2) {
      }
    if (typeof data.replaceSync === "string")
      try {
        (_d = styleSheet.replaceSync) == null ? void 0 : _d.call(styleSheet, data.replaceSync);
      } catch (e2) {
      }
  }
  /**
   * Apply a StyleDeclaration event (setProperty/removeProperty) to a stylesheet.
   *
   * Uses defensive null checks because the rule may not exist:
   * - Timing issues: The rule was added by a previous StyleSheetRule event
   *   that hasn't been processed yet
   * - Dynamic stylesheets: Constructed stylesheets or adopted stylesheets
   *   may not be fully synchronized
   * - Nested rules: Rules inside @media/@supports require the parent rule
   *   to exist first
   */
  applyStyleDeclaration(data, styleSheet) {
    if (data.set) {
      const rule2 = getNestedRule(
        styleSheet.rules,
        data.index
      );
      if (rule2 == null ? void 0 : rule2.style) {
        rule2.style.setProperty(
          data.set.property,
          data.set.value,
          data.set.priority
        );
      }
    }
    if (data.remove) {
      const rule2 = getNestedRule(
        styleSheet.rules,
        data.index
      );
      if (rule2 == null ? void 0 : rule2.style) {
        rule2.style.removeProperty(data.remove.property);
      }
    }
  }
  applyAdoptedStyleSheet(data) {
    var _a2;
    const targetHost = this.mirror.getNode(data.id);
    if (!targetHost) return;
    (_a2 = data.styles) == null ? void 0 : _a2.forEach((style) => {
      var _a3;
      let newStyleSheet = null;
      let hostWindow = null;
      if (hasShadowRoot(targetHost))
        hostWindow = ((_a3 = targetHost.ownerDocument) == null ? void 0 : _a3.defaultView) || null;
      else if (targetHost.nodeName === "#document")
        hostWindow = targetHost.defaultView;
      if (!hostWindow) return;
      try {
        newStyleSheet = new hostWindow.CSSStyleSheet();
        this.styleMirror.add(newStyleSheet, style.styleId);
        this.applyStyleSheetRule(
          {
            source: IncrementalSource.StyleSheetRule,
            adds: style.rules
          },
          newStyleSheet
        );
      } catch (e2) {
      }
    });
    const MAX_RETRY_TIME = 10;
    let count = 0;
    const adoptStyleSheets = (targetHost2, styleIds) => {
      const stylesToAdopt = styleIds.map((styleId) => this.styleMirror.getStyle(styleId)).filter((style) => style !== null);
      if (hasShadowRoot(targetHost2))
        targetHost2.shadowRoot.adoptedStyleSheets = stylesToAdopt;
      else if (targetHost2.nodeName === "#document")
        targetHost2.adoptedStyleSheets = stylesToAdopt;
      if (stylesToAdopt.length !== styleIds.length && count < MAX_RETRY_TIME) {
        setTimeout(
          () => adoptStyleSheets(targetHost2, styleIds),
          0 + 100 * count
        );
        count++;
      }
    };
    adoptStyleSheets(targetHost, data.styleIds);
  }
  legacy_resolveMissingNode(map, parent, target, targetMutation) {
    const { previousId, nextId } = targetMutation;
    const previousInMap = previousId && map[previousId];
    const nextInMap = nextId && map[nextId];
    if (previousInMap) {
      const { node: node2, mutation } = previousInMap;
      parent.insertBefore(node2, target);
      delete map[mutation.node.id];
      delete this.legacy_missingNodeRetryMap[mutation.node.id];
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(map, parent, node2, mutation);
      }
    }
    if (nextInMap) {
      const { node: node2, mutation } = nextInMap;
      parent.insertBefore(
        node2,
        target.nextSibling
      );
      delete map[mutation.node.id];
      delete this.legacy_missingNodeRetryMap[mutation.node.id];
      if (mutation.previousId || mutation.nextId) {
        this.legacy_resolveMissingNode(map, parent, node2, mutation);
      }
    }
  }
  moveAndHover(x, y, id, isSync, debugData) {
    const target = this.mirror.getNode(id);
    if (!target) {
      return this.debugNodeNotFound(debugData, id);
    }
    const base = getBaseDimension(target, this.iframe);
    const _x = x * base.absoluteScale + base.x;
    const _y = y * base.absoluteScale + base.y;
    this.mouse.style.left = `${_x}px`;
    this.mouse.style.top = `${_y}px`;
    if (!isSync) {
      this.drawMouseTail({ x: _x, y: _y });
    }
    this.hoverElements(target);
  }
  drawMouseTail(position) {
    if (!this.mouseTail) {
      return;
    }
    const { lineCap, lineWidth, strokeStyle, duration } = this.config.mouseTail === true ? defaultMouseTailConfig : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail);
    const draw = () => {
      if (!this.mouseTail) {
        return;
      }
      const ctx = this.mouseTail.getContext("2d");
      if (!ctx || !this.tailPositions.length) {
        return;
      }
      ctx.clearRect(0, 0, this.mouseTail.width, this.mouseTail.height);
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.strokeStyle = strokeStyle;
      ctx.moveTo(this.tailPositions[0].x, this.tailPositions[0].y);
      this.tailPositions.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    };
    this.tailPositions.push(position);
    draw();
    setTimeout(() => {
      this.tailPositions = this.tailPositions.filter((p) => p !== position);
      draw();
    }, duration / this.speedService.state.context.timer.speed);
  }
  hoverElements(el) {
    var _a2;
    (_a2 = this.lastHoveredRootNode || this.iframe.contentDocument) == null ? void 0 : _a2.querySelectorAll(".\\:hover").forEach((hoveredEl) => {
      hoveredEl.classList.remove(":hover");
    });
    this.lastHoveredRootNode = el.getRootNode();
    let currentEl = el;
    while (currentEl) {
      if (currentEl.classList) {
        currentEl.classList.add(":hover");
      }
      currentEl = currentEl.parentElement;
    }
  }
  isUserInteraction(event) {
    if (event.type !== EventType.IncrementalSnapshot) {
      return false;
    }
    return event.data.source > IncrementalSource.Mutation && event.data.source <= IncrementalSource.Input;
  }
  backToNormal() {
    this.nextUserInteractionEvent = null;
    if (this.speedService.state.matches("normal")) {
      return;
    }
    this.speedService.send({ type: "BACK_TO_NORMAL" });
    this.emitter.emit(ReplayerEvents.SkipEnd, {
      speed: this.speedService.state.context.normalSpeed
    });
  }
  warnNodeNotFound(d, id) {
    this.warn(`Node with id '${id}' not found. `, d);
  }
  warnCanvasMutationFailed(d, error) {
    this.warn(`Has error on canvas update`, error, "canvas mutation:", d);
  }
  debugNodeNotFound(d, id) {
    this.debug(`Node with id '${id}' not found. `, d);
  }
  warn(...args) {
    if (!this.config.showWarning) {
      return;
    }
    this.config.logger.warn(REPLAY_CONSOLE_PREFIX, ...args);
  }
  debug(...args) {
    if (!this.config.showDebug) {
      return;
    }
    this.config.logger.log(REPLAY_CONSOLE_PREFIX, ...args);
  }
}
export {
  Replayer
};
