import { AlertTriangle, CheckCircle2, CircleHelp, Loader2, XCircle } from 'lucide-react'

import type { WisdomReviewCheck, WisdomReviewCheckRow, WisdomReviewStatus } from '@/lib/api'
import { useI18n } from '@/i18n'
import { en } from '@/i18n/en'

function statusLabel(status: WisdomReviewStatus, labels: Record<string, string>): string {
  return labels[status] ?? status.replaceAll('_', ' ').replace(/^./, value => value.toUpperCase())
}

function StatusIcon({ status }: { status: WisdomReviewStatus }) {
  if (status === 'pass') return <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
  if (status === 'blocked') return <XCircle aria-hidden className="h-3.5 w-3.5" />
  if (status === 'pending' || status === 'retry' || status === 'running') {
    return <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
  }
  if (status === 'advisory') return <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
  return <CircleHelp aria-hidden className="h-3.5 w-3.5" />
}

function tone(status: WisdomReviewStatus): string {
  if (status === 'pass') return 'border-emerald-500/50 text-emerald-300'
  if (status === 'blocked') return 'border-red-500/60 text-red-300'
  if (status === 'advisory') return 'border-amber-500/60 text-amber-300'
  return 'border-border text-text-tertiary'
}

export function WisdomCheckBadge({ label, value }: { label: string; value?: WisdomReviewCheck | null }) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const status = value?.status ?? 'unavailable'
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-1 text-[11px] ${tone(status)}`}>
      <StatusIcon status={status} />
      {label}: {statusLabel(status, copy.statusLabels)}
    </span>
  )
}

function rowLabel(
  row: WisdomReviewCheckRow,
  professionalismLabels: Record<string, string>,
  statusLabels: Record<string, string>
): string {
  return row.label || professionalismLabels[row.key] || statusLabel(row.key as WisdomReviewStatus, statusLabels)
}

function CheckTable({ label, note, value }: { label: string; note: string; value?: WisdomReviewCheck | null }) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const status = value?.status ?? 'unavailable'
  const rows = value?.checks ?? []
  return (
    <section aria-label={label} className="border-t border-border py-3 first:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium">{label}</h4>
        <WisdomCheckBadge label={copy.result} value={{ status }} />
      </div>
      {value?.summary && <p className="mt-1 text-xs text-text-secondary">{value.summary}</p>}
      <p className="mt-1 text-[11px] text-text-tertiary">{note}</p>
      {rows.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="text-text-tertiary">
              <tr>
                <th className="border-b border-border py-2 pr-3 font-medium">{copy.check}</th>
                <th className="border-b border-border py-2 pr-3 font-medium">{copy.status}</th>
                <th className="border-b border-border py-2 font-medium">{copy.details}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <th className="border-b border-border/60 py-2 pr-3 font-normal">
                    {rowLabel(row, copy.professionalismLabels, copy.statusLabels)}
                  </th>
                  <td className="border-b border-border/60 py-2 pr-3">
                    <span className="inline-flex items-center gap-1">
                      <StatusIcon status={row.status} /> {statusLabel(row.status, copy.statusLabels)}
                    </span>
                  </td>
                  <td className="border-b border-border/60 py-2 text-text-secondary">
                    {row.details.length > 0
                      ? row.details.join(' ')
                      : row.finding_count > 0
                        ? copy.findings(row.finding_count)
                        : copy.noKnownMatches}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function WisdomReviewTables({
  professionalism,
  security
}: {
  professionalism?: WisdomReviewCheck | null
  security?: WisdomReviewCheck | null
}) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  return (
    <div className="mt-3 border-y border-border">
      <CheckTable
        label={security?.source === 'local_preflight' ? copy.securityLocalPreflight : copy.securityCheck}
        note={
          security?.source === 'local_preflight'
            ? copy.securityLocalNote
            : copy.securityGatewayNote
        }
        value={security}
      />
      <CheckTable
        label={copy.professionalismCheck}
        note={copy.professionalismNote}
        value={professionalism}
      />
    </div>
  )
}
