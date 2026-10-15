import type { ToolsetsTranslations } from './types_toolsets'

// English ships no provider-picker overlays: the backend's own badge tokens,
// provider tags and catalog model copy are English already. The Chinese
// catalogs fill these maps in zh_toolset_copy.ts / zh-hant_toolset_copy.ts.
export const enToolsetCopy: Pick<
  ToolsetsTranslations,
  | 'badgeTokens'
  | 'modelDescriptions'
  | 'modelLabels'
  | 'modelPrices'
  | 'modelSpeeds'
  | 'modelStrengthTokens'
  | 'tagCopy'
> = {
  badgeTokens: {},
  tagCopy: {},
  modelLabels: {},
  modelSpeeds: {},
  modelDescriptions: {},
  modelPrices: {},
  modelStrengthTokens: {}
}
