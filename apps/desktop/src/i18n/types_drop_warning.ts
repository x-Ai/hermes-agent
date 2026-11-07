/** The warning a drop on a composer shows for the items it could not attach (`Translations.desktop`). */
export interface DropWarningCopy {
  /** The warning's title, also the title of a dropped file's failed upload. */
  dropFiles: string
  /** One item the drop could not attach. A reason may follow after ': '; '; ' joins the next item. */
  dropFailedItem: (name: string) => string
  /** The items the warning leaves out, after the last one it names: `…; and 3 more`. */
  dropFilesMore: (count: number) => string
}
