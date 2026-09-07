import { Select, SelectOption } from "@nous-research/ui/ui/components/select";
import { Switch } from "@nous-research/ui/ui/components/switch";
import { Input } from "@nous-research/ui/ui/components/input";
import { Label } from "@nous-research/ui/ui/components/label";
import { useI18n } from "@/i18n";
import {
  localizeConfigDescription,
  localizeConfigLabel,
  localizeConfigOption
} from "@/i18n/config-metadata";
import type { Locale } from "@/i18n/types";

function FieldHint({
  locale,
  schema,
  schemaKey
}: {
  locale: Locale;
  schema: Record<string, unknown>;
  schemaKey: string;
}) {
  const keyPath = schemaKey.includes(".") ? schemaKey : "";
  const description = schema.description ? String(schema.description) : "";

  if (!keyPath && !description) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {keyPath && <span className="text-xs font-mono text-text-tertiary">{keyPath}</span>}
      {description && (
        <span className="text-xs text-text-secondary">
          {localizeConfigDescription(schemaKey, description, locale)}
        </span>
      )}
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatScalar(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function NestedValueEditor({
  fieldKey,
  locale,
  value,
  onChange
}: {
  fieldKey: string;
  locale: Locale;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (isRecord(value)) {
    return (
      <div className="grid gap-2 border border-border p-2">
        {Object.entries(value).map(([subKey, subVal]) => (
          <div key={subKey} className="grid gap-1">
            <Label className="text-xs text-muted-foreground">
              {localizeConfigLabel(`${fieldKey}.${subKey}`, locale)}
            </Label>
            <NestedValueEditor
              fieldKey={`${fieldKey}.${subKey}`}
              locale={locale}
              value={subVal}
              onChange={next => onChange({ ...value, [subKey]: next })}
            />
          </div>
        ))}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="grid gap-2">
        {value.map((item, index) => (
          <div key={`${fieldKey}.${index}`} className="grid gap-1">
            <Label className="text-xs text-muted-foreground">
              {locale === "zh" ? `项目 ${index + 1}` : `Item ${index + 1}`}
            </Label>
            <NestedValueEditor
              fieldKey={`${fieldKey}.${index}`}
              locale={locale}
              value={item}
              onChange={next =>
                onChange(value.map((existing, i) => (i === index ? next : existing)))
              }
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Input
      value={formatScalar(value)}
      onChange={e => onChange(e.target.value)}
      className="text-xs"
    />
  );
}

export function AutoField({ schemaKey, schema, suggestions, value, onChange }: AutoFieldProps) {
  const { locale } = useI18n();
  const label = localizeConfigLabel(schemaKey, locale);
  const options = Array.isArray(schema.options) ? schema.options.map(String) : undefined;

  if (isRecord(value) || (Array.isArray(value) && value.some(item => isRecord(item)))) {
    return (
      <div className="grid gap-3 border border-border p-3">
        <Label className="text-xs font-medium">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <NestedValueEditor fieldKey={schemaKey} locale={locale} value={value} onChange={onChange} />
      </div>
    );
  }

  if (schema.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <Label className="text-sm">{label}</Label>
          <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        </div>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }

  if (options) {
    return (
      <div className="grid gap-1.5">
        <Label className="text-sm">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <Select
          value={String(value ?? "")}
          onValueChange={v => onChange(schema.type === "number" ? Number(v) : v)}
        >
          {options.map(opt => (
            <SelectOption key={opt} value={opt}>
              {localizeConfigOption(opt, locale)}
            </SelectOption>
          ))}
        </Select>
      </div>
    );
  }

  if (schema.type === "number") {
    return (
      <div className="grid gap-1.5">
        <Label className="text-sm">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <Input
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={e => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(0);
              return;
            }
            const n = Number(raw);
            if (!Number.isNaN(n)) {
              onChange(n);
            }
          }}
        />
      </div>
    );
  }

  if (schema.type === "text") {
    return (
      <div className="grid gap-1.5">
        <Label className="text-sm">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <textarea
          className="flex min-h-[80px] w-full border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (schema.type === "list") {
    return (
      <div className="grid gap-1.5">
        <Label className="text-sm">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <Input
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          onChange={e =>
            onChange(
              e.target.value
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
            )
          }
          placeholder={locale === "zh" ? "使用逗号分隔" : "comma-separated values"}
        />
      </div>
    );
  }

  if (suggestions && suggestions.length > 0) {
    const suggestionsId = `config-suggestions-${schemaKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    return (
      <div className="grid gap-1.5">
        <Label className="text-sm">{label}</Label>
        <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
        <Input
          autoComplete="off"
          list={suggestionsId}
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
        />
        <datalist id={suggestionsId}>
          {suggestions.map(suggestion => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      <FieldHint locale={locale} schema={schema} schemaKey={schemaKey} />
      <Input value={String(value ?? "")} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

interface AutoFieldProps {
  schemaKey: string;
  schema: Record<string, unknown>;
  suggestions?: string[];
  value: unknown;
  onChange: (v: unknown) => void;
}
