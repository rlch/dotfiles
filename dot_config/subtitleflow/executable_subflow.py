#!/usr/bin/env python3
import argparse
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

BASE = "https://subtitlecat.com"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

MOVIES_DIR = "/Users/rjm/Server/data/media/movies"
TV_DIR = "/Users/rjm/Server/data/media/tv"

@dataclass
class Cue:
    idx: int
    timecode: str
    text: str


def _parse_srt_ts(ts: str) -> int:
    # "HH:MM:SS,mmm" -> milliseconds
    h, m, rest = ts.split(":")
    s, ms = rest.split(",")
    return ((int(h) * 3600 + int(m) * 60 + int(s)) * 1000) + int(ms)


def _fmt_srt_ts(total_ms: int) -> str:
    if total_ms < 0:
        total_ms = 0
    h = total_ms // 3600000
    rem = total_ms % 3600000
    m = rem // 60000
    rem %= 60000
    s = rem // 1000
    ms = rem % 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def parse_flexible_ts(ts: str) -> int:
    # Accepts: HH:MM:SS,mmm | HH:MM:SS.mmm | HH:MM:SS | MM:SS(.mmm)
    t = ts.strip().replace(",", ".")
    if re.fullmatch(r"\d{2}:\d{2}:\d{2}\.\d{1,3}", t):
        hh, mm, rest = t.split(":")
        ss, ms = rest.split(".")
        ms = (ms + "000")[:3]
        return ((int(hh) * 3600 + int(mm) * 60 + int(ss)) * 1000) + int(ms)
    if re.fullmatch(r"\d{2}:\d{2}:\d{2}", t):
        hh, mm, ss = t.split(":")
        return (int(hh) * 3600 + int(mm) * 60 + int(ss)) * 1000
    if re.fullmatch(r"\d{1,2}:\d{2}\.\d{1,3}", t):
        mm, rest = t.split(":")
        ss, ms = rest.split(".")
        ms = (ms + "000")[:3]
        return ((int(mm) * 60 + int(ss)) * 1000) + int(ms)
    if re.fullmatch(r"\d{1,2}:\d{2}", t):
        mm, ss = t.split(":")
        return (int(mm) * 60 + int(ss)) * 1000
    raise ValueError(f"Unsupported time format: {ts}")


def shift_timecode(tc: str, delay_seconds: float) -> str:
    # "start --> end"
    if "-->" not in tc:
        return tc
    start_raw, end_raw = [x.strip() for x in tc.split("-->", 1)]
    delta = int(round(delay_seconds * 1000))
    try:
        start_ms = _parse_srt_ts(start_raw) + delta
        end_ms = _parse_srt_ts(end_raw) + delta
        return f"{_fmt_srt_ts(start_ms)} --> {_fmt_srt_ts(end_ms)}"
    except Exception:
        return tc


def apply_delay(cues: List[Cue], delay_seconds: float) -> List[Cue]:
    if abs(delay_seconds) < 1e-9:
        return cues
    out: List[Cue] = []
    for c in cues:
        out.append(Cue(idx=c.idx, timecode=shift_timecode(c.timecode, delay_seconds), text=c.text))
    return out


def http_get(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")


def http_get_bytes(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def http_post(url: str, data: dict, timeout: int = 30) -> str:
    payload = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=payload, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")


def abs_url(path_or_url: str) -> str:
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        p = urllib.parse.urlsplit(path_or_url)
        safe_path = urllib.parse.quote(urllib.parse.unquote(p.path), safe="/%-_.~")
        return urllib.parse.urlunsplit((p.scheme, p.netloc, safe_path, p.query, p.fragment))
    if not path_or_url.startswith("/"):
        path_or_url = "/" + path_or_url
    safe_path = urllib.parse.quote(urllib.parse.unquote(path_or_url), safe="/%-_.~")
    return BASE + safe_path


def slug(s: str) -> str:
    s = re.sub(r"[\s_]+", ".", s.strip())
    s = re.sub(r"[^A-Za-z0-9.\-]+", "", s)
    s = re.sub(r"\.+", ".", s).strip(".")
    return s or "subtitle"


def parse_srt(s: str) -> List[Cue]:
    s = s.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not s:
        return []
    blocks = re.split(r"\n\s*\n", s)
    cues: List[Cue] = []
    for b in blocks:
        lines = [ln.rstrip() for ln in b.split("\n") if ln.strip() != ""]
        if len(lines) < 2:
            continue
        idx_line = lines[0].strip()
        if re.fullmatch(r"\d+", idx_line):
            idx = int(idx_line)
            if len(lines) < 3:
                continue
            timecode = lines[1].strip()
            text = "\n".join(lines[2:]).strip()
        else:
            idx = len(cues) + 1
            timecode = lines[0].strip()
            text = "\n".join(lines[1:]).strip()
        cues.append(Cue(idx=idx, timecode=timecode, text=text))
    return cues


def render_srt(cues: List[Cue]) -> str:
    out = []
    for i, c in enumerate(cues, 1):
        out.append(str(i))
        out.append(c.timecode)
        out.append(c.text.strip())
        out.append("")
    return "\n".join(out).rstrip() + "\n"


def find_cue_start_ms_by_text(cues: List[Cue], snippet: str) -> Tuple[int, Cue]:
    needle = re.sub(r"\s+", " ", snippet.strip().lower())
    if not needle:
        raise ValueError("snippet cannot be empty")

    # First pass: exact substring match
    for c in cues:
        hay = re.sub(r"\s+", " ", c.text.lower())
        if needle in hay:
            start = c.timecode.split("-->", 1)[0].strip()
            return _parse_srt_ts(start), c

    # Second pass: token overlap score
    tokens = [t for t in re.split(r"\W+", needle) if t]
    best = None
    best_score = 0
    for c in cues:
        hay = c.text.lower()
        score = sum(1 for t in tokens if t in hay)
        if score > best_score:
            best_score = score
            best = c
    if best is None or best_score == 0:
        raise ValueError("No matching cue found")
    start = best.timecode.split("-->", 1)[0].strip()
    return _parse_srt_ts(start), best


def extract_result_pages(search_html: str) -> List[str]:
    links = re.findall(r'href="(subs/\d+/[^"#?]+\.html)"', search_html, re.I)
    # de-dupe preserving order
    seen = set()
    out = []
    for l in links:
        if l not in seen:
            seen.add(l)
            out.append("/" + l)
    return out


def rank_pages(
    pages: List[str],
    query: str,
    show: str = "",
    season_episode: str = "",
    prefer_tags: Optional[List[str]] = None,
    avoid_tags: Optional[List[str]] = None,
    require_tags: Optional[List[str]] = None,
    forbid_tags: Optional[List[str]] = None,
) -> List[str]:
    q_tokens = [t for t in re.split(r"\W+", query.lower()) if t]
    show_tokens = [t for t in re.split(r"\W+", show.lower()) if t]
    se = season_episode.lower()
    prefer_tags = [t.lower() for t in (prefer_tags or []) if t.strip()]
    avoid_tags = [t.lower() for t in (avoid_tags or []) if t.strip()]
    require_tags = [t.lower() for t in (require_tags or []) if t.strip()]
    forbid_tags = [t.lower() for t in (forbid_tags or []) if t.strip()]

    filtered = []
    for p in pages:
        name = urllib.parse.unquote(p).lower()
        if require_tags and not any(t in name for t in require_tags):
            continue
        if forbid_tags and any(t in name for t in forbid_tags):
            continue
        filtered.append(p)

    def score(p: str) -> int:
        name = urllib.parse.unquote(p).lower()
        s = 0
        for t in q_tokens:
            if t in name:
                s += 1
        for t in show_tokens:
            if t in name:
                s += 4
        if se and se in name:
            s += 10
        for t in prefer_tags:
            if t in name:
                s += 8
        for t in avoid_tags:
            if t in name:
                s -= 8
        return s

    return sorted(filtered, key=score, reverse=True)


def extract_srt_links(detail_html: str) -> List[str]:
    links = re.findall(r'href="([^"]+\.srt)"', detail_html, re.I)
    out = []
    seen = set()
    for l in links:
        u = abs_url(html.unescape(l))
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def extract_orig_for_translate(detail_html: str) -> Optional[str]:
    m = re.search(r"translate_from_server_folder\('\w[\w\-]*',\s*'([^']+\.srt)',\s*'([^']+)'\)", detail_html)
    if not m:
        return None
    fname = m.group(1)
    folder = m.group(2)
    if not folder.endswith("/"):
        folder += "/"
    return abs_url(folder + fname)


def lang_aliases(lang: str) -> List[str]:
    l = lang.strip().lower().replace("_", "-")
    aliases = [l]
    if l == "en":
        aliases += ["eng"]
    if l.startswith("zh"):
        aliases += ["zh", "chi", "zho"]
        if l in ("zh-cn", "zh-hans"):
            aliases += ["zh-cn", "zh-hans"]
        if l in ("zh-tw", "zh-hant"):
            aliases += ["zh-tw", "zh-hant"]
    return list(dict.fromkeys(aliases))


def pick_lang_link(srt_links: List[str], lang: str) -> Optional[str]:
    aliases = lang_aliases(lang)
    best = None
    best_score = -10**9
    for u in srt_links:
        lu = u.lower()
        score = -1000
        for a in aliases:
            if f"-{a}.srt" in lu or f".{a}.srt" in lu:
                score = max(score, 120)
            if f"_{a}.srt" in lu:
                score = max(score, 110)
            if f"/{a}/" in lu or f"-{a}-" in lu or f".{a}." in lu:
                score = max(score, 80)
            if a in lu:
                score = max(score, 30)
        if lang.lower() in ("en", "eng") and ("orig.srt" in lu or "english" in lu):
            score = max(score, 70)
        if score > best_score:
            best_score = score
            best = u if score >= 0 else best
    return best


def translate_text_line(line: str, target_lang: str = "zh-CN") -> str:
    if not line.strip():
        return line
    q = urllib.parse.quote(line)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={q}"
    for _ in range(3):
        try:
            raw = http_get(url, timeout=45)
            data = json.loads(raw)
            return "".join(part[0] for part in data[0] if part and part[0] is not None)
        except Exception:
            time.sleep(0.2)
    return line


def translate_srt_locally(source_srt: str, target_lang: str = "zh-CN", sleep_s: float = 0.05) -> str:
    cues = parse_srt(source_srt)
    out = []
    for c in cues:
        parts = c.text.split("\n")
        zh_parts = [translate_text_line(p, target_lang=target_lang) for p in parts]
        out.append(Cue(idx=c.idx, timecode=c.timecode, text="\n".join(zh_parts)))
        if sleep_s:
            time.sleep(sleep_s)
    return render_srt(out)


def get_gcp_access_token() -> str:
    token = os.environ.get("GCP_ACCESS_TOKEN", "").strip()
    if token:
        return token
    try:
        p = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True,
        )
        tok = p.stdout.strip()
        if tok:
            return tok
    except Exception:
        pass
    raise RuntimeError("Could not obtain GCP access token. Set GCP_ACCESS_TOKEN or run: gcloud auth login")


def gcp_translate_texts(contents: List[str], target_lang: str, source_lang: Optional[str], project: str, location: str = "global") -> List[str]:
    if not contents:
        return []
    token = get_gcp_access_token()
    url = f"https://translation.googleapis.com/v3/projects/{urllib.parse.quote(project, safe='')}/locations/{urllib.parse.quote(location, safe='')}:translateText"
    payload = {
        "targetLanguageCode": target_lang,
        "mimeType": "text/plain",
        "contents": contents,
    }
    if source_lang:
        payload["sourceLanguageCode"] = source_lang

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "User-Agent": UA,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "x-goog-user-project": project,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        raw = r.read().decode("utf-8", "ignore")
    data = json.loads(raw)
    out = [x.get("translatedText", "") for x in data.get("translations", [])]
    if len(out) != len(contents):
        raise RuntimeError(f"Unexpected translation count from GCP: {len(out)} != {len(contents)}")
    return out


def translate_srt_gcp(
    source_srt: str,
    target_lang: str = "zh-CN",
    source_lang: Optional[str] = "en",
    project: Optional[str] = None,
    location: str = "global",
    batch_size: int = 120,
) -> str:
    project = (project or os.environ.get("GCP_PROJECT") or os.environ.get("GOOGLE_CLOUD_PROJECT") or "").strip()
    if not project:
        raise RuntimeError("Missing GCP project. Set --project or env GCP_PROJECT/GOOGLE_CLOUD_PROJECT")

    cues = parse_srt(source_srt)
    if not cues:
        return source_srt

    texts = [c.text for c in cues]
    translated: List[str] = []
    bs = max(1, batch_size)
    for i in range(0, len(texts), bs):
        chunk = texts[i : i + bs]
        translated.extend(
            gcp_translate_texts(
                chunk,
                target_lang=target_lang,
                source_lang=source_lang,
                project=project,
                location=location,
            )
        )

    out = [Cue(idx=c.idx, timecode=c.timecode, text=t) for c, t in zip(cues, translated)]
    return render_srt(out)


def merge_two_lang(top_srt: str, bottom_srt: str) -> str:
    top_cues = parse_srt(top_srt)
    bottom_cues = parse_srt(bottom_srt)
    n = max(len(top_cues), len(bottom_cues))
    out: List[Cue] = []
    for i in range(n):
        tc = top_cues[i] if i < len(top_cues) else None
        bc = bottom_cues[i] if i < len(bottom_cues) else None
        timecode = (tc.timecode if tc else bc.timecode) if (tc or bc) else ""
        top_text = tc.text if tc else ""
        bottom_text = bc.text if bc else ""
        text = (top_text + "\n" + bottom_text).strip()
        out.append(Cue(idx=i + 1, timecode=timecode, text=text))
    return render_srt(out)


def parse_episode_list(spec: str) -> List[int]:
    out: List[int] = []
    for part in [p.strip() for p in spec.split(",") if p.strip()]:
        if "-" in part:
            a, b = part.split("-", 1)
            start = int(a)
            end = int(b)
            step = 1 if end >= start else -1
            out.extend(list(range(start, end + step, step)))
        else:
            out.append(int(part))
    seen = set()
    uniq = []
    for e in out:
        if e not in seen:
            seen.add(e)
            uniq.append(e)
    return uniq


def default_episodes_for_show(show: str, season: int) -> Optional[List[int]]:
    if show.strip().lower() == "succession":
        counts = {1: 10, 2: 10, 3: 9, 4: 10}
        if season in counts:
            return list(range(1, counts[season] + 1))
    return None


def ssh_remote_path_exists(host: str, path: str) -> bool:
    cmd = f"ssh {host} 'test -d {sh_quote(path)}'"
    return os.system(cmd + " >/dev/null 2>&1") == 0


def sh_quote(s: str) -> str:
    return "'" + s.replace("'", "'\\''") + "'"


def push_file(host: str, local_file: Path, remote_dir: str) -> None:
    mk_cmd = f"ssh {host} mkdir -p {sh_quote(remote_dir)}"
    mk_rc = os.system(mk_cmd)
    if mk_rc != 0:
        raise RuntimeError(f"remote mkdir failed (exit {mk_rc})")
    cmd = f"scp {sh_quote(str(local_file))} {sh_quote(host + ':' + remote_dir + '/') }"
    rc = os.system(cmd)
    if rc != 0:
        raise RuntimeError(f"scp failed (exit {rc})")


def run_fetch(args, query: str, show_override: Optional[str] = None, season_episode_override: Optional[str] = None) -> int:
    wd = Path(args.workdir)
    wd.mkdir(parents=True, exist_ok=True)

    show_name = show_override if show_override is not None else args.show
    season_episode = season_episode_override if season_episode_override is not None else args.season_episode

    search_url = BASE + "/index.php?" + urllib.parse.urlencode({"search": query})
    search_html = http_get(search_url)
    pages = extract_result_pages(search_html)
    if not pages:
        print(f"No SubtitleCat result pages found for query: {query}", file=sys.stderr)
        return 2

    ranked_pages = rank_pages(
        pages,
        query,
        show=show_name,
        season_episode=season_episode,
        prefer_tags=args.prefer_tag,
        avoid_tags=args.avoid_tag,
        require_tags=args.require_tag,
        forbid_tags=args.forbid_tag,
    )

    detail_url = ""
    detail_html = ""
    top_link = None
    bottom_link = None
    fallback = None

    for pth in ranked_pages[:8]:
        u = abs_url(pth)
        h = http_get(u)
        srt_links = extract_srt_links(h)
        top = pick_lang_link(srt_links, args.top_lang)
        bottom = pick_lang_link(srt_links, args.bottom_lang)
        if top and bottom:
            detail_url, detail_html, top_link, bottom_link = u, h, top, bottom
            break
        if (top or bottom) and fallback is None:
            fallback = (u, h, top, bottom)

    if not detail_url and fallback:
        detail_url, detail_html, top_link, bottom_link = fallback

    if not detail_url:
        print("Could not find usable subtitle page in top candidates.", file=sys.stderr)
        return 3

    if not top_link and args.top_lang.lower() in ("en", "eng"):
        top_link = extract_orig_for_translate(detail_html)
    if not top_link and not bottom_link:
        print(f"Could not find either requested language link ({args.top_lang}, {args.bottom_lang}).", file=sys.stderr)
        return 3

    print(f"Selected page: {detail_url}")
    print(f"Top language: {args.top_lang}")
    print(f"Bottom language: {args.bottom_lang}")
    print(f"Top source: {top_link or 'missing (will translate)'}")
    print(f"Bottom source: {bottom_link or 'missing (will translate)'}")

    top_srt = http_get_bytes(top_link).decode("utf-8", "ignore") if top_link else ""
    bottom_srt = http_get_bytes(bottom_link).decode("utf-8", "ignore") if bottom_link else ""

    if not top_srt and bottom_srt:
        top_srt = translate_srt_locally(bottom_srt, target_lang=args.top_lang)
    if not bottom_srt and top_srt:
        bottom_srt = translate_srt_locally(top_srt, target_lang=args.bottom_lang)

    if not top_srt or not bottom_srt:
        print("Could not produce both subtitle tracks after fallback translation.", file=sys.stderr)
        return 3

    merged = merge_two_lang(top_srt, bottom_srt)

    fetch_type = getattr(args, "type", "tv")
    if fetch_type == "movie":
        base = slug(query)
        out_name = f"{base}.{slug(args.bottom_lang)}.srt"
        remote_dir = args.movies_dir
    else:
        if not show_name:
            print("--show is required for --type tv", file=sys.stderr)
            return 4
        show_slug = slug(show_name)
        se = slug(season_episode) if season_episode else ""
        lang_tag = slug(args.bottom_lang)
        out_name = f"{show_slug}.{se}.{lang_tag}.srt" if se else f"{show_slug}.{lang_tag}.srt"
        remote_dir = f"{args.tv_dir}/{show_name}"

    out_file = wd / out_name
    out_file.write_text(merged, encoding="utf-8")
    print(f"Merged subtitle written: {out_file}")

    if args.dry_run:
        print("Dry run: skipping push")
        return 0

    if not ssh_remote_path_exists(args.host, remote_dir):
        print(f"Warning: remote dir not found: {remote_dir}")

    push_file(args.host, out_file, remote_dir)
    print(f"Pushed to {args.host}:{remote_dir}/{out_name}")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="Headless subtitle fetcher + merger + pusher")
    sub = p.add_subparsers(dest="cmd", required=True)

    fetch = sub.add_parser("fetch", help="Fetch/merge/push subtitles")
    fetch.add_argument("query", help="Search query, e.g. 'Breaking Bad S01E01' or 'Oppenheimer 2023'")
    fetch.add_argument("--type", choices=["movie", "tv"], required=True)
    fetch.add_argument("--show", default="", help="TV show base name for output naming (required for --type tv)")
    fetch.add_argument("--season-episode", default="", help="For tv naming, e.g. S01E01")
    fetch.add_argument("--host", default="richards-mac-mini")
    fetch.add_argument("--movies-dir", default=MOVIES_DIR)
    fetch.add_argument("--tv-dir", default=TV_DIR)
    fetch.add_argument("--workdir", default=str(Path.home() / "Downloads" / "subtitleflow"))
    fetch.add_argument("--top-lang", default="en", help="Top subtitle language code (default: en)")
    fetch.add_argument("--bottom-lang", default="zh-CN", help="Bottom subtitle language code (default: zh-CN)")
    fetch.add_argument("--prefer-tag", action="append", default=[], help="Prefer release tags (repeatable), e.g. --prefer-tag web --prefer-tag amzn")
    fetch.add_argument("--avoid-tag", action="append", default=[], help="De-prioritize release tags (repeatable), e.g. --avoid-tag bluray")
    fetch.add_argument("--require-tag", action="append", default=[], help="Hard-require page slug to contain one of these tags")
    fetch.add_argument("--forbid-tag", action="append", default=[], help="Hard-forbid page slug containing any of these tags")
    fetch.add_argument("--dry-run", action="store_true")

    batch = sub.add_parser("fetch-tv-season", help="Fetch/merge/push a whole TV season")
    batch.add_argument("--show", required=True)
    batch.add_argument("--season", type=int, required=True)
    batch.add_argument("--episodes", default="", help="Episode list like 1-10 or 1,2,5. If omitted, uses known defaults for some shows.")
    batch.add_argument("--host", default="richards-mac-mini")
    batch.add_argument("--movies-dir", default=MOVIES_DIR)
    batch.add_argument("--tv-dir", default=TV_DIR)
    batch.add_argument("--workdir", default=str(Path.home() / "Downloads" / "subtitleflow"))
    batch.add_argument("--top-lang", default="en")
    batch.add_argument("--bottom-lang", default="zh-CN")
    batch.add_argument("--prefer-tag", action="append", default=[])
    batch.add_argument("--avoid-tag", action="append", default=[])
    batch.add_argument("--require-tag", action="append", default=[])
    batch.add_argument("--forbid-tag", action="append", default=[])
    batch.add_argument("--dry-run", action="store_true")

    shift = sub.add_parser("shift", help="Shift timing on an existing downloaded .srt")
    shift.add_argument("input", help="Path to existing .srt file")
    shift.add_argument("--seconds", type=float, required=True, help="Positive or negative delay in seconds")
    shift.add_argument("--in-place", action="store_true", help="Overwrite input file")
    shift.add_argument("--output", default="", help="Output path (default: <name>.shifted.srt)")

    infer = sub.add_parser("infer-delay", help="Infer delay from a known spoken line and observed playback time")
    infer.add_argument("input", help="Path to subtitle .srt file")
    infer.add_argument("--line", required=True, help="A snippet of spoken subtitle text")
    infer.add_argument("--at", required=True, dest="observed_at", help="Observed playback time when line is spoken (e.g. 00:12:34.500)")

    tr = sub.add_parser("translate-gcp", help="Translate subtitle via Google Cloud Translate v3 (batched)")
    tr.add_argument("input", help="Source .srt path")
    tr.add_argument("--output", required=True, help="Output .srt path")
    tr.add_argument("--source-lang", default="en")
    tr.add_argument("--target-lang", default="zh-CN")
    tr.add_argument("--project", default="")
    tr.add_argument("--location", default="global")
    tr.add_argument("--batch-size", type=int, default=120)
    tr.add_argument("--merge-bilingual", action="store_true", help="Write EN top + translated bottom")

    args = p.parse_args()

    if args.cmd == "shift":
        in_path = Path(args.input).expanduser()
        if not in_path.exists():
            print(f"Input file not found: {in_path}", file=sys.stderr)
            return 2
        src = in_path.read_text(encoding="utf-8", errors="ignore")
        shifted = render_srt(apply_delay(parse_srt(src), args.seconds))
        out_path = in_path if args.in_place else (Path(args.output).expanduser() if args.output else Path(str(in_path.with_suffix("")) + ".shifted.srt"))
        out_path.write_text(shifted, encoding="utf-8")
        print(f"Applied delay: {args.seconds:+.3f}s")
        print(f"Wrote shifted subtitle: {out_path}")
        return 0

    if args.cmd == "infer-delay":
        in_path = Path(args.input).expanduser()
        if not in_path.exists():
            print(f"Input file not found: {in_path}", file=sys.stderr)
            return 2
        src = in_path.read_text(encoding="utf-8", errors="ignore")
        cues = parse_srt(src)
        if not cues:
            print("No cues parsed from subtitle file.", file=sys.stderr)
            return 2
        try:
            observed_ms = parse_flexible_ts(args.observed_at)
            cue_ms, matched = find_cue_start_ms_by_text(cues, args.line)
        except Exception as e:
            print(f"infer-delay failed: {e}", file=sys.stderr)
            return 2

        delay_ms = observed_ms - cue_ms
        delay_s = delay_ms / 1000.0
        print(f"Matched cue: #{matched.idx} {matched.timecode}")
        print(f"Matched text: {matched.text.splitlines()[0]}")
        print(f"Observed at: {args.observed_at}")
        print(f"Suggested delay seconds: {delay_s:+.3f}")
        print("Apply with:")
        print(f"  subflow shift {sh_quote(str(in_path))} --seconds {delay_s:+.3f} --in-place")
        return 0

    if args.cmd == "translate-gcp":
        in_path = Path(args.input).expanduser()
        out_path = Path(args.output).expanduser()
        if not in_path.exists():
            print(f"Input file not found: {in_path}", file=sys.stderr)
            return 2
        src = in_path.read_text(encoding="utf-8", errors="ignore")
        translated = translate_srt_gcp(
            src,
            target_lang=args.target_lang,
            source_lang=(args.source_lang or None),
            project=(args.project or None),
            location=args.location,
            batch_size=args.batch_size,
        )
        final_out = merge_two_lang(src, translated) if args.merge_bilingual else translated
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(final_out, encoding="utf-8")
        print(f"Translated subtitle written: {out_path}")
        if args.merge_bilingual:
            print("Format: EN top + translated bottom")
        return 0

    if args.cmd == "fetch":
        return run_fetch(args, args.query)

    episodes = parse_episode_list(args.episodes) if args.episodes else default_episodes_for_show(args.show, args.season)
    if not episodes:
        print("No episode list provided and no built-in default for this show/season.", file=sys.stderr)
        return 2

    failures = 0
    for ep in episodes:
        se = f"S{args.season:02d}E{ep:02d}"
        q = f"{args.show} {se}"
        print(f"\n=== {q} ===")
        rc = run_fetch(args, q, show_override=args.show, season_episode_override=se)
        if rc != 0:
            failures += 1
            print(f"Failed: {q} (rc={rc})", file=sys.stderr)

    if failures:
        print(f"Completed with failures: {failures}/{len(episodes)}", file=sys.stderr)
        return 1
    print(f"Completed successfully: {len(episodes)} episodes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
