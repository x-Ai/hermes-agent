import type { TranslationOverrides } from './define-locale'

// The free Nous tier's copy (`freeTier`), composed by zh.ts.
export const zhFreeTier: TranslationOverrides['freeTier'] = {
  providerRowTitle: 'Nous · 免费层',
  providerRowPitch: '登录 Nous 账户以解锁更多模型和工具',
  readyTitle: 'Hermes 已就绪',
  readyCaption: '免费 · 含连接器',
  begin: '开始',
  signInInstead: '改为登录 Nous 账户',
  otherProviders: '其他提供方',
  stripTitle: '免费的 Nous 推理和连接器现已可用',
  stripBody: '打开模型选择器试用，或登录 Nous 账户',
  openModelPicker: '打开模型选择器',
  dismiss: '关闭',
  providerName: 'Nous',
  statusLabel: model => `Nous · ${model}`,
  signIn: '登录',
  signInHeading: '登录 Nous 账户以解锁更多模型和工具',
  settingUp: '正在设置免费推理…',
  finishInBrowser: '在浏览器中完成',
  doNotShare: '请勿分享此代码',
  openPageAgain: '重新打开页面',
  waiting: '等待登录…',
  finishingHeading: '正在完成登录…',
  finishingBody: '已在浏览器中批准，正在获取账户令牌',
  signedInAsLabel: '已登录为',
  signedIn: '已登录',
  completedBody: '现在由你的账户提供推理和工具',
  reconnect: '重新连接',
  openConnectors: '打开连接器',
  defaultModel: '默认模型',
  change: '更改',
  done: '完成',
  notNow: '暂不',
  tryAgain: '重试',
  didNotComplete: '登录未完成',
  timedOutHeading: '该登录链接已过期',
  timedOutBody: '随时准备好就可以重新开始，你仍然在免费 Nous 服务上',
  errorBody: '登录未完成，准备好时请再次尝试',
  alreadySignedInHeading: '已登录',
  alreadySignedInBody: '此 Hermes 已登录 Nous 账户',
  offer: {
    heading: '继续使用 Hermes',
    body: '你正在使用免费额度，继续使用 Hermes 的话，你会开始遇到限制，登录免费的 Nous 账户，即可获得更多额度',
    signIn: '登录',
    notNow: '暂不'
  },
  busyHeading: '马上就到了',
  busyBody: wait =>
    `Hermes couldn't finish signing you in because the Nous service is busy. Try again in ${wait}你的会议还在这期间`,
  unreachableBody: 'Hermes无法到达Nous服务完成签约，检查一下你的网络连接 再试一次 你的会议还在',
  setupFailed: {
    gateClosed: '这个版本的Hermes无法在没有Nous账户的情况下启动，签名或创建一个,它是免费的,只需要一分钟',
    paused: '使用Hermes而不签名则暂停片刻. Hermes会继续检查 签字是免费的,让你现在去',
    rateLimited: wait =>
      `Lots of people are getting started right now, so Hermes will try again in ${wait}，签名是免费的,并跳过等待`,
    unreachable: 'Hermes无法到达Nous服务，检查你的互联网连接,然后再试一次，或者联系另一个供应商',
    serverError: 'Nous服务打嗝，立即再试一次, 或者连接另一个提供者',
    powRequired: 'Nous服务器要求工作证明,但这尚未在您的代理中执行，签名或创建一个 Nous 账户继续 .',
    locked: '这个会话没有签名就无法继续，签名或创建免费的 Nous 账户继续运行 .',
    generic: 'Hermes未签约无法设置免费接入，签名是免费的, 或者连接另一个提供者 .',
    signInBelow: '签名是免费的，在下面选Nous.',
    tryAgain: '再试一次',
    retrying: '再次尝试..'
  },
  wait: {
    fewSeconds: '几秒钟',
    aboutMinute: '大约 1 分钟',
    aboutMinutes: count => `大约 ${count} 分钟`,
    aboutHour: '大约 1 小时',
    aboutHours: count => `大约 ${count} 小时`
  }
}
