// @vitest-environment jsdom
// "Generate share link" publishes a summary to a public paste, so it must ask first: the consent
// dialog reads in the dashboard language, says what the summary carries, and the upload runs
// only from its confirm button.

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/i18n";
import { dashboardZh } from "@/i18n/dashboard";
import { zh as zhCatalog } from "@/i18n/zh";
import { DebugShareButton } from "./SystemPage";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

// Node 26 defines an experimental global `localStorage` that shadows jsdom's and is undefined
// without --localstorage-file, so the test and the I18nProvider share one in-memory Storage.
const stored = new Map<string, string>();
const memoryStorage = {
  clear: () => stored.clear(),
  getItem: (key: string) => stored.get(key) ?? null,
  key: (index: number) => [...stored.keys()][index] ?? null,
  get length() {
    return stored.size;
  },
  removeItem: (key: string) => void stored.delete(key),
  setItem: (key: string, value: string) => void stored.set(key, String(value)),
};

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage);
  localStorage.setItem("hermes-locale", "zh");
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
});

async function waitFor(cond: () => boolean, timeoutMs = 5000) {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeoutMs) throw new Error("waitFor: condition never became true");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  }
}

function click(el: Element | null | undefined) {
  if (!el) throw new Error("element not rendered");
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

const buttonNamed = (scope: ParentNode, label: string) =>
  Array.from(scope.querySelectorAll("button")).find((b) => b.textContent?.trim() === label);

const copy = dashboardZh.system;

async function openConsent() {
  const onConfirm = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const ui: ReactNode = <DebugShareButton sharing={false} onConfirm={onConfirm} />;
  await act(async () => root.render(<I18nProvider>{ui}</I18nProvider>));
  await act(async () => click(buttonNamed(container, copy.generateShare)));
  await waitFor(() => Boolean(document.querySelector('[role="alertdialog"]')));
  return { dialog: document.querySelector('[role="alertdialog"]')!, onConfirm };
}

describe("DebugShareButton consent", () => {
  it("asks in the dashboard language and uploads only from the confirm button", async () => {
    const { dialog, onConfirm } = await openConsent();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog.textContent).toContain(copy.shareConfirmTitle);
    expect(dialog.textContent).toContain(copy.shareConfirmDescription);

    await act(async () => click(buttonNamed(dialog, copy.upload)));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uploads nothing when the dialog is cancelled", async () => {
    const { dialog, onConfirm } = await openConsent();

    await act(async () => click(buttonNamed(dialog, zhCatalog.common.cancel)));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
