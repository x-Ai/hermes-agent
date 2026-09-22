import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

/** Language access for boot/setup surfaces that render before Settings exists. */
export function SetupLocaleControl({ className }: { className?: string }) {
  return (
    <div className={cn('absolute end-4 top-4 z-10', className)}>
      <LanguageSwitcher />
    </div>
  )
}
