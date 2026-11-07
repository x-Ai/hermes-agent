import type { Translations } from './types'

// The execution-backend picker (Settings › Capabilities), composed by en.ts as
// `settings.toolsets.terminalBackend`. English leaves `descriptions` and `details`
// empty: the panel falls back to the backend's own description and probe prose.
export const enTerminalBackend: Translations['settings']['toolsets']['terminalBackend'] = {
  sectionTitle: 'Execution backend',
  loading: 'Checking execution backends…',
  failedLoad: 'Could not load terminal backends',
  ready: 'Ready',
  needsSetup: 'Needs setup',
  unavailable: 'Unavailable',
  inUse: 'In use',
  selectedTitle: 'Backend selected',
  selectedMessage: backend => `Terminal commands now run via ${backend}. Applies to new sessions.`,
  failedSelect: backend => `Failed to select ${backend}`,
  needsSetupHint: 'This backend is currently selected without full setup — commands will fail until setup is complete.',
  descriptions: {},
  details: {},
  needsSetupConfirmTitle: backend => `Select ${backend} anyway?`,
  needsSetupConfirmDescription: detail =>
    `${detail} Sessions that start after this change will have no terminal or file tools until setup is finished.`,
  needsSetupConfirmDescriptionGeneric:
    "This backend isn't set up yet. Sessions that start after this change will have no terminal or file tools until setup is finished.",
  needsSetupConfirmAction: 'Select anyway',
  unavailableTitle: 'Terminal commands are unavailable',
  unavailableMessage: backend =>
    `Hermes can't run shell commands right now: ${backend} isn't ready. Switch to Local, or finish setting up ${backend} and try again.`,
  openBackendSettings: 'Open terminal settings',
  useLocal: 'Use Local',
  switchedToLocal: 'Terminal commands now run locally. Applies to new sessions.'
}
