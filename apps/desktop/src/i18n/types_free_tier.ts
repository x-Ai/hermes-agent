// The free Nous tier: first-launch introduction, statusbar chip, sign-in dialog, keep-going offer and
// set-up failure notice; `Translations.freeTier`.
export interface FreeTierTranslations {
  /** Settings › Providers row title while the Nous identity is the free tier. */
  providerRowTitle: string
  /** The featured row's pitch while the identity is the free tier: what signing in adds. */
  providerRowPitch: string
  // First-launch introduction (ready screen + composer strip).
  readyTitle: string
  readyCaption: string
  begin: string
  signInInstead: string
  otherProviders: string
  stripTitle: string
  stripBody: string
  openModelPicker: string
  dismiss: string
  // Statusbar chip.
  /** The status-bar chip's label: the provider name alone; the model id and the sign-in follow it. */
  providerName: string
  statusLabel: (model: string) => string
  // Sign-in dialog.
  signIn: string
  signInHeading: string
  settingUp: string
  finishInBrowser: string
  doNotShare: string
  openPageAgain: string
  waiting: string
  finishingHeading: string
  finishingBody: string
  /** Over the account email on the completed screen. */
  signedInAsLabel: string
  signedIn: string
  completedBody: string
  /** The free tier's apps: reconnect the ones that did not move; open Connectors to check. */
  reconnect: string
  openConnectors: string
  defaultModel: string
  change: string
  done: string
  notNow: string
  tryAgain: string
  didNotComplete: string
  timedOutHeading: string
  timedOutBody: string
  errorBody: string
  /** The account service asked for a short wait mid sign-in (a busy account, a rate limit, the ops pause). */
  busyHeading: string
  busyBody: (wait: string) => string
  /** The account service could not be reached or errored mid sign-in. */
  unreachableBody: string
  alreadySignedInHeading: string
  alreadySignedInBody: string
  /** The "keep going" offer the backend times after a finished task (repeats, backing off). */
  offer: {
    heading: string
    body: string
    signIn: string
    notNow: string
  }
  // First-launch set-up failure notice: the free tier could not be created at boot.
  // One sentence per backend code (`hermes_cli/anon_auth.py::ANON_*`); the copy never says
  // the free MODEL is off — what is unavailable is using Hermes without signing in.
  setupFailed: {
    gateClosed: string
    paused: string
    rateLimited: (wait: string) => string
    unreachable: string
    serverError: string
    powRequired: string
    locked: string
    generic: string
    /** The sign-in door, when the account service is reachable: the Nous row sits right below. */
    signInBelow: string
    tryAgain: string
    retrying: string
  }
  /** `friendlyWait` (store/free-tier.ts): the rounded, spoken wait that busyBody and setupFailed.rateLimited carry. */
  wait: {
    fewSeconds: string
    aboutMinute: string
    aboutMinutes: (count: number) => string
    aboutHour: string
    aboutHours: (count: number) => string
  }
}
