import type { Translations } from './types'

export const zhConnectorAccounts: Translations['connectorsPage']['accounts'] = {
  heading: '账号',
  count: (count: number) => `${count} 个账号`,
  addAnother: '添加另一个账号',
  aliasLabel: '账号名称',
  aliasHint: '小写字母、数字和短横线，最多 32 个字符，例如 work 或 home',
  aliasInvalid: '请使用小写字母、数字和短横线，并以字母或数字开头',
  aliasTaken: '该名称已被使用',
  add: '连接',
  rename: '重命名',
  renameLabel: (name: string) => `${name} 的新名称`,
  renameGone: '该账号已不存在，它已被移除或被重新连接替换',
  remove: '移除',
  removeTitle: (app: string, name: string) => `移除 ${app} 账号 ${name}？`,
  removeBody: 'Hermes 将不再以此账号操作，你的其他账号保持连接',
  retiredCount: (count: number) => `${count} 个已弃用`,
  status: {
    expired: '授权已过期',
    failed: '连接失败',
    inactive: '未激活',
    pending: '等待登录',
    retired: '已被重新连接替换',
    revoked: '授权已撤销'
  }
}
