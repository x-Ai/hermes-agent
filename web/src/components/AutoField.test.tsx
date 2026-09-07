// @vitest-environment jsdom

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/i18n";
import { configFieldSuggestions } from "@/lib/config-field-suggestions";
import { AutoField } from "./AutoField";

let container: HTMLDivElement;
let root: Root;

async function render(ui: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<I18nProvider>{ui}</I18nProvider>));
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe("dashboard config field parity", () => {
  it("renders numeric schema options as a closed picker and preserves number values", async () => {
    const onChange = vi.fn();
    await render(
      <AutoField
        schemaKey="agent.output_truncation_retries"
        schema={{ type: "number", options: [0, 1, 2, 3] }}
        value={0}
        onChange={onChange}
      />
    );

    const picker = container.querySelector('[role="combobox"]') as HTMLButtonElement;
    await act(async () => picker.click());
    const option = [...container.querySelectorAll('[role="option"]')].find(
      candidate => candidate.textContent === "2"
    ) as HTMLElement;
    await act(async () => option.click());

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("turns the custom-endpoint switch into open provider and model suggestions", async () => {
    const config = {
      delegation: { use_custom_endpoints: true, provider: "my-relay" },
      providers: {
        "my-relay": {
          base_url: "http://127.0.0.1:8000/v1",
          model: "glm-5.2",
          models: ["glm-5.2", "glm-5.1"]
        }
      }
    };
    const suggestions = configFieldSuggestions("delegation.model", config);
    await render(
      <AutoField
        schemaKey="delegation.model"
        schema={{ type: "string" }}
        suggestions={suggestions}
        value=""
        onChange={vi.fn()}
      />
    );

    const input = container.querySelector("input[list]") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect([...container.querySelectorAll("datalist option")].map(option => option.getAttribute("value"))).toEqual([
      "glm-5.2",
      "glm-5.1"
    ]);
    expect(configFieldSuggestions("delegation.provider", config)).toEqual(["my-relay"]);
    expect(
      configFieldSuggestions("delegation.provider", {
        ...config,
        delegation: { use_custom_endpoints: false }
      })
    ).toBeUndefined();
  });
});
