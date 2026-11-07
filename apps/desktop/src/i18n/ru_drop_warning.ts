import type { DropWarningCopy } from './types_drop_warning'

export const ruDropWarning: DropWarningCopy = {
  dropFiles: 'Перетаскивание файлов',
  dropFailedItem: name => `Не удалось прикрепить ${name}`,
  dropFilesMore: count => `и ещё ${count}`,
  attachRefusals: {
    folderDrop: (attach, folder) =>
      `Папки нельзя прикрепить перетаскиванием. Вместо этого выберите «${attach} → ${folder}».`,
    fileTooLarge: mib => `Файл больше ${mib} МиБ — это наибольший размер файла, который можно прикрепить в браузере.`,
    imageTooLarge: mib =>
      `Изображение больше ${mib} МиБ — это наибольший размер изображения, которое браузер может отправить.`,
    unsendableImage:
      'Изображения SVG и ICO нельзя прикрепить в браузере. Прикрепите вместо них изображение PNG, JPEG, GIF, WebP или BMP.',
    uploadTooLarge: 'Не удалось загрузить файл (413): он больше, чем принимает сервер или прокси перед ним',
    uploadFailed: status => `Не удалось загрузить файл (${status})`
  }
}
