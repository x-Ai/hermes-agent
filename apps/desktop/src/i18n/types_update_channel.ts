/** About ▸ Updates: the source checkout's update channel selector. */
export interface UpdateChannelCopy {
  title: string
  description: string
  stable: string
  main: string
  stableConfirmTitle: string
  stableConfirmBody: string
  stableConfirm: string
  failed: string
  /** Version details: the row naming this install's update channel. */
  detailsLabel: string
  /** A source checkout following a branch other than main. */
  branch: (name: string) => string
  /** Updates overlay: opens Settings › About › Updates, where the channel is chosen. */
  change: string
  /** Up to date on stable: names the release the install is pinned to. */
  latestRelease: (version: string) => string
  /** Stable chosen on a repository that has published no release (`release-missing`): the card's
   *  line, and the body naming the repository and the way back to following main. */
  noReleaseTitle: string
  noReleaseBody: (repository: string) => string
}
