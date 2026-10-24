import type { Translations } from './types'

type ThreadCopy = Translations['assistant']['thread']

// The error card's layer fallbacks (lib/error-surface-copy.ts): used when a failure code has no own entry.
export const zhErrorLayers: Pick<ThreadCopy, 'errorLayerBodies' | 'errorLayers'> = {
  errorLayers: {
    auth: '登录问题',
    billing: '额度不足',
    disk: '磁盘已满',
    endpoint: '无法连接到您的模型服务器',
    gateway: 'Hermes 遇到问题',
    generic: 'Hermes 无法完成此回复',
    provider: 'AI 服务返回了一个错误',
    runtime: 'Hermes 遇到问题',
    streaming: '答复被切断了'
  },
  errorLayerBodies: {
    auth: 'AI 服务拒绝了登录凭据，请检查此提供商的凭据，然后重新发送消息',
    billing: '此提供商账户的额度已用尽，请充值或切换提供商，然后重新发送',
    disk: '磁盘空间已满，Hermes 无法保存此对话，请释放空间后重试',
    endpoint: 'Hermes 无法连接到你的自定义模型服务器，请确认它正在运行，然后重新发送消息',
    gateway: 'Hermes 在开始回复时遇到内部问题，请重新发送消息，若问题持续，请发送诊断信息',
    generic: 'Hermes 回复时出现问题，请重试，若问题持续，请复制错误详情',
    provider: 'AI 服务无法完成此请求，请稍后重试或切换服务商',
    runtime: 'Hermes 在开始回复时遇到内部问题，请重新发送消息，若问题持续，请发送诊断信息',
    streaming: '回复完成前连接已断开，请重试以重新发送'
  }
}
