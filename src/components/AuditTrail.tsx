import { ScrollText } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';

export function AuditTrailPanel({
  limit = 8,
  compact = false,
}: {
  limit?: number;
  compact?: boolean;
}) {
  const { state } = useApp();
  const t = useT();
  const entries = state.auditTrail.slice(0, limit);

  const list = (
    <div className={`overflow-y-auto divide-y divide-border ${compact ? 'max-h-48' : 'max-h-64'}`}>
      {entries.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">No events yet</p>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="px-4 py-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-800">{e.event}</span>
              <time className="shrink-0 text-slate-400">
                {new Date(e.timestamp).toLocaleTimeString()}
              </time>
            </div>
            <div className="mt-0.5 text-slate-500">
              {e.actor} · {e.actorRole}
              {e.details && ` · ${e.details}`}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (compact) return list;

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <ScrollText className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold">{t('nav.audit')}</h3>
      </div>
      {list}
    </div>
  );
}
