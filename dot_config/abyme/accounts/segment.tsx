// The status bar's segment: a pip per account and how many have quota left; the tooltip is the table.
import accounts from "@abyme/accounts";
import { useStore } from "@abyme/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@abyme/ui/components/ui/tooltip";

type Seen = {
  slug: string;
  five: number | null;
  seven: number | null;
  fiveResets: string | null;
  sevenResets: string | null;
  windows: { name: string; utilization: number | null; resetsAt: string | null }[];
  capped: boolean;
  error: string | null;
  agents: number;
};

/** "4h 12m", "2d 3h", "9m" until an RFC 3339 time. */
function until(at: string | null): string {
  if (!at) return "";
  const s = Math.max(0, (Date.parse(at) - Date.now()) / 1000);
  const [d, h, m] = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60)];
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}
const pct = (n: number | null) => (n === null ? "" : `${Math.round(n)}%`);

/** What an account's error means, in the operator's words. */
const SAID: Record<string, string> = {
  "no credentials": "not signed in",
  unauthorized: "signed out",
  "not read yet": "not read yet",
};
const said = (error: string) => SAID[error] ?? (error.includes("429") ? "rate limited" : error);

/** Usable accounts first, the emptiest on top; then the spent, then the unreadable. */
function ordered(seen: Seen[]): Seen[] {
  const rank = (a: Seen) => (a.error ? 2 : a.capped ? 1 : 0);
  return [...seen].sort((a, b) => rank(a) - rank(b) || (a.five ?? 0) - (b.five ?? 0) || a.slug.localeCompare(b.slug));
}

/** What is worth saying beside an account: when it is back, a model window nearly spent, who is on it. */
function note(a: Seen): string {
  if (a.error) return said(a.error);
  const said_: string[] = [];
  if (a.capped && a.fiveResets) said_.push(`back in ${until(a.fiveResets)}`);
  for (const w of a.windows) if ((w.utilization ?? 0) >= 80) said_.push(`${w.name} ${pct(w.utilization)}`);
  if (a.agents) said_.push(`${a.agents} ${a.agents === 1 ? "agent" : "agents"}`);
  return said_.join(" · ");
}

/** A bar filled to `n` percent, in the text's own colour so it reads on any surface. */
function Meter({ n, spent }: { n: number | null; spent?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ position: "relative", width: 40, height: 4, borderRadius: 2, overflow: "hidden" }}>
        <span style={{ position: "absolute", inset: 0, background: "currentColor", opacity: 0.2 }} />
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${Math.min(100, Math.max(0, n ?? 0))}%`,
            background: spent ? "var(--warning)" : "currentColor",
          }}
        />
      </span>
      <span style={{ width: "4ch", textAlign: "right" }}>{pct(n)}</span>
    </span>
  );
}

/** One account as a pip: how full its five hours are; amber when spent, faint when unreadable. */
function Pip({ a }: { a: Seen }) {
  const fill = a.error ? 0 : a.capped ? 100 : Math.max(8, a.five ?? 0);
  return (
    <span style={{ position: "relative", width: 3, height: 10, borderRadius: 1, overflow: "hidden" }}>
      <span style={{ position: "absolute", inset: 0, background: "currentColor", opacity: a.error ? 0.12 : 0.25 }} />
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${fill}%`,
          background: a.capped ? "var(--warning)" : "currentColor",
        }}
      />
    </span>
  );
}

export function Quota() {
  const seen = useStore(accounts.server.view(), (s) => (s as { accounts: Seen[] } | undefined)?.accounts ?? null);
  if (!seen?.length) return null;
  const rows = ordered(seen);
  const free = rows.filter((a) => !a.capped && !a.error).length;
  const back = rows.filter((a) => a.capped && a.fiveResets).map((a) => a.fiveResets!).sort()[0];
  const faint = { opacity: 0.6 };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span data-accounts className="tabular-nums" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2 }}>
            {rows.map((a) => (
              <Pip key={a.slug} a={a} />
            ))}
          </span>
          <span style={free ? undefined : { color: "var(--warning)" }}>
            {free ? `${free} free` : back ? `back in ${until(back)}` : "none free"}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" align="end" className="tabular-nums" style={{ padding: "8px 10px", maxWidth: "none" }}>
        <div style={{ whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>Claude accounts</span>
          <span style={faint}>
            {free} of {seen.length} have quota
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto auto auto", columnGap: 14, rowGap: 3, alignItems: "center" }}>
          <span />
          <span style={faint}>5 hours</span>
          <span style={faint}>7 days</span>
          <span />
          {rows.map((a) => (
            <div key={a.slug} style={{ display: "contents" }}>
              <span style={a.error ? faint : undefined}>{a.slug}</span>
              {a.error ? (
                <span style={{ ...faint, gridColumn: "span 3" }}>{note(a)}</span>
              ) : (
                <>
                  <Meter n={a.five} spent={a.capped} />
                  <Meter n={a.seven} spent={(a.seven ?? 0) >= 100} />
                  <span style={faint}>{note(a)}</span>
                </>
              )}
            </div>
          ))}
        </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
