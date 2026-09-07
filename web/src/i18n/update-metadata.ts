import type { ActionResponse, UpdateCheckResponse } from "@/lib/api";
import type { DashboardCopy } from "./dashboard";

type SystemCopy = DashboardCopy["system"];

/** Render stable update states from response fields, never backend English prose. */
export function localizeUpdateCheckNotice(info: UpdateCheckResponse, copy: SystemCopy): string {
  if (info.behind === 0) return copy.latestVersion;
  if (info.install_method === "managed-runtime") return copy.updatesUnavailable;
  if (!info.can_apply && info.update_command && info.update_command !== "managed outside dashboard") {
    return copy.updateWith.replace("{command}", info.update_command);
  }
  return copy.updateCheckUnavailable;
}

/** Render an in-place update refusal from its stable code/remediation fields. */
export function localizeUpdateRefusal(response: ActionResponse, copy: SystemCopy): string {
  if (response.error === "dashboard_update_managed_externally") return copy.updatesUnavailable;
  if (response.update_command && response.update_command !== "managed outside dashboard") {
    return copy.updateWith.replace("{command}", response.update_command);
  }
  return copy.updatesUnavailable;
}
