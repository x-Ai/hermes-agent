#!/usr/bin/env python3
"""
BOTS plugin i18n 文本替换辅助脚本
系统地将 plugin.js 中的硬编码英文文本替换为 i18n 翻译调用
"""

import re

# 文本替换映射：英文文本 -> i18n key
REPLACEMENTS = {
    # Common actions
    "'Cancel'": "t('cancel')",
    '"Cancel"': 't("cancel")',
    "'Save'": "t('save')",
    '"Save"': 't("save")',
    "'Create'": "t('create')",
    '"Create"': 't("create")',
    "'Delete'": "t('delete')",
    '"Delete"': 't("delete")',
    "'Back'": "t('back')",
    '"Back"': 't("back")',
    "'Close'": "t('close')",
    '"Close"': 't("close")',
    "'retry'": "t('retry')",
    '"retry"': 't("retry")',
    "'Send'": "t('send')",
    '"Send"': 't("send")',

    # Bot roster
    "'BOTS'": "t('bots')",
    '"BOTS"': 't("bots")',
    "'No agents yet'": "t('noBots')",
    '"No agents yet"': 't("noBots")',
