import { useStore } from '@nanostores/react'
import { FileText, RefreshCw } from 'lucide-react'
import { type CSSProperties } from 'react'

import { Button } from '../components/button'
import { useInstallerI18n } from '../i18n'
import { $logPath, $mode, type BootstrapStateModel, openLogDir, startInstall, startUpdate } from '../store'

interface FailureProps {
  bootstrap: BootstrapStateModel
}

/*
 * Failure screen. Same hero treatment as Welcome/Success — the wordmark
 * carries the brand, so we keep it across every terminal state.
 *
 * The actual error message lives below in muted text. Two affordances on
 * shared Button tokens: Retry (primary) and Open logs (quiet text link).
 */
export default function Failure({ bootstrap }: FailureProps) {
  const { t } = useInstallerI18n()
  const logPath = useStore($logPath)
  const mode = useStore($mode)
  const isUpdate = mode === 'update'

  return (
    <div className="hermes-fade-in flex h-full flex-col items-center justify-center gap-6 px-12 py-10">
      <div className="w-full max-w-2xl min-w-0 text-center">
        <p
          className="fit-text mx-auto mb-4 w-full font-['Collapse'] font-bold uppercase leading-[0.9] tracking-[0.08em] text-destructive mix-blend-plus-lighter dark:text-destructive/90"
          style={
            {
              '--fit-text-line-height': '0.9',
              '--fit-text-max': '5rem',
              '--fit-text-min': '2.25rem'
            } as CSSProperties
          }
        >
          <span>
            <span>{isUpdate ? t.failure.updateTitle : t.failure.installTitle}</span>
          </span>
          <span aria-hidden="true">{isUpdate ? t.failure.updateTitle : t.failure.installTitle}</span>
        </p>

        <p className="m-0 mx-auto max-w-xl text-center text-sm leading-normal tracking-tight text-muted-foreground">
          {isUpdate ? t.failure.updateDescription : t.failure.installDescription}
        </p>
        {bootstrap.error && (
          <p className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground/70">
            {bootstrap.error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button className="gap-1.5" onClick={() => void (isUpdate ? startUpdate() : startInstall())}>
          <RefreshCw />
          {isUpdate ? t.failure.retryUpdate : t.failure.retryInstall}
        </Button>
        <Button className="gap-1.5" onClick={() => void openLogDir()} variant="text">
          <FileText />
          {t.common.openLogs}
        </Button>
      </div>

      {logPath && (
        <p className="max-w-lg text-center text-xs text-muted-foreground/70">
          {t.common.log}: <code className="font-mono">{logPath}</code>
        </p>
      )}
    </div>
  )
}
