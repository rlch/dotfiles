// The status bar's segment: each account's 5-hour use, its weeks in the tooltip.
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
const pct = (n: number | null) => (n === null ? "?" : `${Math.round(n)}%`);

function Account({ a }: { a: Seen }) {
  const lines = a.error
    ? [a.error]
    : [
        `5 hours ${pct(a.five)}${a.fiveResets ? `, resets in ${until(a.fiveResets)}` : ""}`,
        `7 days ${pct(a.seven)}${a.sevenResets ? `, resets in ${until(a.sevenResets)}` : ""}`,
        ...a.windows.filter((w) => w.utilization !== null).map((w) => `${w.name} ${pct(w.utilization)}${w.resetsAt ? `, resets in ${until(w.resetsAt)}` : ""}`),
      ];
  if (a.agents) lines.push(`${a.agents} ${a.agents === 1 ? "agent" : "agents"} on it`);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span data-account={a.slug} className="tabular-nums" style={{ opacity: a.capped || a.error ? 0.45 : 1 }}>
          {a.slug} {a.error ? "–" : pct(a.five)}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

export function Quota() {
  const seen = useStore(accounts.server.view(), (s) => (s as { accounts: Seen[] } | undefined)?.accounts ?? null);
  if (!seen?.length) return null;
  return (
    <span className="inline-flex items-center gap-2.5">
      {seen.map((a) => (
        <Account key={a.slug} a={a} />
      ))}
    </span>
  );
}
