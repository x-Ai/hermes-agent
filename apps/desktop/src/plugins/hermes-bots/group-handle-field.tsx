/**
 * The `@handle` field shared by the group create and settings dialogs. The
 * handle the room would get from its name alone sits in the placeholder, so
 * an empty field reads as "derived" and a CJK room shows its escaped default
 * right where the user can replace it. Controlled; the owner validates with
 * `checkGroupHandleInput` and decides when to save.
 */

import { Input } from '@hermes/plugin-sdk'

import { useBots } from './i18n'

interface GroupHandleFieldProps {
  onChange: (value: string) => void
  /** `groupHandleFromName(<current name>)` — '' when the name yields nothing. */
  suggestion: string
  value: string
}

export function GroupHandleField({ onChange, suggestion, value }: GroupHandleFieldProps) {
  const b = useBots()

  return (
    <div className="grid gap-1" data-testid="group-handle-field">
      <div className="text-xs font-medium text-(--ui-text-secondary)">{b.group.handleLabel}</div>
      <Input
        aria-label={b.group.handleLabel}
        className="font-mono"
        maxLength={64}
        onChange={event => onChange(event.target.value)}
        placeholder={suggestion || b.group.handlePlaceholder}
        prefix="@"
        spellCheck={false}
        value={value}
      />
      <div className="text-[0.625rem] text-(--ui-text-quaternary)">{b.group.handleHint}</div>
    </div>
  )
}
