import type { DropWarningCopy } from './types_drop_warning'

export const zhDropWarning: DropWarningCopy = {
  dropFiles: '拖放文件',
  dropFailedItem: name => `无法附加 ${name}`,
  dropFilesMore: count => `以及另外 ${count} 项`,
  attachRefusals: {
    folderDrop: (attach, folder) => `无法通过拖放附加文件夹。请改用“${attach} → ${folder}”。`,
    fileTooLarge: mib => `文件超过 ${mib} MiB，即浏览器可附加文件的大小上限。`,
    imageTooLarge: mib => `图片超过 ${mib} MiB，即浏览器可发送图片的大小上限。`,
    unsendableImage: '浏览器中无法附加 SVG 和 ICO 图片。请改为附加 PNG、JPEG、GIF、WebP 或 BMP 图片。',
    uploadTooLarge: '文件上传失败（413）：文件大小超出了服务器或其前置代理允许的上限',
    uploadFailed: status => `文件上传失败（${status}）`
  }
}
