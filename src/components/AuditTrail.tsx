import { ScrollText } from 'lucide-react';
import { useApp, useT } from '../context/AppContext';

export function AuditTrailPanel({
  limit = 8,
  compact = false,
  internal = false,
}: {
  limit?: number;
  compact?: boolean;
  /** Dark styling for Demo Director — not shown to end users */
  internal?: boolean;
}) {
  const { state } = useApp();
  const t = useT();
  const entries = state.auditTrail.slice(0, limit);

  const list = (
    <div
      className={`overflow-y-auto divide-y ${
        internal ? 'max-h-36 divide-white/10' : 'max-h-64 divide-border'
      } ${compact && !internal ? 'max-h-48' : ''}`}
    >
      {entries.length === 0 ? (
        <p className={`p-3 text-xs ${internal ? 'text-white/50' : 'text-slate-500'}`}>
          No events yet
        </p>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="px-3 py-2 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className={`font-medium ${internal ? 'text-white/90' : 'text-slate-800'}`}>
                {e.event}
              </span>
              <time className={`shrink-0 ${internal ? 'text-white/40' : 'text-slate-400'}`}>
                {new Date(e.timestamp).toLocaleTimeString()}
              </time>
            </div>
            <div className={`mt-0.5 ${internal ? 'text-white/50' : 'text-slate-500'}`}>
              {e.actor} · {e.actorRole}
              {e.details && ` · ${e.details}`}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (compact || internal) return list;

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
