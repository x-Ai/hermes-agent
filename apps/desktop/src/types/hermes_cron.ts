// Cron job, run-ledger and delivery-target shapes: the desktop's view of
// cron.jobs.list_jobs, POST /api/cron/jobs/{id}/cancel and GET /api/cron/delivery-targets.
// They stay apart from ./hermes so its size ratchet never forces an unrelated move again.

export interface CronJob {
  /** Missed-run policy: true runs one catch-up, false skips; null/absent follows the default. */
  catch_up?: boolean | null
  deliver?: null | string
  enabled: boolean
  id: string
  last_error?: null | string
  last_run_at?: null | string
  /** The job's newest ledger attempt (``cron.jobs.list_jobs``); claimed/running = a run in flight. */
  latest_execution?: CronJobExecution | null
  /** The newest claimed/running attempt under a live owner, even when a newer refused row is latest. */
  live_execution?: CronJobExecution | null
  model?: null | string
  name?: null | string
  next_run_at?: null | string
  no_agent?: boolean
  prompt?: null | string
  provider?: null | string
  schedule?: CronJobSchedule
  schedule_display?: null | string
  script?: null | string
  state?: null | string
}

export interface CronJobExecution {
  claimed_at?: null | string
  error?: null | string
  id: string
  status: string
}

/** POST /api/cron/jobs/{id}/cancel: ``cancelled`` is false when no run was in flight. */
export interface CronCancelResult {
  cancelled: boolean
  detail?: string
  execution_id?: null | string
  job_id: string
}

export interface CronJobCreatePayload {
  catch_up?: boolean
  deliver?: string
  model?: string
  name?: string
  prompt: string
  provider?: string
  repeat?: number
  schedule: string
}

export interface CronJobSchedule {
  display?: string
  expr?: string
  kind?: string
}

export interface CronJobUpdates {
  catch_up?: boolean | null
  deliver?: string
  enabled?: boolean
  model?: null | string
  name?: string
  prompt?: string
  provider?: null | string
  schedule?: string
}

// A cron delivery target from GET /api/cron/delivery-targets — the single
// source of truth (cron.scheduler.cron_delivery_targets) for where a cron job
// can auto-deliver. Only 'local' plus configured gateway platforms appear; a
// configured platform without a cron home channel comes back with
// home_target_set=false so the UI can flag it.
export interface CronDeliveryTarget {
  home_env_var: null | string
  home_target_set: boolean
  id: string
  name: string
}
