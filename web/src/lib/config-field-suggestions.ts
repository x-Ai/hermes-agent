import { delegationModelOptions, delegationProviderOptions } from "@hermes/shared";

export function configFieldSuggestions(
  schemaKey: string,
  config: Record<string, unknown>
): string[] | undefined {
  if (schemaKey === "delegation.provider") return delegationProviderOptions(config);
  if (schemaKey === "delegation.model") return delegationModelOptions(config);
  return undefined;
}
