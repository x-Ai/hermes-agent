// @vitest-environment jsdom
// The sidebar switcher must never paint the raw `default` identifier: the
// scope value "default" is the dashboard's own profile, and its option carries
// the localized current-dashboard label. Binding the Select to "default" finds
// no matching option and falls back to the raw value.

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ProfileContext } from "@/contexts/profile-context";
import { I18nProvider } from "@/i18n";
import { ProfileSwitcher } from "./ProfileSwitcher";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.setItem("hermes-locale", "zh");
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  localStorage.clear();
});

function render(ui: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  return act(async () => root.render(<I18nProvider>{ui}</I18nProvider>));
}

function triggerText(): string {
  const trigger = container.querySelector(
    "#hermes-profile-switcher [role=combobox]",
  ) as HTMLButtonElement;
  return trigger.textContent ?? "";
}

describe("ProfileSwitcher profile label", () => {
  it("shows the localized dashboard label for the default profile scope", async () => {
    await render(
      <ProfileContext.Provider
        value={{
          profile: "default",
          currentProfile: "default",
          profiles: ["default", "alpha"],
          setProfile: () => {},
        }}
      >
        <ProfileSwitcher />
      </ProfileContext.Provider>,
    );

    expect(triggerText()).toContain("当前管理面板（默认）");
    expect(triggerText()).not.toBe("default");
  });

  it("still shows the named profile the dashboard is managing", async () => {
    await render(
      <ProfileContext.Provider
        value={{
          profile: "alpha",
          currentProfile: "default",
          profiles: ["default", "alpha"],
          setProfile: () => {},
        }}
      >
        <ProfileSwitcher />
      </ProfileContext.Provider>,
    );

    expect(triggerText()).toBe("alpha");
  });
});
