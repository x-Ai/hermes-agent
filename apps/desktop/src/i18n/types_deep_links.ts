/** Opening a skill install link. */
export interface SkillDeepLinkCopy {
  installTitle: (name: string) => string
  installDescription: string
  installTo: string
  thisComputer: string
  installing: string
  installComplete: (name: string) => string
  destinationChanged: string
  installed: string
  source: string
}
