export function localizeDefaultIdentifier(value: string, defaultLabel: string): string {
  return value === 'default' ? defaultLabel : value
}
