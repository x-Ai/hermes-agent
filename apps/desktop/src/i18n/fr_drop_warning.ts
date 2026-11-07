import type { DropWarningCopy } from './types_drop_warning'

export const frDropWarning: DropWarningCopy = {
  dropFiles: 'Déposer des fichiers',
  dropFailedItem: name => `Impossible de joindre ${name}`,
  dropFilesMore: count => `et ${count} de plus`,
  attachRefusals: {
    folderDrop: (attach, folder) =>
      `Impossible de joindre un dossier en le déposant. Utilisez ${attach} → ${folder} à la place.`,
    fileTooLarge: mib => `Le fichier dépasse ${mib} Mio, la taille maximale que le navigateur peut joindre.`,
    imageTooLarge: mib => `L'image dépasse ${mib} Mio, la taille maximale que le navigateur peut envoyer.`,
    unsendableImage:
      'Impossible de joindre des images SVG ou ICO dans le navigateur. Joignez plutôt une image PNG, JPEG, GIF, WebP ou BMP.',
    uploadTooLarge:
      "Échec de l'envoi du fichier (413) : il dépasse la taille qu'accepte le serveur ou un proxy placé devant lui",
    uploadFailed: status => `Échec de l'envoi du fichier (${status})`
  }
}
