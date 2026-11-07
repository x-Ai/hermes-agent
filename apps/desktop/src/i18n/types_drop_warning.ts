/** The warning a drop on a composer shows for the items it could not attach (`Translations.desktop`). */
export interface DropWarningCopy {
  /** The warning's title, also the title of a dropped file's failed upload. */
  dropFiles: string
  /** One item the drop could not attach. A reason may follow after ': '; '; ' joins the next item. */
  dropFailedItem: (name: string) => string
  /** The items the warning leaves out, after the last one it names: `…; and 3 more`. */
  dropFilesMore: (count: number) => string
  /** The reasons that follow `dropFailedItem`. A pick or a paste refused the same way shows one as its toast. */
  attachRefusals: AttachRefusalCopy
}

/** Why the browser build refused an attachment itself. It raises each in English for the desktop log, and
 *  readableError reads it back to this copy. A reason leaves out the name, which the drop warning adds. */
export interface AttachRefusalCopy {
  /** A folder dropped with no host path. `attach` and `folder` name the composer's attach menu and its
   *  folder item (`composer.attachLabel`, `composer.folder`), the way to attach one. */
  folderDrop: (attach: string, folder: string) => string
  /** A file over the largest the browser can upload, in MiB. */
  fileTooLarge: (mib: number) => string
  /** An image over the largest the browser can send, in MiB. */
  imageTooLarge: (mib: number) => string
  /** An SVG or ICO image, which the browser cannot stage. */
  unsendableImage: string
  /** An upload refused with HTTP 413 and no detail: the server or a proxy in front of it. */
  uploadTooLarge: string
  /** Any other upload that failed with no detail, by its HTTP status. */
  uploadFailed: (status: number) => string
}
