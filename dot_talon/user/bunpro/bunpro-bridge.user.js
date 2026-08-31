// ==UserScript==
// @name         Bunpro Talon bridge
// @namespace    rjm.talon
// @version      0.1.0
// @description  Publishes the current Bunpro review question's accepted answers (and quiz phase) into document.title as a «BP:phase:a|b» marker, so the Talon bunpro plugin can verify spoken answers before typing them.
// @match        https://bunpro.jp/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Protocol (read by ~/.talon/user/bunpro/bunpro.py):
//   document.title = "<original title> «BP:q:ている|ています»"
//   phase q = question shown / awaiting answer, r = result screen.
//
// Extraction is best-effort against Bunpro's React frontend; the site is a
// moving target. Debugging:
//   localStorage.setItem("bunproTalonDebug", "1")   → console logging
//   window.__bunproTalon                            → live state + sniffed data
// If answers stop being found after a Bunpro redesign, the extractors below
// are the part to fix.

(() => {
  "use strict";

  const JP = /[぀-ヿ一-鿿]/;
  const ANSWER_KEY = /answer|accepted|alternate/i;
  const state = { answers: [], phase: "", sniffed: [], marker: "" };
  window.__bunproTalon = state;

  const debug = (...args) => {
    if (localStorage.getItem("bunproTalonDebug")) {
      console.debug("[bunpro-talon]", ...args);
    }
  };

  // --- Strategy 1: sniff review payloads off fetch/XHR ----------------------
  // Keeps the last few JSON bodies that contain answer-ish keys; mainly a
  // debugging aid for tightening the extractors against the live API.
  const sniff = (url, json) => {
    try {
      const text = JSON.stringify(json);
      if (ANSWER_KEY.test(text) && JP.test(text)) {
        state.sniffed.push({ url, json });
        if (state.sniffed.length > 5) state.sniffed.shift();
        debug("sniffed payload", url);
      }
    } catch (_) { /* ignore */ }
  };

  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url ?? "";
      const clone = res.clone();
      if ((res.headers.get("content-type") || "").includes("json")) {
        clone.json().then((j) => sniff(url, j)).catch(() => {});
      }
    } catch (_) { /* ignore */ }
    return res;
  };

  // --- Strategy 2: walk React fiber props around the quiz ------------------
  // Bunpro's quiz is React; the component owning the answer input receives
  // the question (with accepted answers) as props/state somewhere up the
  // fiber tree. Collect Japanese strings under answer-ish keys.
  const fiberOf = (el) => {
    for (const k of Object.keys(el)) {
      if (k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")) {
        return el[k];
      }
    }
    return null;
  };

  const collectAnswers = (obj, out, depth = 0) => {
    if (!obj || depth > 6) return;
    if (Array.isArray(obj)) {
      for (const v of obj) collectAnswers(v, out, depth + 1);
      return;
    }
    if (typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && ANSWER_KEY.test(k) && JP.test(v)) {
        out.add(v);
      } else if (Array.isArray(v) && ANSWER_KEY.test(k)) {
        for (const s of v) if (typeof s === "string" && JP.test(s)) out.add(s);
      } else if (typeof v === "object" && ANSWER_KEY.test(k)) {
        collectAnswers(v, out, depth + 1);
      }
    }
  };

  const quizInput = () =>
    document.querySelector(
      'input[lang="ja"], input[autocapitalize="none"][type="text"], ' +
        '[class*="quiz"] input[type="text"], [class*="study"] input[type="text"], ' +
        'input[name="answer"], input[placeholder*="答"], main input[type="text"]'
    );

  const extractFromFiber = () => {
    const input = quizInput();
    if (!input) return [];
    const out = new Set();
    let fiber = fiberOf(input);
    for (let i = 0; fiber && i < 25 && out.size === 0; i++, fiber = fiber.return) {
      collectAnswers(fiber.memoizedProps, out);
      collectAnswers(fiber.memoizedState, out);
    }
    return [...out];
  };

  // --- Phase detection ------------------------------------------------------
  const detectPhase = () => {
    const input = quizInput();
    if (input) {
      const cls = `${input.className} ${input.closest("div")?.className ?? ""}`;
      if (input.disabled || input.readOnly || /correct|incorrect|wrong|success|error/i.test(cls)) {
        return "r";
      }
      return "q";
    }
    // Reveal & Grade mode: grade buttons visible means the answer is shown.
    const buttons = [...document.querySelectorAll("button")];
    if (buttons.some((b) => /^(good|again)$/i.test(b.textContent.trim()))) return "r";
    if (buttons.some((b) => /show answer|reveal/i.test(b.textContent.trim()))) return "q";
    return "";
  };

  // --- Title marker ---------------------------------------------------------
  const MARKER = /\s*«BP:[^»]*»/g;
  let lastSet = "";

  const updateTitle = () => {
    const onQuiz = /\/(reviews|cram|learn|study)/.test(location.pathname);
    state.phase = onQuiz ? detectPhase() : "";
    state.answers = onQuiz && state.phase ? extractFromFiber() : [];

    const clean = (s) => s.replace(/[«»|]/g, "").slice(0, 40);
    const payload = state.answers.map(clean).filter(Boolean).slice(0, 6).join("|");
    const marker = state.phase ? ` «BP:${state.phase}:${payload}»` : "";
    state.marker = marker;

    const base = document.title.replace(MARKER, "");
    const wanted = base + marker;
    if (document.title !== wanted) {
      lastSet = wanted;
      document.title = wanted;
      debug("title →", wanted);
    }
  };

  // React rewrites the title on route changes; re-append after it does.
  const start = () => {
    setInterval(updateTitle, 500);
    const titleEl = document.querySelector("title");
    if (titleEl) {
      new MutationObserver(() => {
        if (document.title !== lastSet) updateTitle();
      }).observe(titleEl, { childList: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
