// Split out of types.ts: the monolith sits over the FILE_LINES ratchet, so newer copy
// surfaces get their own interface module and are referenced from `Translations`.

/** Labels for the backend-authored timeline rows (`display_kind` notices). */
export interface TimelineEventsCopy {
  modelChanged: string
  resumedInterruptedTurn: string
  personalityChanged: string
  backgroundAgentWorkFinished: string
  backgroundAgentsFinished: (count: number) => string
  backgroundProcessFinished: string
}

/** Messages the renderer throws from its own actions, plus backend details the toast summariser
 *  re-renders; they surface as `notifyError` toast bodies. */
export interface RuntimeErrorsCopy {
  previewTargetUnavailable: (target: string) => string
  desktopBridgeUnavailable: string
  artifactWriteFailed: string
  previewBrowserBridgeUnavailable: string
  remotePreviewLoadFailed: string
  previewBufferBridgeUnavailable: string
  remotePreviewStageFailed: string
  hermesDesktopBridgeUnavailable: string
  savingUnavailable: string
  renameUnavailable: string
  deleteUnavailable: string
  gatewayFilePathMissing: string
  fileDownloadBridgeUnavailable: string
  attachmentReadFailed: (label: string) => string
  noActiveSessionToRestore: string
  restoreMessageNotFound: string
  restoreEmptyMessage: string
  restoreUnavailableForMessage: string
  newSessionMissingId: string
  quickEntryDestinationChanged: (drift: string) => string
  noActiveSessionForRestart: string
  backgroundRestartNoTaskId: string
  gatewayNotConnected: string
  gatewayUnavailable: string
  gatewayNotConnectedShort: string
  gatewayDisconnected: string
  backendRetired: (profile: string) => string
  backendReconnecting: (profile: string) => string
  gatewayUnavailableForProfile: (profile: string) => string
  registryDialUnsupported: string
  sessionControlGatewayUnavailable: string
  profileChangedWhileConnecting: string
  connectionNotActive: (label: string) => string
  defaultProfileUnsupported: string
  poolLimitsApplyFailed: string
  clipboardUnavailable: string
  welcomeConversationUnavailable: string
  pluginFolderUnavailable: string
  manifestMinContextInvalid: string
  manifestToolsNotList: string
  manifestToolAutoInstall: (index: number) => string
  manifestPluginsNotList: string
  manifestSchemaUnsupported: string
  mcpDocNotObject: string
  mcpDocNeedsName: string
  transcriptionTimedOut: (seconds: number, provider: string) => string
  sttHttpError: (status: number, detail: string) => string
  ttsHttpError: (status: number, detail: string) => string
  pluginIdentifierRequired: string
  pluginIdentifierInvalid: string
  mcpOauthCallbackUnsupported: string
  mcpOauthTimedOut: string
  audioContextUnavailable: string
  connectionBridgeUnavailable: string
  /** The custom-endpoint route's 422 for an id that names a built-in provider (its English detail is the marker). */
  builtinProviderId: (id: string, suggestion: string) => string
  welcomeNeedsAttention: string
  welcomeStartFailed: string
  restoreProfileFailed: string
}

/** Settings › Memory & Context › Persistent memory for a profile other than the default one, and the
 *  New profile / New Bot dialogs: profile.yaml `isolated_memory` (`profiles.describe` /
 *  `profiles.configure`, `hermes_cli/profiles_isolated_memory.py`). */
export interface MemoryIsolationCopy {
  title: string
  description: string
  /** Entries still identical to the default profile's: what switching on removes. */
  inherited: (count: number) => string
  noneInherited: string
  /** The create dialogs' checkbox: leave the clone's copied memory files out. */
  createLabel: string
  createHint: string
  isolated: (removed: number) => string
  shared: (added: number) => string
  /** `file` is the store's file name (MEMORY.md / USER.md): a marker, not display text. */
  overBudget: (file: string, chars: number, limit: number) => string
  defaultProfile: string
  failed: string
}

/** Joined into `Translations` through `extends`, so the over-cap types.ts gains no line. */
export interface MemoryIsolationTranslations {
  memoryIsolation: MemoryIsolationCopy
}
