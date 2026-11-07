import type { TranslationOverride } from '@hermes/shared/i18n'

import type { UninstallSectionTranslations } from './types_uninstall_section'

// Settings › About › Uninstall, composed by ru.ts as `settings.uninstallSection` (file-size split).
export const ruUninstallSection: TranslationOverride<UninstallSectionTranslations> = {
  dangerZone: 'Опасная зона',
  uninstallHermes: 'Удаление Hermes',
  managedBody: 'Этой установкой управляет система, поэтому Hermes не может удалить себя сам.',
  dataKept: path => `Конфигурация, чаты и секреты хранятся в ${path}. При удалении приложения они не удаляются.`,
  openAppsSettings: 'Открыть параметры приложений',
  chooseHowMuch:
    'Выберите, что удалить. Приложение закроется, чтобы завершить удаление; вернуться можно в любой момент, снова открыв установщик.',
  confirmUninstall: 'Подтвердите удаление',
  confirmBody: what => `Будет удалено: ${what}. Это нельзя отменить.`,
  appLabel: 'Приложение:',
  couldNotStart: 'Не удалось начать удаление.',
  uninstalling: 'Удаление…',
  yesUninstall: 'Да, удалить',
  options: {
    gui: {
      title: 'Удалить только Chat GUI',
      description: 'Удаляет это приложение. Агент Hermes, ваша конфигурация и чаты остаются.',
      consequence: 'настольный Chat GUI (это приложение и его данные)'
    },
    lite: {
      title: 'Удалить GUI + агента, сохранить мои данные',
      description:
        'Удаляет приложение и агента Hermes, но сохраняет конфигурацию, чаты и секреты для будущей переустановки.',
      consequence: 'Chat GUI и агент Hermes (конфигурация, чаты и секреты сохранятся)'
    },
    full: {
      title: 'Удалить всё',
      description:
        'Удаляет приложение, агента и все пользовательские данные — конфигурацию, чаты, запланированные задачи, секреты, журналы.',
      consequence: 'ВСЁ — Chat GUI, агент Hermes и вся ваша конфигурация, все чаты, секреты и журналы'
    }
  }
}
