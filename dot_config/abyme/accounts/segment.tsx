// The status bar's segment: how many accounts have quota left, each account in the tooltip.
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

/** One account's line in the tooltip. */
function line(a: Seen): string {
  if (a.error) return `${a.slug}: ${a.error}`;
  const models = a.windows.filter((w) => w.utilization !== null).map((w) => ` ${w.name} ${pct(w.utilization)}`).join("");
  const reset = a.capped && a.fiveResets ? `, back in ${until(a.fiveResets)}` : "";
  const on = a.agents ? `, ${a.agents} ${a.agents === 1 ? "agent" : "agents"}` : "";
  return `${a.slug}: 5h ${pct(a.five)} 7d ${pct(a.seven)}${models}${reset}${on}`;
}

export function Quota() {
  const seen = useStore(accounts.server.view(), (s) => (s as { accounts: Seen[] } | undefined)?.accounts ?? null);
  if (!seen?.length) return null;
  const free = seen.filter((a) => !a.capped && !a.error).length;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span data-accounts className="tabular-nums" style={{ opacity: free ? 1 : 0.45 }}>
          {free}/{seen.length} accounts
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        {seen.map((a) => (
          <div key={a.slug}>{line(a)}</div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
