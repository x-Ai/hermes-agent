/** Settings › Capabilities: the toolset list, its provider picker and the model catalogs. */
export interface ToolsetsTranslations {
  loadingConfig: string
  savedTitle: string
  savedMessage: (key: string) => string
  removedTitle: string
  removedMessage: (key: string) => string
  failedSave: (key: string) => string
  failedRemove: (key: string) => string
  failedReveal: (key: string) => string
  removeConfirm: (key: string) => string
  set: string
  notSet: string
  selectedTitle: string
  selectedMessage: (provider: string) => string
  failedSelect: (provider: string) => string
  failedLoad: string
  noProviderOptions: string
  noProviders: string
  ready: string
  needsSignIn: string
  needsSetup: string
  badgeTokens: Record<string, string>
  tagCopy: Record<string, string>
  activeBackend: string
  activeBackendHint: string
  useBackend: string
  nousIncluded: string
  nousAuthNeededTitle: string
  nousAuthNeededMessage: (provider: string) => string
  nousAuthSignIn: string
  nousAuthDoneTitle: string
  nousAuthDoneMessage: string
  nousAuthFailed: string
  noApiKeyRequired: string
  postSetupHint: (step: string) => string
  postSetupInstalledHint: string
  postSetupRun: string
  postSetupRerun: string
  postSetupInstalled: string
  postSetupRunning: string
  postSetupStarting: string
  postSetupCompleteTitle: string
  postSetupCompleteMessage: (step: string) => string
  postSetupErrorTitle: string
  postSetupErrorMessage: (step: string) => string
  postSetupFailed: (step: string) => string
  webSearchActive: (backend: string) => string
  webExtractActive: (backend: string) => string
  webCapabilityUnset: string
  webUseForSearch: string
  webUseForExtract: string
  webUsedForSearch: string
  webUsedForExtract: string
  webCapabilitySelectedMessage: (provider: string, capability: string) => string
  failedSelectCapability: (provider: string) => string
  loadingModels: string
  modelSectionTitle: string
  modelCount: (count: number) => string
  modelInUse: string
  modelDefault: string
  modelInactiveHint: string
  modelSelectedTitle: string
  modelSelectedMessage: (model: string) => string
  failedSelectModel: (model: string) => string
  modelLabels: Record<string, string>
  modelSpeeds: Record<string, string>
  modelDescriptions: Record<string, string>
  modelPrices: Record<string, string>
  /** Tokens of a live catalog's compact strengths list ("4-15s, 720p, audio, i2v"):
   *  `audio`, `i2v`, … plus `secondsRange` ("{a}–{b} 秒") and `separator`. */
  modelStrengthTokens: Record<string, string>
  terminalBackend: {
    sectionTitle: string
    loading: string
    failedLoad: string
    ready: string
    needsSetup: string
    unavailable: string
    inUse: string
    selectedTitle: string
    selectedMessage: (backend: string) => string
    failedSelect: (backend: string) => string
    needsSetupHint: string
    descriptions: Record<string, string>
    details: Record<string, string>
    needsSetupConfirmTitle: (backend: string) => string
    needsSetupConfirmDescription: (detail: string) => string
    needsSetupConfirmDescriptionGeneric: string
    needsSetupConfirmAction: string
    unavailableTitle: string
    unavailableMessage: (backend: string) => string
    openBackendSettings: string
    useLocal: string
    switchedToLocal: string
  }
  computerUse: {
    checking: string
    statusReadFailed: string
    unsupported: (platform: string) => string
    installHint: string
    installGrantHint: string
    platformNotes: Record<string, string>
    macGrantNote: string
    recheck: string
    accessibility: string
    accessibilityHint: string
    screenRecording: string
    screenRecordingHint: string
    driverHealth: string
    granted: string
    notGranted: string
    ready: string
    notReady: string
    unknown: string
    readyMessage: string
    grantPermissions: string
    waitingApproval: string
    grantFailed: string
    approveTitle: string
    approveMessage: string
  }
  browserRealProfile: {
    label: string
    description: string
    enabledTitle: string
    enabledMessage: string
    disabledTitle: string
    disabledMessage: string
    failedSave: string
    prompt: {
      title: string
      body: string
      bulletSnapshot: string
      bulletLiveProfile: string
      bulletLocal: string
      dontShowAgain: string
      notNow: string
      enable: string
    }
  }
  nousAuthFailedMessage: string
  nousAuthTryAgain: string
  postSetupOpenLogs: string
  postSetupRunAgain: string
}
