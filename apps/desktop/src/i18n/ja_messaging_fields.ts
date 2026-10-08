import type { Translations } from './types'

// Connector credential fields of Settings › Messaging, keyed by env var: the label,
// help and placeholder the Desktop shows instead of the backend's English
// `prompt` / `description` (hermes_cli/web_routers/messaging.py). Lives beside
// ja.ts so the over-cap root catalog shrinks as the platform list grows.
export const jaMessagingFieldCopy: Translations['messaging']['fieldCopy'] = {
  TELEGRAM_BOT_TOKEN: {
    label: 'ボットトークン',
    help: '@BotFather でボットを作成し、表示されたトークンを貼り付けてください。',
    placeholder: 'Telegram ボットトークンを貼り付け'
  },
  TELEGRAM_ALLOWED_USERS: {
    label: '許可する Telegram ユーザー ID',
    help: '推奨。@userinfobot の数値 ID（1 欄に 1 件）。設定しないと誰でもボットに DM できます。'
  },
  TELEGRAM_PROXY: {
    label: 'プロキシ URL',
    help: 'Telegram がブロックされているネットワークでのみ必要です。'
  },
  DISCORD_BOT_TOKEN: {
    label: 'ボットトークン',
    help: 'Discord Developer Portal でアプリケーションを作成し、ボットを追加してからトークンを貼り付けてください。'
  },
  DISCORD_ALLOWED_USERS: {
    label: '許可する Discord ユーザー ID',
    help: '推奨。Discord ユーザー ID（1 欄に 1 件）。'
  },
  DISCORD_REPLY_TO_MODE: {
    label: '返信スタイル',
    help: 'first、all、または off。'
  },
  DISCORD_ALLOW_ALL_USERS: {
    label: 'すべての Discord ユーザーを許可',
    help: '開発用のみ。true にすると、許可リストなしで誰でもボットに DM できます。'
  },
  DISCORD_HOME_CHANNEL: {
    label: 'ホームチャンネル ID',
    help: 'ボットがプロアクティブなメッセージを送信するチャンネル（Cron 出力、リマインダー）。'
  },
  DISCORD_HOME_CHANNEL_NAME: {
    label: 'ホームチャンネル名',
    help: 'ログやステータス出力でのホームチャンネルの表示名。'
  },
  BLUEBUBBLES_ALLOW_ALL_USERS: {
    label: 'すべての iMessage ユーザーを許可',
    help: 'true にすると BlueBubbles の許可リストをスキップします。'
  },
  MATTERMOST_ALLOW_ALL_USERS: {
    label: 'すべての Mattermost ユーザーを許可'
  },
  MATTERMOST_HOME_CHANNEL: {
    label: 'ホームチャンネル'
  },
  QQ_ALLOW_ALL_USERS: {
    label: 'すべての QQ ユーザーを許可'
  },
  QQBOT_HOME_CHANNEL: {
    label: 'QQ ホームチャンネル',
    help: 'Cron 配信のデフォルトチャンネルまたはグループ。'
  },
  QQBOT_HOME_CHANNEL_NAME: {
    label: 'QQ ホームチャンネル名'
  },
  SLACK_BOT_TOKEN: {
    label: 'Slack ボットトークン',
    help: 'Slack アプリをインストール後、OAuth & Permissions のボットトークンを使用してください。',
    placeholder: 'Slack ボットトークンを貼り付け'
  },
  SLACK_APP_TOKEN: {
    label: 'Slack アプリトークン',
    help: 'Socket Mode に必要なアプリレベルのトークンを使用してください。',
    placeholder: 'Slack アプリトークンを貼り付け'
  },
  SLACK_ALLOWED_USERS: {
    label: '許可する Slack ユーザー ID',
    help: '推奨。Slack ユーザー ID（1 欄に 1 件）。'
  },
  MATTERMOST_URL: {
    label: 'サーバー URL',
    placeholder: 'https://mattermost.example.com'
  },
  MATTERMOST_TOKEN: {
    label: 'ボットトークン',
    help: 'Mattermost ボットトークンまたは個人アクセストークン'
  },
  MATTERMOST_ALLOWED_USERS: {
    label: '許可するユーザー ID',
    help: '推奨。Mattermost ユーザー ID（1 欄に 1 件）。'
  },
  MATRIX_HOMESERVER: {
    label: 'ホームサーバー URL',
    placeholder: 'https://matrix.org',
    help: 'Matrix ホームサーバー URL（例：https://matrix.org）'
  },
  MATRIX_ACCESS_TOKEN: {
    label: 'アクセストークン',
    help: 'Matrix アクセストークン（パスワードログインより優先）'
  },
  MATRIX_USER_ID: {
    label: 'ボットユーザー ID',
    placeholder: '@hermes:example.org',
    help: 'Matrix ユーザー ID（例：@hermes:example.org）'
  },
  MATRIX_ALLOWED_USERS: {
    label: '許可する Matrix ユーザー ID',
    help: '推奨。@user:server 形式のユーザー ID（1 欄に 1 件）。'
  },
  SIGNAL_HTTP_URL: {
    label: 'Signal ブリッジ URL',
    placeholder: 'http://127.0.0.1:8080',
    help: '実行中の signal-cli REST ブリッジの URL。'
  },
  SIGNAL_ACCOUNT: {
    label: '電話番号',
    help: 'signal-cli ブリッジに登録した番号。'
  },
  SIGNAL_ALLOWED_USERS: {
    label: '許可する Signal ユーザー',
    help: '推奨。Signal 識別子（1 欄に 1 件）。'
  },
  WHATSAPP_ENABLED: {
    label: 'WhatsApp ブリッジを有効にする',
    help: '以下のトグルで自動的に設定されます。必要な場合を除いてそのままにしてください。'
  },
  WHATSAPP_MODE: {
    label: 'ブリッジモード'
  },
  WHATSAPP_ALLOWED_USERS: {
    label: '許可する WhatsApp ユーザー',
    help: '推奨。電話番号または WhatsApp ID（1 欄に 1 件）。'
  },
  IRC_SERVER: {
    label: 'IRC サーバー',
    help: 'IRC サーバーのホスト名（例: irc.libera.chat）。',
    placeholder: 'irc.libera.chat'
  },
  IRC_CHANNEL: { label: 'IRC チャンネル', help: '参加する IRC チャンネル（例: #hermes）。' },
  IRC_NICKNAME: { label: 'ボットのニックネーム', help: 'IRC 上のボットのニックネーム（デフォルト: hermes-bot）。' },
  IRC_SERVER_PASSWORD: { label: 'サーバーパスワード', help: 'IRC サーバーのパスワード（必要な場合）。' },
  IRC_NICKSERV_PASSWORD: { label: 'NickServ パスワード', help: 'ニックネーム認証用の NickServ パスワード。' },
  IRC_PORT: { label: 'IRC ポート', help: 'IRC サーバーのポート（デフォルト: TLS は 6697、非 TLS は 6667）。' },
  IRC_USE_TLS: {
    label: 'TLS を使用',
    help: 'IRC 接続に TLS を使用（1/true/yes で有効。ポート 6697 ではデフォルト有効）。'
  },
  IRC_ALLOWED_USERS: { label: '許可するニックネーム', help: 'ボットと会話できる IRC ニックネーム。カンマ区切り。' },
  IRC_ALLOW_ALL_USERS: {
    label: 'すべてのユーザーを許可',
    help: '開発用のみ。チャンネル内の誰でもボットと会話できます。'
  },
  IRC_HOME_CHANNEL: {
    label: 'ホームチャンネル',
    help: 'Cron / 通知配信のチャンネル（デフォルトは IRC_CHANNEL）。'
  },
  GOOGLE_CHAT_SERVICE_ACCOUNT_JSON: {
    label: 'サービスアカウント JSON',
    help: 'サービスアカウント JSON キーのパス（またはインライン JSON）。空欄なら Cloud Run / GCE のアプリケーションデフォルト認証情報 (ADC) を使用し、GOOGLE_APPLICATION_CREDENTIALS にフォールバックします。'
  },
  GOOGLE_CHAT_HTTP_EVENTS_URL: {
    label: 'HTTP イベントコールバック URL',
    help: 'Chat メッセージイベント用の認証済み HTTP エンドポイント。'
  },
  GOOGLE_CHAT_HTTP_EVENTS_AUDIENCE: {
    label: 'HTTP イベントトークンのオーディエンス',
    help: 'Google 署名の HTTP イベント Bearer トークンに期待するオーディエンス。デフォルトは GOOGLE_CHAT_HTTP_EVENTS_URL。'
  },
  GOOGLE_CHAT_HTTP_EVENTS_SERVICE_ACCOUNT_EMAIL: {
    label: 'HTTP イベントサービスアカウントメール',
    help: 'HTTP イベント Bearer トークンに期待する Google サービスアカウントのメールアドレス。'
  },
  GOOGLE_CHAT_PROJECT_ID: {
    label: 'GCP プロジェクト ID',
    help: '任意の Pub/Sub 受信モード用 GCP プロジェクト ID。GOOGLE_CLOUD_PROJECT にフォールバック。'
  },
  GOOGLE_CHAT_SUBSCRIPTION_NAME: {
    label: 'Pub/Sub サブスクリプション名',
    help: 'プルモード受信イベント用の任意の Pub/Sub サブスクリプションパス。'
  },
  GOOGLE_CHAT_ALLOWED_USERS: {
    label: '許可するユーザーメール',
    help: 'ボットと対話できるユーザーのメールアドレス。カンマ区切り。'
  },
  GOOGLE_CHAT_HOME_CHANNEL: {
    label: 'ホームスペース ID',
    help: 'Cron / 通知配信のデフォルトスペース（例: spaces/AAAA...）。'
  },
  LINE_CHANNEL_ACCESS_TOKEN: {
    label: 'チャネルアクセストークン',
    help: 'LINE チャネルの長期アクセストークン（LINE Developers コンソール > Messaging API > チャネルアクセストークン）。'
  },
  LINE_CHANNEL_SECRET: {
    label: 'チャネルシークレット',
    help: 'LINE チャネルシークレット（HMAC-SHA256 Webhook 署名検証に使用）。'
  },
  LINE_PORT: { label: 'Webhook ポート', help: 'Webhook のリッスンポート（デフォルト: 8646）。' },
  LINE_HOST: {
    label: 'Webhook ホスト',
    help: 'Webhook のバインドホスト（デフォルト: 未設定 → デュアルスタック、全インターフェース IPv4+IPv6）。'
  },
  LINE_PUBLIC_URL: {
    label: '公開 HTTPS ベース URL',
    help: 'LINE へ画像/音声/動画を配信するための公開 HTTPS ベース URL（例: https://my-tunnel.example.com）。バインドアドレスに直接到達できない場合、メディア送信に必須。'
  },
  LINE_ALLOWED_USERS: {
    label: '許可するユーザー ID',
    help: 'ボットに DM できる LINE ユーザー ID（U で始まる）。カンマ区切り。'
  },
  LINE_ALLOWED_GROUPS: {
    label: '許可するグループ ID',
    help: 'ボットが応答する LINE グループ ID（C で始まる）。カンマ区切り。'
  },
  LINE_ALLOWED_ROOMS: {
    label: '許可するルーム ID',
    help: 'ボットが応答する LINE ルーム ID（R で始まる）。カンマ区切り。'
  },
  LINE_ALLOW_ALL_USERS: {
    label: 'すべてのユーザーを許可',
    help: '開発用のみ。すべての LINE ユーザーがボットと会話できます（許可リストを無効化）。'
  },
  LINE_HOME_CHANNEL: {
    label: 'ホームチャンネル ID',
    help: 'Cron / 通知配信のデフォルトのユーザー/グループ/ルーム ID。'
  },
  LINE_SLOW_RESPONSE_THRESHOLD: {
    label: '低速応答しきい値（秒）',
    help: '低速 LLM ポストバックボタンが作動するまでの秒数（デフォルト: 45。0 で無効化し常に Push フォールバック）。'
  },
  NTFY_TOPIC: { label: '購読トピック', help: '購読するトピック名（例: hermes-in）。' },
  NTFY_SERVER_URL: { label: 'サーバー URL', help: 'ntfy サーバーの URL（デフォルト: https://ntfy.sh）。' },
  NTFY_TOKEN: { label: '認証トークン', help: 'Bearer トークンまたは Basic 認証用の user:pass（任意）。' },
  NTFY_PUBLISH_TOPIC: { label: '発行トピック', help: '返信を発行するトピック（デフォルトは NTFY_TOPIC）。' },
  NTFY_MARKDOWN: {
    label: 'Markdown を有効化',
    help: 'X-Markdown: true ヘッダー付きで返信を送信（true/false、デフォルト: false）。'
  },
  NTFY_ALLOWED_USERS: { label: '許可するトピック名', help: '許可するトピック名（許可リスト）。カンマ区切り。' },
  NTFY_ALLOW_ALL_USERS: {
    label: 'すべてのトピックを許可',
    help: '開発用のみ。あらゆるトピックがボットと会話できます（許可リストを無効化）。'
  },
  NTFY_HOME_CHANNEL: { label: 'ホームトピック', help: 'Cron / 通知配信のデフォルトトピック。' },
  NTFY_HOME_CHANNEL_NAME: {
    label: 'ホームトピック名',
    help: 'ホームチャンネルの表示名（デフォルトはトピック名）。'
  },
  PHOTON_PROJECT_ID: {
    label: 'Spectrum プロジェクト ID',
    help: 'Spectrum プロジェクト ID（プロジェクトの spectrumProjectId。hermes photon setup で設定）。'
  },
  PHOTON_PROJECT_SECRET: {
    label: 'プロジェクトシークレット',
    help: 'Spectrum プロジェクト ID と対になるシークレット（hermes photon setup で設定）。'
  },
  PHOTON_SIDECAR_PORT: {
    label: 'サイドカー制御ポート',
    help: 'Node サイドカーの制御 + 受信チャネル用ループバックポート（デフォルト 8789）。'
  },
  PHOTON_SIDECAR_AUTOSTART: {
    label: 'サイドカーを自動起動',
    help: '接続時に Node サイドカーを起動（true/false、デフォルト true）。'
  },
  PHOTON_NODE_BIN: {
    label: 'Node 実行ファイルのパス',
    help: 'node バイナリのパス（デフォルト: PATH 上の node）。'
  },
  PHOTON_DASHBOARD_HOST: {
    label: 'Dashboard ホスト',
    help: 'Photon Dashboard API ホスト（デフォルト https://app.photon.codes）。'
  },
  PHOTON_SPECTRUM_HOST: {
    label: 'Spectrum API ホスト',
    help: 'Photon Spectrum API ホスト（デフォルト https://spectrum.photon.codes）。'
  },
  PHOTON_ALLOWED_USERS: { label: '許可するユーザー', help: 'ボットと会話できる E.164 電話番号。カンマ区切り。' },
  PHOTON_ALLOW_ALL_USERS: {
    label: 'すべてのユーザーを許可',
    help: '開発用のみ。あらゆる送信者がボットをトリガーできます（許可リストを無効化）。'
  },
  PHOTON_REQUIRE_MENTION: {
    label: 'グループチャットでメンションを必須にする',
    help: 'メンションのウェイクワードに一致しない限りグループチャットのメッセージを無視します（true/false、デフォルト false）。'
  },
  PHOTON_MENTION_PATTERNS: {
    label: 'グループメンションパターン',
    help: 'グループチャット用メンションウェイクワードの正規表現（JSON リストまたはカンマ/改行区切り。デフォルトは Hermes のウェイクワード）。'
  },
  PHOTON_HOME_CHANNEL: {
    label: 'ホーム Photon ターゲット',
    help: 'Cron / 通知配信のデフォルト Photon ターゲット: Spectrum スペース ID、DM GUID、または素の E.164 電話番号。'
  },
  PHOTON_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'ホームチャンネルの表示名。' },
  PHOTON_TELEMETRY: {
    label: 'Spectrum テレメトリを有効化',
    help: 'サイドカーで Spectrum SDK テレメトリを有効にします（true/false、デフォルト false。hermes photon telemetry on|off で切り替え）。'
  },
  PHOTON_MARKDOWN: {
    label: '返信を Markdown でレンダリング',
    help: '返信を Markdown で送信します — iMessage はネイティブ表示、他の Spectrum プラットフォームはプレーンテキストに劣化（true/false、デフォルト true）。'
  },
  PHOTON_REACTIONS: {
    label: 'リアクションタップバックを有効化',
    help: '処理状況として 👀/👍/👎 をタップバックし、ボットメッセージへのタップバックをエージェントに転送します（true/false、デフォルト false）。'
  },
  SIMPLEX_WS_URL: {
    label: 'デーモン WebSocket URL',
    help: 'simplex-chat デーモンの WebSocket URL（例: ws://127.0.0.1:5225）。'
  },
  SIMPLEX_ALLOWED_USERS: {
    label: '許可する連絡先 ID',
    help: 'ボットと会話できる SimpleX 連絡先 ID。カンマ区切り。'
  },
  SIMPLEX_ALLOW_ALL_USERS: {
    label: 'すべての連絡先を許可',
    help: '開発用のみ。あらゆる連絡先がボットと会話できます（許可リストを無効化）。'
  },
  SIMPLEX_AUTO_ACCEPT: {
    label: '連絡先リクエストを自動承認',
    help: '受信した連絡先リクエストを自動承認します（デフォルト: true）。'
  },
  SIMPLEX_GROUP_ALLOWED: {
    label: '許可するグループ ID',
    help: 'ボットが参加する SimpleX グループ ID（カンマ区切り）、または * で任意のグループを許可。省略するとグループメッセージを完全に無視します（より安全なデフォルト — さもないとグループ内のボットは全メンバーのトラフィックを処理します）。'
  },
  SIMPLEX_HOME_CHANNEL: {
    label: 'ホーム連絡先/グループ ID',
    help: 'Cron / 通知配信のデフォルト連絡先/グループ ID。'
  },
  SIMPLEX_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'ホームチャンネルの表示名（デフォルトは ID）。' },
  HERMES_SIMPLEX_TEXT_BATCH_DELAY: {
    label: 'テキストバッチ遅延（秒）',
    help: '連続して届く受信テキストを 1 つのメッセージイベントに結合する静穏期間の秒数（デフォルト: 0.8）— Telegram のテキストバッチングと同じパターン。'
  },
  SMS_ALLOWED_USERS: { label: '許可する番号', help: 'ボットと会話できる電話番号。カンマ区切り。' },
  SMS_HOME_CHANNEL: { label: 'ホーム番号', help: 'Cron / 通知配信のデフォルト電話番号。' },
  TEAMS_CLIENT_ID: {
    label: 'Azure AD クライアント ID',
    help: 'Azure AD アプリケーション（Bot Framework）のクライアント ID。'
  },
  TEAMS_CLIENT_SECRET: {
    label: 'Azure AD クライアントシークレット',
    help: 'Azure AD アプリケーションのクライアントシークレット。'
  },
  TEAMS_TENANT_ID: {
    label: 'Azure AD テナント ID',
    help: 'ボットアプリケーションをホストする Azure AD テナント ID。'
  },
  TEAMS_PORT: { label: 'Webhook ポート', help: 'Webhook のリッスンポート（Bot Framework デフォルト: 3978）。' },
  TEAMS_HOST: {
    label: 'Webhook ホスト',
    help: 'Webhook のバインドホスト（デフォルト: 未設定 → デュアルスタック、全インターフェース IPv4+IPv6）。'
  },
  TEAMS_ALLOWED_USERS: {
    label: '許可するユーザー',
    help: 'ボットと会話できる Teams ユーザー ID / UPN。カンマ区切り。'
  },
  TEAMS_ALLOW_ALL_USERS: {
    label: 'すべてのユーザーを許可',
    help: '開発用のみ。すべての Teams ユーザーがボットをトリガーできます。'
  },
  TEAMS_HOME_CHANNEL: { label: 'ホームチャンネル', help: 'Cron / 通知配信のデフォルトのチャット/チャンネル ID。' },
  TEAMS_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'Teams ホームチャンネルの表示名。' },
  WECOM_WEBSOCKET_URL: { label: 'WebSocket URL', help: 'WeCom スマートロボットの WebSocket URL。' },
  WECOM_HOME_CHANNEL: { label: 'ホーム会話 ID', help: 'Cron / 通知配信のデフォルトチャット ID。' },
  WECOM_ALLOWED_USERS: { label: '許可するユーザー', help: 'ボットと会話できる WeCom ユーザー ID。カンマ区切り。' },
  A2A_AGENT_NAME: {
    label: 'A2A エージェント名',
    help: 'このエージェントの Agent Card に公開される名前（デフォルト：ホスト名から生成）。',
    placeholder: 'A2A エージェント名'
  },
  A2A_BEARER_TOKEN: {
    label: 'A2A 共有トークン（空の場合はローカルのみ）',
    help: 'インバウンド A2A 呼び出し用の共有トークン（IDが呼び出し元 IP にフォールバック）。トークン未設定の場合は 127.0.0.1 のみにバインドします。',
    placeholder: 'A2A 共有トークン（空の場合はローカルのみ）'
  },
  A2A_HOST: {
    label: 'A2A バインドホスト（デフォルト 127.0.0.1）',
    help: 'インバウンドバインドホスト。デフォルト 127.0.0.1；トークン設定時かつここで選択した場合のみ 0.0.0.0 に拡張。',
    placeholder: 'A2A バインドホスト（デフォルト 127.0.0.1）'
  },
  A2A_PORT: {
    label: 'A2A ポート（デフォルト 9900）',
    help: 'インバウンド A2A サーバーポート（デフォルト 9900）。',
    placeholder: 'A2A ポート（デフォルト 9900）'
  },
  A2A_PEER_TOKENS: {
    label: 'A2A ピアトークン（name:token、カンマ区切り；または空）',
    help: 'ピアエージェントごとのトークン（例：alice:tok1,bob:tok2）。マッチした名前がレート制限、信頼、監査に使用される ID になります。',
    placeholder: 'A2A ピアトークン（name:token、カンマ区切り；または空）'
  },
  A2A_HOME_CHANNEL: {
    label: 'A2A ホームチャンネル（または空）',
    help: 'deliver=a2a の場合に cron / 通知配信で使用するタスク/コンテキスト ID。'
  },
  A2A_ALLOW_ALL_USERS: {
    label: 'すべての A2A ピアを許可',
    help: '認証済みの A2A ピアがこのエージェントにアクセスできるようにします（開発用のみ）。'
  },
  RAFT_PROFILE: {
    label: 'Raft エージェントプロファイル',
    help: 'Raft エージェントプロファイルスラグ — 設定するとアダプターが自動有効化されます。',
    placeholder: 'Raft エージェントプロファイル'
  },
  BUZZ_RELAY_URL: {
    label: 'Buzz リレー URL',
    help: 'Buzz コミュニティリレーのベース URL（例：https://mycommunity.communities.buzz.xyz）。',
    placeholder: 'Buzz リレー URL'
  },
  BUZZ_PRIVATE_KEY: {
    label: 'Nostr 秘密鍵（nsec または hex）',
    help: 'エージェントの Buzz アイデンティティ用 Nostr 秘密鍵（nsec または hex）— 唯一の Buzz シークレット。'
  },
  BUZZ_CLI_PATH: {
    label: 'buzz CLI パス（または空）',
    help: 'buzz CLI バイナリのパス（デフォルト：PATH の buzz、次に ~/bin/buzz）。'
  },
  BUZZ_CHANNELS: {
    label: 'チャンネル UUID（カンマ区切り）',
    help: '監視するチャンネルの UUID（カンマ区切り、デフォルト：参加中のすべてのチャンネル）。'
  },
  BUZZ_HOME_CHANNEL: {
    label: 'ホームチャンネル UUID（または空）',
    help: 'cron / 通知配信に使用するチャンネル UUID（デフォルト：最初の監視チャンネル）。'
  },
  BUZZ_ALLOWED_USERS: {
    label: '許可するユーザー（カンマ区切り）',
    help: 'エージェントと会話できる npub または hex 公開鍵。カンマ区切り。'
  },
  BUZZ_ALLOW_ALL_USERS: {
    label: 'すべてのユーザーを許可？（true/false）',
    help: 'すべてのコミュニティメンバーがエージェントと会話できるようにします（true/false）。'
  },
  BUZZ_TRANSPORT: {
    label: 'トランスポート（auto/websocket/poll）',
    help: 'インバウンドトランスポート：auto（WebSocket + ポールフォールバック、デフォルト）、websocket、または poll。'
  },
  BUZZ_POLL_INTERVAL: { label: 'ポール間隔（秒）', help: 'インバウンドポールスイープの間隔秒数（デフォルト 4）。' },
  BUZZ_AUTH_TAG: {
    label: 'NIP-OA auth tag JSON（または空）',
    help: 'NIP-42 WebSocket 認証用のオプション NIP-OA 所有者証明 auth tag JSON。'
  },
  BUZZ_CREDENTIALS_FILE: {
    label: '認証情報ファイルパス（または空）',
    help: 'nsec を保持する JSON 認証情報ファイル（BUZZ_PRIVATE_KEY 未設定時のフォールバック）。'
  },
  TELEGRAM_ALLOW_ALL_USERS: {
    label: 'すべての Telegram ユーザーを許可',
    help: '開発用のみ。すべての Telegram ユーザーがボットを利用できます。'
  },
  TELEGRAM_HOME_CHANNEL: { label: 'ホームチャンネル ID', help: 'Cron / 通知配信のデフォルトチャット ID。' },
  TELEGRAM_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'Telegram ホームチャンネルの表示名。' },
  SLACK_ALLOW_ALL_USERS: {
    label: 'すべての Slack ユーザーを許可',
    help: '開発用のみ。すべての Slack ユーザーがボットを利用できます。'
  },
  SLACK_HOME_CHANNEL: {
    label: 'ホームチャンネル ID',
    help: 'Cron / 通知配信のデフォルトチャンネル ID（C で始まる）。'
  },
  SLACK_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'Slack ホームチャンネルの表示名。' },
  SLACK_THREAD_REQUIRE_MENTION: {
    label: 'スレッド内で @メンションを必須にする',
    help: 'Slack スレッドの返信に明示的な @メンションを必須にします。トップレベルの自由応答チャンネルには影響しません。'
  },
  MATTERMOST_ALLOWED_CHANNELS: {
    label: '許可するチャンネル ID',
    help: '設定するとボットはこれらのチャンネルでのみ応答します（ホワイトリスト）。カンマ区切り。'
  },
  MATTERMOST_FREE_RESPONSE_CHANNELS: {
    label: '自由応答チャンネル ID',
    help: '@メンションなしでボットが応答する Mattermost チャンネル ID。カンマ区切り。'
  },
  MATTERMOST_REPLY_MODE: { label: '返信モード', help: 'thread（ネスト）または off（フラット）。デフォルト: off。' },
  MATTERMOST_REQUIRE_MENTION: {
    label: 'チャンネル内で @メンションを必須にする',
    help: 'Mattermost チャンネルで @メンションを必須にします（デフォルト: true）。false にするとすべてのメッセージに応答します。'
  },
  MATRIX_ALLOW_ALL_USERS: {
    label: 'すべての Matrix ユーザーを許可',
    help: '開発用のみ。すべての Matrix ユーザーがボットを利用できます。'
  },
  MATRIX_AUTO_THREAD: {
    label: 'ルームでスレッドを自動作成',
    help: 'Matrix ルームのメッセージにスレッドを自動作成します（デフォルト: true）。'
  },
  MATRIX_DEVICE_ID: {
    label: 'デバイス ID',
    help: 'E2EE 永続化のための再起動後も変わらない Matrix デバイス ID（例: HERMES_BOT）。'
  },
  MATRIX_DM_AUTO_THREAD: {
    label: 'DM でスレッドを自動作成',
    help: 'Matrix の DM にスレッドを自動作成します（デフォルト: false）。'
  },
  MATRIX_FREE_RESPONSE_ROOMS: {
    label: '自由応答ルーム ID',
    help: '@メンションなしでボットが応答する Matrix ルーム ID。カンマ区切り。'
  },
  MATRIX_HOME_CHANNEL: { label: 'ホームルーム ID', help: 'Cron / 通知配信のデフォルトルーム ID。' },
  MATRIX_HOME_CHANNEL_NAME: { label: 'ホームルーム名', help: 'Matrix ホームルームの表示名。' },
  MATRIX_PASSWORD: {
    label: 'Matrix パスワード',
    help: 'Matrix アカウントのパスワード（アクセストークンの代替）。'
  },
  MATRIX_RECOVERY_KEY: {
    label: 'リカバリーキー',
    help: 'デバイスキーのローテーション後にクロス署名検証へ使うリカバリーキー（Element: 設定 → セキュリティ → リカバリーキー）。'
  },
  MATRIX_REQUIRE_MENTION: {
    label: 'ルームで @メンションを必須にする',
    help: 'Matrix ルームで @メンションを必須にします（デフォルト: true）。false にするとすべてのメッセージに応答します。'
  },
  WHATSAPP_DM_POLICY: { label: 'DM ポリシー', help: 'WhatsApp ダイレクトメッセージの承認方法。' },
  WHATSAPP_ALLOW_ALL_USERS: {
    label: 'すべての WhatsApp ユーザーを許可',
    help: '開発用のみ。すべての WhatsApp ユーザーがボットを利用できます。'
  },
  WHATSAPP_HOME_CHANNEL: { label: 'ホームチャンネル ID', help: 'Cron / 通知配信のデフォルトチャット ID。' },
  WHATSAPP_HOME_CHANNEL_NAME: { label: 'ホームチャンネル名', help: 'WhatsApp ホームチャンネルの表示名。' },
  BLUEBUBBLES_SERVER_URL: {
    label: 'サーバー URL',
    help: 'iMessage 連携用の BlueBubbles サーバー URL。',
    placeholder: 'http://192.168.1.10:1234'
  },
  BLUEBUBBLES_PASSWORD: {
    label: 'サーバーパスワード',
    help: 'BlueBubbles サーバーのパスワード（BlueBubbles Server → 設定 → API）。'
  },
  BLUEBUBBLES_ALLOWED_USERS: {
    label: '許可する iMessage アドレス',
    help: '推奨。カンマ区切りの iMessage アドレス（メールまたは電話番号）。'
  },
  HASS_URL: {
    label: 'Home Assistant URL',
    help: 'Home Assistant のベース URL。',
    placeholder: 'http://homeassistant.local:8123'
  },
  HASS_TOKEN: { label: '長期アクセストークン', help: 'Home Assistant の長期アクセストークン。' },
  EMAIL_ADDRESS: { label: 'メールアドレス', help: 'メールアカウントのアドレス。' },
  EMAIL_PASSWORD: { label: 'メールパスワード', help: 'メールアカウントのパスワード / アプリパスワード。' },
  EMAIL_IMAP_HOST: {
    label: 'IMAP ホスト',
    help: '受信ポーリングに使う IMAP ホスト。',
    placeholder: 'imap.gmail.com'
  },
  EMAIL_SMTP_HOST: { label: 'SMTP ホスト', help: '送信に使う SMTP ホスト。', placeholder: 'smtp.gmail.com' },
  EMAIL_ALLOWED_USERS: {
    label: '許可するメールアドレス',
    help: '推奨。ボットと会話できるメールアドレス。カンマ区切り。'
  },
  EMAIL_HOME_ADDRESS: { label: 'ホームアドレス', help: 'Cron / 通知配信のデフォルトメールアドレス。' },
  EMAIL_SMTP_PORT: { label: 'SMTP ポート', help: 'SMTP ポート（デフォルト 587）。' },
  TWILIO_ACCOUNT_SID: { label: 'Twilio Account SID', help: 'Twilio コンソールの Account SID。' },
  TWILIO_AUTH_TOKEN: { label: 'Twilio Auth Token', help: 'Twilio コンソールの Auth Token。' },
  TWILIO_PHONE_NUMBER: { label: 'Twilio 電話番号', help: 'SMS を送信できる Twilio の番号（E.164 形式）。' },
  DINGTALK_CLIENT_ID: { label: 'Client ID (App Key)', help: 'DingTalk アプリの App Key（Client ID）。' },
  DINGTALK_CLIENT_SECRET: { label: 'Client Secret', help: 'DingTalk アプリの App Secret（Client Secret）。' },
  DINGTALK_ALLOWED_USERS: {
    label: '許可するユーザー',
    help: 'ボットと会話できるスタッフ / 送信者 ID。カンマ区切り（* は全員）。'
  },
  DINGTALK_HOME_CHANNEL: { label: 'ホーム会話 ID', help: 'Cron / 通知配信のデフォルト会話 ID。' },
  DINGTALK_HOME_CHANNEL_NAME: { label: 'ホーム会話名', help: 'DingTalk ホーム会話の表示名。' },
  DINGTALK_WEBHOOK_URL: {
    label: 'ロボット Webhook URL',
    help: 'クロスプラットフォーム / Cron 配信用の固定ロボット Webhook URL（任意）。'
  },
  FEISHU_APP_ID: { label: 'App ID', help: 'Feishu / Lark アプリの App ID。' },
  FEISHU_APP_SECRET: { label: 'App Secret', help: 'Feishu / Lark アプリの App Secret。' },
  FEISHU_ENCRYPT_KEY: { label: '暗号化キー (Encrypt Key)', help: 'Feishu / Lark のイベント暗号化キー。' },
  FEISHU_VERIFICATION_TOKEN: {
    label: '検証トークン (Verification Token)',
    help: 'Feishu / Lark のイベント検証トークン。'
  },
  FEISHU_ALLOWED_USERS: {
    label: '許可するユーザー ID',
    help: '推奨。ボットと会話できる Feishu ユーザー ID。カンマ区切り。'
  },
  FEISHU_ALLOW_ALL_USERS: {
    label: 'すべての Feishu ユーザーを許可',
    help: '開発用のみ。すべての Feishu ユーザーがボットを利用できます。'
  },
  FEISHU_DOMAIN: { label: 'ドメイン (feishu/lark)', help: 'feishu（中国版）または lark（国際版）。' },
  FEISHU_HOME_CHANNEL: { label: 'ホームチャット ID', help: 'Cron / 通知配信のデフォルトチャット ID。' },
  FEISHU_HOME_CHANNEL_NAME: { label: 'ホームチャット名', help: 'Feishu ホームチャットの表示名。' },
  WECOM_BOT_ID: { label: 'ボット ID', help: 'WeCom スマートロボットのボット ID。' },
  WECOM_SECRET: { label: 'ボット Secret', help: 'WeCom スマートロボットの secret。' },
  WECOM_CALLBACK_CORP_ID: {
    label: '企業 ID (Corp ID)',
    help: 'WeCom コールバックモードの企業 ID（自社構築アプリ）。'
  },
  WECOM_CALLBACK_CORP_SECRET: { label: 'アプリ Secret', help: 'WeCom コールバックモードのアプリ Secret。' },
  WECOM_CALLBACK_AGENT_ID: { label: 'アプリ Agent ID', help: 'WeCom コールバックモードのアプリ Agent ID。' },
  WECOM_CALLBACK_TOKEN: { label: 'コールバックトークン', help: 'WeCom コールバック検証トークン。' },
  WECOM_CALLBACK_ENCODING_AES_KEY: {
    label: 'EncodingAESKey',
    help: 'メッセージ暗号化用の WeCom コールバック EncodingAESKey。'
  },
  WEIXIN_ACCOUNT_ID: {
    label: 'iLink Bot アカウント ID',
    help: 'hermes gateway setup の QR ログインで取得した iLink Bot アカウント ID。'
  },
  WEIXIN_TOKEN: {
    label: 'iLink Bot トークン',
    help: 'hermes gateway setup の QR ログインで取得した iLink Bot トークン。'
  },
  WEIXIN_BASE_URL: {
    label: 'iLink API ベース URL',
    help: 'QR ログインで保存された iLink API ベース URL（デフォルト: https://ilinkai.weixin.qq.com）。'
  },
  QQ_APP_ID: { label: 'App ID', help: 'QQ オープンプラットフォーム (q.qq.com) のボット App ID。' },
  QQ_CLIENT_SECRET: { label: 'Client Secret', help: 'QQ オープンプラットフォームのボット Client Secret。' },
  QQ_ALLOWED_USERS: {
    label: '許可する QQ ユーザー',
    help: '推奨。ボットを利用できる QQ ユーザー ID。カンマ区切り。'
  },
  QQ_GROUP_ALLOWED_USERS: {
    label: '許可する QQ グループ',
    help: 'ボットと対話できる QQ グループ ID。カンマ区切り。'
  },
  QQ_SANDBOX: {
    label: 'サンドボックスモード',
    help: '開発テスト用に QQ サンドボックスモードを有効にします（true/false）。'
  },
  API_SERVER_ENABLED: {
    label: 'API サーバーを有効にする',
    help: 'OpenAI 互換の API サーバーを有効にします（true/false）。Open WebUI や LobeChat などのフロントエンドが接続できます。'
  },
  API_SERVER_KEY: {
    label: '認証キー',
    help: 'API サーバー認証用の Bearer トークン。API サーバーを有効にする場合は必須で、未設定だとサーバーは起動を拒否します。'
  },
  API_SERVER_PORT: { label: 'ポート', help: 'API サーバーのポート（デフォルト: 8642）。' },
  API_SERVER_HOST: {
    label: 'バインドアドレス',
    help: 'API サーバーのバインドアドレス（デフォルト: 127.0.0.1）。ループバックのみでも認証キーは必須です。'
  },
  API_SERVER_MODEL_NAME: {
    label: 'モデル名',
    help: '/v1/models で公開されるモデル名。デフォルトはプロファイル名（デフォルトプロファイルでは hermes-agent）。OpenWebUI のマルチユーザー構成に便利です。'
  },
  WEBHOOK_ENABLED: {
    label: 'Webhook を有効にする',
    help: 'GitHub や GitLab などからイベントを受信する Webhook アダプターを有効にします。'
  },
  WEBHOOK_PORT: { label: 'ポート', help: 'Webhook HTTP サーバーのポート（デフォルト: 8644）。' },
  WEBHOOK_SECRET: {
    label: '署名シークレット',
    help: 'Webhook 署名検証用のグローバル HMAC シークレット（config.yaml でルートごとに上書き可能）。'
  },
  TELEGRAM_WEBHOOK_SECRET: {
    label: 'Webhook シークレット',
    help: 'Telegram が各 Webhook 更新と共に送るシークレットトークン（TELEGRAM_WEBHOOK_URL を設定した場合は必須）。'
  },
  EMAIL_AUTHSERV_ID: {
    label: '受信 MTA の authserv-id',
    help: 'メールサーバーの最上位 Authentication-Results ヘッダーにある authserv-id そのもの（例: mx.google.com）。EMAIL_TRUST_FROM_HEADER=true でない限り必須。'
  },
  A2A_PUSH_SECRET: {
    label: 'A2A プッシュ署名シークレット（または空）',
    help: 'プッシュ通知に署名する HMAC シークレット（デフォルトは A2A 共有トークン）。'
  },
  BUZZ_REPLY_IN_THREAD: {
    label: 'スレッドで返信しますか？（true/false）',
    help: 'トリガーしたメッセージの下にスレッドで返信します（true/false、デフォルト: true）。false の場合はチャンネルのタイムラインにそのまま投稿します。'
  },
  PHOTON_READ_RECEIPTS: {
    label: '既読通知を送信しますか？（true/false）',
    help: 'Hermes へ転送した後、受信した iMessage を既読にします（true/false、デフォルト: true）。'
  },
  PHOTON_SIDECAR_TOKEN: {
    label: 'サイドカートークン',
    help: 'ループバックのサイドカーチャネル用共有シークレット（デフォルト: 起動ごとにランダム生成）。'
  },
  TEAMS_GRAPH_ACCESS_TOKEN: {
    label: 'Graph アクセストークン（または空）',
    help: 'graph モードで会議サマリーを配信するための Microsoft Graph アクセストークン。'
  },
  TEAMS_INCOMING_WEBHOOK_URL: {
    label: '受信 Webhook URL（または空）',
    help: 'webhook モードで会議サマリーを配信するための受信 Webhook URL（URL 自体が資格情報です）。'
  }
}
