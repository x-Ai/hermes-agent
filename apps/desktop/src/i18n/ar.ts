import { arArtifacts } from './ar_artifacts'
import { arAssistant } from './ar_assistant'
import { arBoot } from './ar_boot'
import { arCapabilities } from './ar_capabilities'
import { arChat } from './ar_chat'
import { arChrome } from './ar_chrome'
import { arCommandCenter } from './ar_command_center'
import { arCommon } from './ar_common'
import { arConnectors } from './ar_connectors'
import { arDiagnostics } from './ar_diagnostics'
import { arRuntime } from './ar_runtime'
import { arSettings } from './ar_settings'
import { defineLocale, type TranslationOverrides } from './define-locale'

export const arOverrides = {
  connectors: arConnectors.connectors,
  sharedMetrics: arCommon.sharedMetrics,
  externalOpenFailed: arChrome.externalOpenFailed,
  skillDeepLink: arCapabilities.skillDeepLink,
  sessionImport: arConnectors.sessionImport,
  sendDiagnostics: arDiagnostics.sendDiagnostics,
  common: arCommon.common,
  media: arArtifacts.media,
  fileMenu: arChrome.fileMenu,
  boot: arBoot.boot,
  notifications: arDiagnostics.notifications,
  remoteDisplayBanner: arBoot.remoteDisplayBanner,
  billingBlock: arCommon.billingBlock,
  billingPage: arCommon.billingPage,
  butterbar: arBoot.butterbar,
  titlebar: arChrome.titlebar,
  keybinds: arChrome.keybinds,
  paletteCommands: arChrome.paletteCommands,
  timelineEvents: arChat.timelineEvents,
  runtimeErrors: arRuntime.runtimeErrors,
  findInPage: arChrome.findInPage,
  language: arSettings.language,
  quickEntry: arChat.quickEntry,
  petOverlay: arChat.petOverlay,
  settings: arSettings.settings,
  skills: arCapabilities.skills,
  starmap: arCapabilities.starmap,
  agents: arCapabilities.agents,
  commandCenter: arCommandCenter.commandCenter,
  messaging: arCommandCenter.messaging,
  webhooks: arConnectors.webhooks,
  profiles: arCommandCenter.profiles,
  modelAssignment: arSettings.modelAssignment,
  cron: arCommandCenter.cron,
  artifacts: arArtifacts.artifacts,
  artifactCard: arArtifacts.artifactCard,
  artifactPreview: arArtifacts.artifactPreview,
  sidebar: arChrome.sidebar,
  composer: arChat.composer,
  statusStack: arChat.statusStack,
  goalStatus: arChat.goalStatus,
  updates: arBoot.updates,
  handoffTour: arBoot.handoffTour,
  guidedGreeting: arBoot.guidedGreeting,
  guidedOnboarding: arBoot.guidedOnboarding,
  install: arBoot.install,
  onboarding: arBoot.onboarding,
  freeTier: arBoot.freeTier,
  modelPicker: arSettings.modelPicker,
  modelVisibility: arSettings.modelVisibility,
  shell: arChrome.shell,
  rightSidebar: arChrome.rightSidebar,
  preview: arArtifacts.preview,
  interfaceMode: arSettings.interfaceMode,
  zones: arChrome.zones,
  contextMenu: arChrome.contextMenu,
  assistant: arAssistant.assistant,
  prompts: arChat.prompts,
  desktop: arChat.desktop,
  errors: arDiagnostics.errors,
  tips: arChat.tips,
  ui: arCommon.ui
} satisfies TranslationOverrides

export const ar = defineLocale(arOverrides)
