import type { Translations } from './types'

// The free Nous tier's copy (`freeTier`), composed by en.ts.
export const enFreeTier: Translations['freeTier'] = {
  providerRowTitle: 'Nous · free tier',
  providerRowPitch: 'Sign in with a Nous account to unlock more models and tools.',
  readyTitle: 'Hermes is ready.',
  readyCaption: 'Free · connectors included',
  begin: 'Begin',
  signInInstead: 'Sign in with a Nous account instead',
  otherProviders: 'Other providers',
  stripTitle: 'Free Nous inference and connectors are now available.',
  stripBody: 'Open the model picker to try them, or sign in with a Nous account.',
  openModelPicker: 'Open model picker',
  dismiss: 'Dismiss',
  providerName: 'Nous',
  statusLabel: model => `Nous · ${model}`,
  signIn: 'Sign in',
  signInHeading: 'Sign in with a Nous account to unlock more models and tools.',
  settingUp: 'Setting up free inference…',
  finishInBrowser: 'Finish in your browser',
  doNotShare: 'Do not share it.',
  openPageAgain: 'Open page again',
  waiting: 'Waiting for sign-in…',
  finishingHeading: 'Finishing sign-in…',
  finishingBody: 'Approved in the browser. Collecting your account tokens.',
  signedInAsLabel: 'Signed in as',
  signedIn: 'Signed in.',
  completedBody: 'Your account now carries inference and tools.',
  reconnect: 'Reconnect',
  openConnectors: 'Open Connectors',
  defaultModel: 'Default model',
  change: 'Change',
  done: 'Done',
  notNow: 'Not now',
  tryAgain: 'Try again',
  didNotComplete: "Sign-in didn't finish",
  timedOutHeading: 'That sign-in link has expired',
  timedOutBody: "Start again whenever you're ready. You're still on the free Nous service.",
  errorBody: "Sign-in didn't finish. Try again whenever you're ready.",
  alreadySignedInHeading: 'Already signed in.',
  alreadySignedInBody: 'This Hermes is already signed in to a Nous account.',
  busyHeading: 'Almost there',
  busyBody: wait =>
    `Hermes couldn't finish signing you in because the Nous service is busy. Try again in ${wait}. Your session is still here in the meantime.`,
  unreachableBody:
    "Hermes couldn't reach the Nous service to finish signing you in. Check your internet connection and try again. Your session is still here.",
  offer: {
    heading: 'Keep going with Hermes',
    body: "You're on the free allowance. If you keep using Hermes, you'll start running into limits. Sign in with a free Nous account for a bigger allowance.",
    signIn: 'Sign in',
    notNow: 'Not now'
  },
  setupFailed: {
    gateClosed:
      "This version of Hermes can't start without a Nous account. Sign in or create one, it's free and only takes a minute.",
    paused:
      'Using Hermes without signing in is paused for a moment. Hermes will keep checking. Signing in is free and gets you going right now.',
    rateLimited: wait =>
      `Lots of people are getting started right now, so Hermes will try again in ${wait}. Signing in is free and skips the wait.`,
    unreachable:
      "Hermes couldn't reach the Nous service. Check your internet connection, then tap Try again. Or connect another provider for now.",
    serverError: 'The Nous service had a hiccup. Tap Try again in a moment, or connect another provider for now.',
    powRequired:
      "The Nous server asked for a proof of work, but that isn't implemented in your Agent yet. Sign in or create a free Nous account to continue.",
    locked: "This session can't continue without signing in. Sign in or create a free Nous account to keep going.",
    generic: "Hermes couldn't set up free access without signing in. Signing in is free, or connect another provider.",
    signInBelow: 'Signing in is free. Pick Nous below.',
    tryAgain: 'Try again',
    retrying: 'Trying again…'
  },
  wait: {
    fewSeconds: 'a few seconds',
    aboutMinute: 'about a minute',
    aboutMinutes: count => `about ${count} minutes`,
    aboutHour: 'about an hour',
    aboutHours: count => `about ${count} hours`
  }
}
