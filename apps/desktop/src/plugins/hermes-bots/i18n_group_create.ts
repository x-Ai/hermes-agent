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

import { type GroupContextCopy, groupContextCopy } from './i18n_group_context'
import { type GroupMessageActionsCopy, groupMessageActionsCopy } from './i18n_group_message_actions'
import { type GroupTraceCopy, groupTraceCopy } from './i18n_group_trace'

// A type alias, not an interface: `BotsMessages` must stay assignable to the
// SDK's index-signature `PluginMessages`, which an interface member breaks.
type GroupCreateOwnCopy = {
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
  /** Gateway-hosted rooms (`canonical-room-actions.ts`). */
  canonicalSendFailed: (error: string) => string
  canonicalActionFailed: (error: string) => string
  canonicalMembersFixed: string
  /** Files cannot reach every member: a peer member, or a gateway without `room_attachments`. */
  canonicalAttachmentsUnsupported: (group: string) => string
  /** Moving a Desktop room onto its gateway (`canonical-room-migrate.tsx`). */
  hostOnGateway: string
  hostOnGatewayTitle: string
  hostOnGatewayDescription: (name: string, legacyName: string) => string
  hostOnGatewayAction: string
  hostOnGatewayBusy: string
  hostedOnGateway: (name: string) => string
  /** The name the Desktop room keeps beside its hosted successor. */
  legacyRoomName: (name: string) => string
  /** Roster-row tooltip of a hosted room. */
  hostedRoom: string
  /** A member's room session could not be looked up (`error` = the gateway's reason, may be empty);
   *  the engine fails closed instead of minting a second session. */
  sessionCheckFailed: (member: string, error: string) => string
}

const quoted = (groups: string[], separator = ', ') => groups.map(group => `"${group}"`).join(separator)
const bracketed = (groups: string[]) => groups.map(group => `「${group}」`).join('、')

// English stays byte-identical to the former literals: the e2e specs click
// `Create Group (2)`.
const en: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} already belongs to ${owner}.`,
  canonicalSendFailed: error => `The group did not take the message: ${error}`,
  canonicalActionFailed: error => `The gateway refused the change: ${error}`,
  canonicalMembersFixed: 'Members of a gateway-hosted room are set when it is created.',
  canonicalAttachmentsUnsupported: group =>
    `Attachments cannot reach every member of "${group}": the hosting gateway must carry room attachments and every member must run on it.`,
  hostOnGateway: 'Host on the gateway…',
  hostOnGatewayTitle: 'Host this room on the gateway',
  hostOnGatewayDescription: (name, legacyName) =>
    `A gateway-hosted room named "${name}" is created with the same members, picture, @handle, folders and stop-detection setting. It keeps running while this Desktop is closed and appears on every Desktop connected to this gateway. This room keeps its history here as "${legacyName}" and gives up its @handle; disband it once the history is no longer needed.`,
  hostOnGatewayAction: 'Create hosted room',
  hostOnGatewayBusy: 'Creating…',
  hostedOnGateway: name => `"${name}" now runs on the gateway`,
  legacyRoomName: name => `${name} (Desktop)`,
  hostedRoom: 'Gateway-hosted room',
  sessionCheckFailed: (member, error) =>
    `Could not check ${member}'s group session${error ? ` (${error})` : ''} — not starting a new one`
}

const ja: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} はすでに「${owner}」が使っています`,
  canonicalSendFailed: error => `グループはメッセージを受け付けませんでした: ${error}`,
  canonicalActionFailed: error => `ゲートウェイが変更を拒否しました: ${error}`,
  canonicalMembersFixed: 'ゲートウェイ管理のルームのメンバーは作成時に決まります。',
  canonicalAttachmentsUnsupported: group =>
    `"${group}" の全メンバーに添付ファイルを届けられません。ホストするゲートウェイがルームの添付ファイルに対応し、全メンバーがそのゲートウェイ上で動作している必要があります`,
  hostOnGateway: 'ゲートウェイに管理させる…',
  hostOnGatewayTitle: 'このルームをゲートウェイに管理させる',
  hostOnGatewayDescription: (name, legacyName) =>
    `同じメンバー、画像、@ハンドル、作業フォルダ、停止指示の検出設定を持つゲートウェイ管理のルーム "${name}" を新しく作成します。この Desktop を閉じても動き続け、このゲートウェイに接続したすべての Desktop に表示されます。現在のルームは "${legacyName}" という名前で履歴ごとこの Desktop に残り、@ハンドルを譲ります。履歴が不要になったら解散してください`,
  hostOnGatewayAction: '管理ルームを作成',
  hostOnGatewayBusy: '作成中…',
  hostedOnGateway: name => `"${name}" はゲートウェイ管理で動作しています`,
  legacyRoomName: name => `${name}（Desktop）`,
  hostedRoom: 'ゲートウェイ管理のルーム',
  sessionCheckFailed: (member, error) =>
    `${member} のグループセッションを確認できませんでした${error ? `（${error}）` : ''}。新しいセッションは開始しません`
}

const zh: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} 已被 "${owner}" 使用`,
  canonicalSendFailed: error => `群组没有收下这条消息: ${error}`,
  canonicalActionFailed: error => `网关拒绝了这次修改: ${error}`,
  canonicalMembersFixed: '网关托管群组的成员在创建时确定',
  canonicalAttachmentsUnsupported: group =>
    `无法把附件送达 "${group}" 的全部成员：托管它的网关必须支持群聊附件，并且所有成员都运行在该网关上`,
  hostOnGateway: '交给网关托管…',
  hostOnGatewayTitle: '把这个群聊交给网关托管',
  hostOnGatewayDescription: (name, legacyName) =>
    `将新建一个由网关托管、名为 "${name}" 的群聊，成员、图片、@ 标签、工作目录和停止指令检测设置保持不变，关闭 Desktop 后它仍会继续运行，连接到这个网关的每台 Desktop 都能看到它。当前群聊会以 "${legacyName}" 的名字连同历史记录保留在本机，并让出 @ 标签，不再需要这些记录时可以解散它`,
  hostOnGatewayAction: '创建托管群聊',
  hostOnGatewayBusy: '创建中…',
  hostedOnGateway: name => `"${name}" 现在由网关托管运行`,
  legacyRoomName: name => `${name}（Desktop）`,
  hostedRoom: '网关托管群聊',
  sessionCheckFailed: (member, error) => `无法检查 ${member} 的群聊会话${error ? `（${error}）` : ''}，因此没有新建会话`
}

const zhHant: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} 已被「${owner}」使用`,
  canonicalSendFailed: error => `群組沒有收下這則訊息: ${error}`,
  canonicalActionFailed: error => `閘道拒絕了這次修改: ${error}`,
  canonicalMembersFixed: '閘道託管群組的成員在建立時確定。',
  canonicalAttachmentsUnsupported: group =>
    `無法將附件送達「${group}」的全部成員：託管它的閘道必須支援群組附件，且所有成員都在該閘道上執行`,
  hostOnGateway: '交給閘道託管…',
  hostOnGatewayTitle: '把這個群組聊天交給閘道託管',
  hostOnGatewayDescription: (name, legacyName) =>
    `將建立一個由閘道託管、名為「${name}」的群組聊天，成員、圖片、@ 標籤、工作目錄和停止指令偵測設定保持不變。關閉 Desktop 後它仍會繼續執行，連線到這個閘道的每台 Desktop 都能看到它。目前的群組聊天會以「${legacyName}」的名稱連同歷史記錄保留在本機，並讓出 @ 標籤，不再需要這些記錄時可以解散它`,
  hostOnGatewayAction: '建立託管群組聊天',
  hostOnGatewayBusy: '建立中…',
  hostedOnGateway: name => `「${name}」現在由閘道託管執行`,
  legacyRoomName: name => `${name}（Desktop）`,
  hostedRoom: '閘道託管群組聊天',
  sessionCheckFailed: (member, error) =>
    `無法檢查 ${member} 的群組聊天工作階段${error ? `（${error}）` : ''}，因此沒有建立新的工作階段。`
}

const ru: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} уже принадлежит ${owner}.`,
  canonicalSendFailed: error => `Группа не приняла сообщение: ${error}`,
  canonicalActionFailed: error => `Шлюз отклонил изменение: ${error}`,
  canonicalMembersFixed: 'Состав группы, которой владеет шлюз, задаётся при её создании.',
  canonicalAttachmentsUnsupported: group =>
    `Вложения не дойдут до всех участников "${group}": шлюз-хост должен поддерживать вложения комнаты, и все участники должны работать на нём.`,
  hostOnGateway: 'Передать шлюзу…',
  hostOnGatewayTitle: 'Передать эту комнату шлюзу',
  hostOnGatewayDescription: (name, legacyName) =>
    `Будет создана комната "${name}", которой владеет шлюз, с теми же участниками, картинкой, @-хэндлом, папками и настройкой распознавания стоп-команд. Она продолжает работать, пока этот Desktop закрыт, и видна на каждом Desktop, подключённом к этому шлюзу. Текущая комната сохраняет историю здесь под именем "${legacyName}" и отдаёт свой @-хэндл; распустите её, когда история больше не нужна.`,
  hostOnGatewayAction: 'Создать комнату шлюза',
  hostOnGatewayBusy: 'Создание…',
  hostedOnGateway: name => `"${name}" теперь работает на шлюзе`,
  legacyRoomName: name => `${name} (Desktop)`,
  hostedRoom: 'Комната, которой владеет шлюз',
  sessionCheckFailed: (member, error) =>
    `Не удалось проверить сеанс группы для ${member}${error ? ` (${error})` : ''} — новый сеанс не создан.`
}

const ar: GroupCreateOwnCopy = {
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
  handleTaken: (handle, owner) => `@${handle} يخص ${owner} بالفعل.`,
  canonicalSendFailed: error => `لم تقبل المجموعة الرسالة: ${error}`,
  canonicalActionFailed: error => `رفضت البوابة التغيير: ${error}`,
  canonicalMembersFixed: 'يُحدَّد أعضاء المجموعة التي تملكها البوابة عند إنشائها.',
  canonicalAttachmentsUnsupported: group =>
    `لا يمكن إيصال المرفقات إلى جميع أعضاء "${group}": يجب أن تدعم البوابة المضيفة مرفقات الغرفة وأن يعمل جميع الأعضاء عليها.`,
  hostOnGateway: 'تسليمها إلى البوابة…',
  hostOnGatewayTitle: 'تسليم هذه الغرفة إلى البوابة',
  hostOnGatewayDescription: (name, legacyName) =>
    `ستُنشأ غرفة تملكها البوابة باسم "${name}" بالأعضاء أنفسهم والصورة ومعرّف @ والمجلدات وإعداد كشف أوامر الإيقاف. تواصل العمل بينما هذا الـ Desktop مغلق، وتظهر على كل Desktop متصل بهذه البوابة. تحتفظ الغرفة الحالية بسجلها هنا باسم "${legacyName}" وتتخلى عن معرّف @ الخاص بها؛ حُلّها عندما لا تعود بحاجة إلى السجل.`,
  hostOnGatewayAction: 'إنشاء غرفة البوابة',
  hostOnGatewayBusy: 'جارٍ الإنشاء…',
  hostedOnGateway: name => `"${name}" تعمل الآن على البوابة`,
  legacyRoomName: name => `${name} (Desktop)`,
  hostedRoom: 'غرفة تملكها البوابة',
  sessionCheckFailed: (member, error) =>
    `تعذر التحقق من جلسة المجموعة الخاصة بـ ${member}${error ? ` (${error})` : ''} — لن تُبدأ جلسة جديدة.`
}

/** Everything the fork adds to `b.group.*`: this file's keys, the room's
 *  context-usage readout (`i18n_group_context.ts`), and the reply's
 *  thinking/actions disclosure (`i18n_group_trace.ts`). */
export type GroupCreateCopy = GroupContextCopy & GroupMessageActionsCopy & GroupTraceCopy & GroupCreateOwnCopy

export const groupCreateCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupCreateCopy> = {
  ar: { ...ar, ...groupContextCopy.ar, ...groupMessageActionsCopy.ar, ...groupTraceCopy.ar },
  en: { ...en, ...groupContextCopy.en, ...groupMessageActionsCopy.en, ...groupTraceCopy.en },
  ja: { ...ja, ...groupContextCopy.ja, ...groupMessageActionsCopy.ja, ...groupTraceCopy.ja },
  ru: { ...ru, ...groupContextCopy.ru, ...groupMessageActionsCopy.ru, ...groupTraceCopy.ru },
  zh: { ...zh, ...groupContextCopy.zh, ...groupMessageActionsCopy.zh, ...groupTraceCopy.zh },
  'zh-hant': {
    ...zhHant,
    ...groupContextCopy['zh-hant'],
    ...groupMessageActionsCopy['zh-hant'],
    ...groupTraceCopy['zh-hant']
  }
}
