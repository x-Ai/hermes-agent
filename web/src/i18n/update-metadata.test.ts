import { describe, expect, it } from "vitest";

import { dashboardZh } from "./dashboard";
import { localizeUpdateCheckNotice, localizeUpdateRefusal } from "./update-metadata";

describe("update notice localization", () => {
  const copy = dashboardZh.system;

  it("renders update-check outcomes from the catalog, never from backend English prose", () => {
    const unreachable = {
      install_method: "git", current_version: "1", behind: null,
      update_available: false, can_apply: true, update_command: "hermes update",
      message: "Couldn't reach the update source — try again later."
    };
    expect(localizeUpdateCheckNotice(unreachable, copy)).toBe(copy.updateCheckUnavailable);
    expect(localizeUpdateCheckNotice(unreachable, copy)).not.toContain(unreachable.message);

    const managed = {
      install_method: "apt", current_version: "1", behind: null,
      update_available: false, can_apply: false, update_command: "pkg upgrade hermes-agent",
      message: "Hermes is managed by Termux APT"
    };
    expect(localizeUpdateCheckNotice(managed, copy)).toBe(
      copy.updateWith.replace("{command}", managed.update_command)
    );
  });

  it("localizes stable update refusal codes and keeps remediation commands", () => {
    expect(localizeUpdateRefusal({
      ok: false, name: "hermes-update", pid: null,
      error: "dashboard_update_managed_externally", message: "backend prose",
      update_command: "managed outside dashboard"
    }, copy)).toBe(copy.updatesUnavailable);

    expect(localizeUpdateRefusal({
      ok: false, name: "hermes-update", pid: null, message: "backend prose",
      update_command: "pipx upgrade hermes-agent"
    }, copy)).toBe(copy.updateWith.replace("{command}", "pipx upgrade hermes-agent"));
  });
});
