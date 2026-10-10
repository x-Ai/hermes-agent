/**
 * Copy for the "New group chat" dialog (`CreateGroupChatDialog` in
 * `create-dialog.tsx`): the description under the title, the current-rooms
 * note on each candidate row and the confirm button. Spread into every
 * locale's `group` block in `i18n.ts`, so components keep reading `b.group.*`
 * while the keys stay out of upstream's block (and out of its line count).
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
}

const quoted = (groups: string[], separator = ', ') => groups.map(group => `"${group}"`).join(separator)
const bracketed = (groups: string[]) => groups.map(group => `「${group}」`).join('、')

// English stays byte-identical to the former literals: the e2e specs click
// `Create Group (2)`.
const en: GroupCreateCopy = {
  newDescription: max =>
    `Pick 2–${max} bots. Local memberships sync through each Bot profile; cross-machine members stay scoped to this room.`,
  inGroups: groups => `in ${quoted(groups)}`,
  createAction: count => (count ? `Create Group (${count})` : 'Create Group')
}

const ja: GroupCreateCopy = {
  newDescription: max =>
    `ボットを 2〜${max} 体選びます。ローカルのボットのメンバーシップは各ボットのプロファイルを通じて同期され、他のマシンのメンバーはこのルームにのみ属します`,
  inGroups: groups => `${bracketed(groups)} に参加中`,
  createAction: count => (count ? `グループを作成 (${count})` : 'グループを作成')
}

const zh: GroupCreateCopy = {
  newDescription: max =>
    `选择 2–${max} 个机器人，本机机器人的成员关系会通过各自的配置档案同步，来自其他设备的成员只保留在这个房间内`,
  inGroups: groups => `已加入 ${quoted(groups, '、')}`,
  createAction: count => (count ? `创建群聊 (${count})` : '创建群聊')
}

const zhHant: GroupCreateCopy = {
  newDescription: max =>
    `選擇 2–${max} 個機器人。本機機器人的成員關係會透過各自的設定檔同步，來自其他裝置的成員只保留在這個房間內`,
  inGroups: groups => `已加入 ${bracketed(groups)}`,
  createAction: count => (count ? `建立群組聊天 (${count})` : '建立群組聊天')
}

const ru: GroupCreateCopy = {
  newDescription: max =>
    `Выберите от 2 до ${max} ботов. Участники с этой машины синхронизируются через профиль каждого бота; участники с других машин остаются только в этой комнате.`,
  inGroups: groups => `в ${quoted(groups)}`,
  createAction: count => (count ? `Создать группу (${count})` : 'Создать группу')
}

const ar: GroupCreateCopy = {
  newDescription: max =>
    `اختر من 2 إلى ${max} بوتات. تتم مزامنة عضويات البوتات المحلية عبر ملف تعريف كل بوت، أما الأعضاء من الأجهزة الأخرى فيبقون ضمن هذه الغرفة فقط.`,
  inGroups: groups => `في ${quoted(groups, '، ')}`,
  createAction: count => (count ? `إنشاء مجموعة (${count})` : 'إنشاء مجموعة')
}

export const groupCreateCopy: Record<'ar' | 'en' | 'ja' | 'ru' | 'zh' | 'zh-hant', GroupCreateCopy> = {
  ar,
  en,
  ja,
  ru,
  zh,
  'zh-hant': zhHant
}
