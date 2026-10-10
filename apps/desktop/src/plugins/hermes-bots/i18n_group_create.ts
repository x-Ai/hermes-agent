/**
 * The fork's additions to the `group` block, spread into every locale's
 * `group: {` in `i18n.ts` so components keep reading `b.group.*` while the
 * keys stay out of upstream's block (and out of its line count):
 *
 *  - the "New group chat" dialog (`CreateGroupChatDialog` in
 *    `create-dialog.tsx`): description, current-rooms note, confirm button;
 *  - working directories (`group-workspace.ts`, `group-workspace-settings.tsx`):
 *    the room folder, per-member folders, the thread chip, their notices;
 *  - the `@<group>` composer route (`group-mention-route.ts`).
 */

// A type alias, not an interface: `BotsMessages` must stay assignable to the
// SDK's index-signature `PluginMessages`, which an interface member breaks.
export type GroupCreateCopy = {
  /** `max` is GROUP_CHAT_MAX_MEMBERS. */
  newDescription: (max: number) => string
  /** After a candidate's @handle: the rooms it already belongs to. */
  inGroups: (groups: string[]) => string
  /** The confirm button; `count` is the current selection, 0 before any pick. */
  createAction: (count: number) => string
  /** Working directory controls. */
  workspaceLabel: string
  workspaceHint: string
  /** Placeholder of the empty room-folder field. */
  workspacePlaceholder: string
  workspacePick: string
  workspaceClear: string
  /** Placeholder of a member's own-folder field; the remote one names its machine. */
  memberWorkspacePlaceholder: string
  memberWorkspaceRemotePlaceholder: string
  /** Which rung of the ladder a member's effective folder comes from. */
  workspaceSource: (source: 'member' | 'profile' | 'room' | 'thread') => string
  workspaceInvalid: (path: string) => string
  workspaceApplyFailed: (member: string, path: string, error: string) => string
  /** Tooltip of the folder chip on a thread's opening message. */
  threadWorkspace: (path: string) => string
  /** The `@` popover row for a room. */
  mentionMeta: (memberCount: number) => string
  routedToGroup: (group: string, folder: null | string) => string
  routedAttachmentsBlocked: (group: string) => string
  /** The send was cancelled: these chips could not be read or sit over the room's size cap. */
  routedAttachmentsUnreadable: (group: string, names: string[]) => string
  /** The room's `@handle` field (`group-handle-field.tsx`). */
  handleLabel: string
  handleHint: string
  /** Placeholder when the name yields no handle to suggest. */
  handlePlaceholder: string
  handleInvalid: string
  handleTaken: (handle: string, owner: string) => string
}

const quoted = (groups: string[], separator = ', ') => groups.map(group => `"${group}"`).join(separator)
const bracketed = (groups: string[]) => groups.map(group => `「${group}」`).join('、')

// English stays byte-identical to the former literals: the e2e specs click
// `Create Group (2)`.
const en: GroupCreateCopy = {
  newDescription: max =>
    `Pick 2–${max} bots. Local memberships sync through each Bot profile; cross-machine members stay scoped to this room.`,
  inGroups: groups => `in ${quoted(groups)}`,
  createAction: count => (count ? `Create Group (${count})` : 'Create Group'),
  workspaceLabel: 'Working directory',
  workspaceHint: 'The folder the members work in for this room. Members on other machines use only their own folder.',
  workspacePlaceholder: 'Each member keeps its own profile default',
  workspacePick: 'Choose folder…',
  workspaceClear: 'Clear',
  memberWorkspacePlaceholder: 'Own folder (optional)',
  memberWorkspaceRemotePlaceholder: 'Own folder on its machine (optional)',
  workspaceSource: source =>
    ({ member: 'own folder', profile: 'profile default', room: 'room folder', thread: 'thread folder' })[source],
  workspaceInvalid: path => `Folder not found: ${path}`,
  workspaceApplyFailed: (member, path, error) => `Could not move ${member} to ${path}: ${error}`,
  threadWorkspace: path => `This thread works in ${path}`,
  mentionMeta: count => `Group chat · ${count} ${count === 1 ? 'member' : 'members'}`,
  routedToGroup: (group, folder) =>
    folder ? `Sent to "${group}" as a new thread in ${folder}` : `Sent to "${group}" as a new thread`,
  routedAttachmentsUnreadable: (group, names) =>
    `Could not attach ${names.join(', ')} (unreadable or over the size limit), so nothing was sent to "${group}". Remove the attachment or send it from the group chat.`,
  routedAttachmentsBlocked: group =>
    `Attachments cannot be sent to "${group}" from here. Open the group chat to send them.`,
  handleLabel: '@handle',
  handleHint:
    'What follows @ in any composer to send a draft into this room: lowercase letters, digits, - and _. Empty derives it from the name.',
  handlePlaceholder: 'dev-team',
  handleInvalid: 'A handle is lowercase letters, digits, - or _, and not a reserved word such as everyone.',
  handleTaken: (handle, owner) => `@${handle} already belongs to ${owner}.`
}

const ja: GroupCreateCopy = {
  newDescription: max =>
    `ボットを 2〜${max} 体選びます。ローカルのボットのメンバーシップは各ボットのプロファイルを通じて同期され、他のマシンのメンバーはこのルームにのみ属します`,
  inGroups: groups => `${bracketed(groups)} に参加中`,
  createAction: count => (count ? `グループを作成 (${count})` : 'グループを作成'),
  workspaceLabel: '作業ディレクトリ',
  workspaceHint: 'このルームでメンバーが作業するフォルダです。他のマシンのメンバーは各自のフォルダのみを使います',
  workspacePlaceholder: '空欄なら各メンバーのプロファイル既定を使います',
  workspacePick: 'フォルダを選択…',
  workspaceClear: 'クリア',
  memberWorkspacePlaceholder: 'このメンバー専用のフォルダ（任意）',
  memberWorkspaceRemotePlaceholder: 'このメンバーのマシン上の専用フォルダ（任意）',
  workspaceSource: source =>
    ({ member: '専用フォルダ', profile: 'プロファイル既定', room: 'ルームのフォルダ', thread: 'スレッドのフォルダ' })[
      source
    ],
  workspaceInvalid: path => `フォルダが見つかりません: ${path}`,
  workspaceApplyFailed: (member, path, error) => `${member} を ${path} に移動できませんでした: ${error}`,
  threadWorkspace: path => `このスレッドの作業ディレクトリ: ${path}`,
  mentionMeta: count => `グループチャット · メンバー ${count} 人`,
  routedToGroup: (group, folder) =>
    folder
      ? `"${group}" に新しいスレッドとして送信しました（${folder}）`
      : `"${group}" に新しいスレッドとして送信しました`,
  routedAttachmentsUnreadable: (group, names) =>
    `${names.join('、')} を添付できなかったため（読み取れないかサイズ上限超過）、"${group}" には何も送信していません。添付を外すか、グループチャットから送信してください`,
  routedAttachmentsBlocked: group =>
    `ここから "${group}" に添付ファイルは送れません。グループチャットを開いて送信してください`,
  handleLabel: '@ハンドル',
  handleHint:
    '任意の入力欄で @ に続けて入力すると、このルームに送信できます。小文字の英数字、- と _ のみ。空欄なら名前から自動生成します',
  handlePlaceholder: 'dev-team',
  handleInvalid: 'ハンドルに使えるのは小文字の英数字、- と _ のみで、everyone などの予約語は使えません',
  handleTaken: (handle, owner) => `@${handle} はすでに「${owner}」が使っています`
}

const zh: GroupCreateCopy = {
  newDescription: max =>
    `选择 2–${max} 个机器人，本机机器人的成员关系会通过各自的配置档案同步，来自其他设备的成员只保留在这个房间内`,
  inGroups: groups => `已加入 ${quoted(groups, '、')}`,
  createAction: count => (count ? `创建群聊 (${count})` : '创建群聊'),
  workspaceLabel: '工作目录',
  workspaceHint: '群内成员在这个房间里工作的文件夹，其他设备上的成员只使用各自的专属目录',
  workspacePlaceholder: '留空则每个成员使用自己配置档案的默认目录',
  workspacePick: '选择文件夹…',
  workspaceClear: '清除',
  memberWorkspacePlaceholder: '该成员的专属目录，可选',
  memberWorkspaceRemotePlaceholder: '该成员所在设备上的专属目录，可选',
  workspaceSource: source =>
    ({ member: '专属目录', profile: '配置档案默认', room: '群目录', thread: '线程目录' })[source],
  workspaceInvalid: path => `找不到文件夹：${path}`,
  workspaceApplyFailed: (member, path, error) => `无法把 ${member} 切换到 ${path}：${error}`,
  threadWorkspace: path => `该线程的工作目录：${path}`,
  mentionMeta: count => `群聊 · ${count} 位成员`,
  routedToGroup: (group, folder) =>
    folder ? `已作为新线程发送到 "${group}"，工作目录 ${folder}` : `已作为新线程发送到 "${group}"`,
  routedAttachmentsUnreadable: (group, names) =>
    `无法附加 ${names.join('、')}，文件不可读或超过大小上限，因此没有向 "${group}" 发送任何内容，请移除该附件或在群聊中发送`,
  routedAttachmentsBlocked: group => `无法从这里向 "${group}" 发送附件，请打开群聊后再发送`,
  handleLabel: '@ 标签',
  handleHint:
    '在任意输入框里输入 @ 加这个标签，就能把消息发进这个群聊，只能用小写字母、数字、- 和 _，留空则按群名自动生成',
  handlePlaceholder: 'dev-team',
  handleInvalid: '标签只能用小写字母、数字、- 和 _，且不能是 everyone 这类保留词',
  handleTaken: (handle, owner) => `@${handle} 已被 "${owner}" 使用`
}

const zhHant: GroupCreateCopy = {
  newDescription: max =>
    `選擇 2–${max} 個機器人。本機機器人的成員關係會透過各自的設定檔同步，來自其他裝置的成員只保留在這個房間內`,
  inGroups: groups => `已加入 ${bracketed(groups)}`,
  createAction: count => (count ? `建立群組聊天 (${count})` : '建立群組聊天'),
  workspaceLabel: '工作目錄',
  workspaceHint: '群內成員在這個房間工作的資料夾。其他裝置上的成員只使用各自的專屬目錄',
  workspacePlaceholder: '留空則每個成員使用自己設定檔的預設目錄',
  workspacePick: '選擇資料夾…',
  workspaceClear: '清除',
  memberWorkspacePlaceholder: '該成員的專屬目錄（選填）',
  memberWorkspaceRemotePlaceholder: '該成員所在裝置上的專屬目錄（選填）',
  workspaceSource: source =>
    ({ member: '專屬目錄', profile: '設定檔預設', room: '群目錄', thread: '討論串目錄' })[source],
  workspaceInvalid: path => `找不到資料夾：${path}`,
  workspaceApplyFailed: (member, path, error) => `無法將 ${member} 切換到 ${path}：${error}`,
  threadWorkspace: path => `此討論串的工作目錄：${path}`,
  mentionMeta: count => `群組聊天 · ${count} 位成員`,
  routedToGroup: (group, folder) =>
    folder ? `已作為新討論串傳送到「${group}」，工作目錄 ${folder}` : `已作為新討論串傳送到「${group}」`,
  routedAttachmentsUnreadable: (group, names) =>
    `無法附加 ${names.join('、')}（無法讀取或超過大小上限），因此沒有向「${group}」傳送任何內容。請移除該附件或在群組聊天中傳送`,
  routedAttachmentsBlocked: group => `無法從這裡向「${group}」傳送附件，請開啟群組聊天後再傳送`,
  handleLabel: '@ 標籤',
  handleHint:
    '在任一輸入框輸入 @ 加這個標籤，即可把訊息送進這個群組聊天。只能使用小寫字母、數字、- 和 _，留空則依群組名稱自動產生',
  handlePlaceholder: 'dev-team',
  handleInvalid: '標籤只能使用小寫字母、數字、- 和 _，且不能是 everyone 這類保留字',
  handleTaken: (handle, owner) => `@${handle} 已被「${owner}」使用`
}

const ru: GroupCreateCopy = {
  newDescription: max =>
    `Выберите от 2 до ${max} ботов. Участники с этой машины синхронизируются через профиль каждого бота; участники с других машин остаются только в этой комнате.`,
  inGroups: groups => `в ${quoted(groups)}`,
  createAction: count => (count ? `Создать группу (${count})` : 'Создать группу'),
  workspaceLabel: 'Рабочий каталог',
  workspaceHint:
    'Папка, в которой участники работают в этой комнате. Участники с других машин используют только свою папку.',
  workspacePlaceholder: 'Пусто — каждый участник использует папку из своего профиля',
  workspacePick: 'Выбрать папку…',
  workspaceClear: 'Очистить',
  memberWorkspacePlaceholder: 'Собственная папка (необязательно)',
  memberWorkspaceRemotePlaceholder: 'Собственная папка на его машине (необязательно)',
  workspaceSource: source =>
    ({ member: 'своя папка', profile: 'профиль по умолчанию', room: 'папка комнаты', thread: 'папка треда' })[source],
  workspaceInvalid: path => `Папка не найдена: ${path}`,
  workspaceApplyFailed: (member, path, error) => `Не удалось перевести ${member} в ${path}: ${error}`,
  threadWorkspace: path => `Рабочий каталог этого треда: ${path}`,
  mentionMeta: count => `Групповой чат · участников: ${count}`,
  routedToGroup: (group, folder) =>
    folder ? `Отправлено в "${group}" как новый тред в ${folder}` : `Отправлено в "${group}" как новый тред`,
  routedAttachmentsUnreadable: (group, names) =>
    `Не удалось приложить ${names.join(', ')} (файл не читается или превышает лимит размера), поэтому в "${group}" ничего не отправлено. Уберите вложение или отправьте его из группового чата.`,
  routedAttachmentsBlocked: group =>
    `Вложения нельзя отправить в "${group}" отсюда. Откройте групповой чат и отправьте их там.`,
  handleLabel: '@-хэндл',
  handleHint:
    'Что вводить после @ в любом поле ввода, чтобы отправить черновик в эту комнату: строчные латинские буквы, цифры, - и _. Пустое поле — хэндл выводится из названия.',
  handlePlaceholder: 'dev-team',
  handleInvalid: 'Хэндл — это строчные латинские буквы, цифры, - или _, и не зарезервированное слово вроде everyone.',
  handleTaken: (handle, owner) => `@${handle} уже принадлежит ${owner}.`
}

const ar: GroupCreateCopy = {
  newDescription: max =>
    `اختر من 2 إلى ${max} بوتات. تتم مزامنة عضويات البوتات المحلية عبر ملف تعريف كل بوت، أما الأعضاء من الأجهزة الأخرى فيبقون ضمن هذه الغرفة فقط.`,
  inGroups: groups => `في ${quoted(groups, '، ')}`,
  createAction: count => (count ? `إنشاء مجموعة (${count})` : 'إنشاء مجموعة'),
  workspaceLabel: 'دليل العمل',
  workspaceHint: 'المجلد الذي يعمل فيه الأعضاء في هذه الغرفة. الأعضاء على الأجهزة الأخرى يستخدمون مجلدهم الخاص فقط.',
  workspacePlaceholder: 'اتركه فارغًا ليستخدم كل عضو المجلد الافتراضي لملفه التعريفي',
  workspacePick: 'اختيار مجلد…',
  workspaceClear: 'مسح',
  memberWorkspacePlaceholder: 'مجلد خاص بهذا العضو (اختياري)',
  memberWorkspaceRemotePlaceholder: 'مجلد خاص على جهاز هذا العضو (اختياري)',
  workspaceSource: source =>
    ({ member: 'مجلد خاص', profile: 'افتراضي الملف التعريفي', room: 'مجلد الغرفة', thread: 'مجلد المحادثة' })[source],
  workspaceInvalid: path => `المجلد غير موجود: ${path}`,
  workspaceApplyFailed: (member, path, error) => `تعذر نقل ${member} إلى ${path}: ${error}`,
  threadWorkspace: path => `دليل عمل هذه المحادثة الفرعية: ${path}`,
  mentionMeta: count => `محادثة جماعية · ${count} أعضاء`,
  routedToGroup: (group, folder) =>
    folder ? `أُرسلت إلى "${group}" كمحادثة فرعية جديدة في ${folder}` : `أُرسلت إلى "${group}" كمحادثة فرعية جديدة`,
  routedAttachmentsUnreadable: (group, names) =>
    `تعذر إرفاق ${names.join('، ')} (غير قابل للقراءة أو يتجاوز حد الحجم)، لذا لم يُرسل شيء إلى "${group}". أزل المرفق أو أرسله من المحادثة الجماعية.`,
  routedAttachmentsBlocked: group => `لا يمكن إرسال المرفقات إلى "${group}" من هنا. افتح المحادثة الجماعية لإرسالها.`,
  handleLabel: 'معرّف @',
  handleHint:
    'ما يُكتب بعد @ في أي حقل إدخال لإرسال المسودة إلى هذه الغرفة: أحرف لاتينية صغيرة وأرقام و- و_. اتركه فارغًا ليُشتق من الاسم.',
  handlePlaceholder: 'dev-team',
  handleInvalid: 'المعرّف أحرف لاتينية صغيرة وأرقام و- أو _ فقط، وليس كلمة محجوزة مثل everyone.',
  handleTaken: (handle, owner) => `@${handle} يخص ${owner} بالفعل.`
}

export const groupCreateCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupCreateCopy> = {
  ar,
  en,
  ja,
  ru,
  zh,
  'zh-hant': zhHant
}
