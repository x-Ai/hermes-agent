import { useId } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@nous-research/ui/ui/components/button'
import { Checkbox } from '@nous-research/ui/ui/components/checkbox'
import { Input } from '@nous-research/ui/ui/components/input'
import { Label } from '@nous-research/ui/ui/components/label'
import { useI18n } from '@/i18n'
import { en } from '@/i18n/en'
import { parseWisdomManifest, wisdomManifestValidationError } from '@/lib/wisdom-manifest'
import type {
  WisdomManifestV1,
  WisdomPluginRequirement,
  WisdomSystemSpecification,
  WisdomToolRequirement
} from '@/lib/wisdom-manifest'

interface SpecificationEditorProps {
  value: WisdomSystemSpecification
  disabled?: boolean
  onChange: (value: WisdomSystemSpecification) => void
}

interface ManifestEditorProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

interface StringListFieldProps {
  label: string
  description: string
  itemLabel: string
  value: string[]
  disabled?: boolean
  placeholder?: string
  onChange: (value: string[]) => void
}

const PLATFORM_OPTIONS = [
  { value: 'macOS', label: 'macOS' },
  { value: 'Linux', label: 'Linux' },
  { value: 'Windows', label: 'Windows' }
] as const

const ARCHITECTURE_OPTIONS = [
  { value: 'arm64', label: 'ARM64 / Apple silicon' },
  { value: 'x86_64', label: 'x86-64 / AMD64' }
] as const

function StringListField({
  label,
  description,
  itemLabel,
  value,
  disabled = false,
  placeholder,
  onChange
}: StringListFieldProps) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        <p className="mt-0.5 text-[11px] leading-4 text-text-tertiary">{description}</p>
      </div>
      {value.map((item, index) => (
        <div key={`${id}-${index}`} className="flex items-center gap-2">
          <Input
            aria-label={`${itemLabel} ${index + 1}`}
            disabled={disabled}
            maxLength={512}
            placeholder={placeholder}
            value={item}
            onChange={event =>
              onChange(value.map((existing, itemIndex) => (itemIndex === index ? event.target.value : existing)))
            }
          />
          <Button
            aria-label={copy.removeItem(itemLabel, index + 1)}
            size="icon"
            outlined
            disabled={disabled}
            onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        outlined
        disabled={disabled || value.length >= 64}
        onClick={() => onChange([...value, ''])}
        prefix={<Plus className="h-3.5 w-3.5" />}
      >
        {copy.addItem(itemLabel)}
      </Button>
    </div>
  )
}

function PresetMultiSelect({
  label,
  description,
  value,
  options,
  disabled,
  onChange
}: {
  label: string
  description: string
  value: string[]
  options: ReadonlyArray<{ value: string; label: string }>
  disabled?: boolean
  onChange: (value: string[]) => void
}) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  const presets = new Set(options.map(option => option.value))
  const custom = value.filter(item => !presets.has(item))
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        <p className="mt-0.5 text-[11px] leading-4 text-text-tertiary">{description}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map(option => {
          const checkboxId = `${id}-${option.value}`
          const checked = value.includes(option.value)
          return (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={checkboxId}
                checked={checked}
                disabled={disabled}
                onCheckedChange={next =>
                  onChange(next === true ? [...value, option.value] : value.filter(item => item !== option.value))
                }
              />
              <Label htmlFor={checkboxId} className="cursor-pointer text-xs font-normal">
                {option.label}
              </Label>
            </div>
          )
        })}
      </div>
      <StringListField
        label={copy.other(label)}
        description={copy.unlistedTargetHint}
        itemLabel={`other ${label.toLowerCase().replace(/s$/, '')}`}
        value={custom}
        disabled={disabled}
        onChange={next => onChange([...value.filter(item => presets.has(item)), ...next])}
      />
    </div>
  )
}

function BooleanField({
  id,
  label,
  description,
  checked,
  disabled,
  onChange
}: {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={next => onChange(next === true)} />
      <div>
        <Label htmlFor={id} className="cursor-pointer text-xs font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-[11px] leading-4 text-text-tertiary">{description}</p>
      </div>
    </div>
  )
}

function ToolRequirements({
  value,
  disabled,
  onChange
}: {
  value: WisdomToolRequirement[]
  disabled?: boolean
  onChange: (value: WisdomToolRequirement[]) => void
}) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  return (
    <div className="space-y-3">
      {value.map((tool, index) => (
        <div key={index} className="grid gap-3 border border-border/80 p-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-tool-${index}`} className="text-xs">
              {copy.toolName}
            </Label>
            <Input
              id={`${id}-tool-${index}`}
              className="mt-1"
              disabled={disabled}
              maxLength={512}
              value={tool.name}
              onChange={event =>
                onChange(
                  value.map((item, itemIndex) => (itemIndex === index ? { ...item, name: event.target.value } : item))
                )
              }
            />
          </div>
          <div>
            <Label htmlFor={`${id}-tool-version-${index}`} className="text-xs">
              {copy.minimumVersionOptional}
            </Label>
            <Input
              id={`${id}-tool-version-${index}`}
              className="mt-1"
              disabled={disabled}
              maxLength={512}
              value={tool.minimum_version ?? ''}
              onChange={event =>
                onChange(
                  value.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, minimum_version: event.target.value || null } : item
                  )
                )
              }
            />
          </div>
          <BooleanField
            id={`${id}-tool-admin-${index}`}
            label={copy.adminRequired}
            description={copy.adminRequiredDescription}
            checked={tool.requires_admin}
            disabled={disabled}
            onChange={requires_admin =>
              onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, requires_admin } : item)))
            }
          />
          <div className="flex items-center justify-between gap-3 text-[11px] text-text-tertiary">
            <span>{copy.autoInstallOff}</span>
            <Button
              size="sm"
              outlined
              disabled={disabled}
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              prefix={<Trash2 className="h-3.5 w-3.5" />}
            >
              {copy.remove}
            </Button>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        outlined
        disabled={disabled || value.length >= 64}
        onClick={() =>
          onChange([...value, { name: '', minimum_version: null, auto_install: false, requires_admin: false }])
        }
        prefix={<Plus className="h-3.5 w-3.5" />}
      >
        {copy.addTool}
      </Button>
    </div>
  )
}

function PluginRequirements({
  value,
  disabled,
  onChange
}: {
  value: WisdomPluginRequirement[]
  disabled?: boolean
  onChange: (value: WisdomPluginRequirement[]) => void
}) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  return (
    <div className="space-y-3">
      {value.map((plugin, index) => (
        <div key={index} className="grid gap-3 border border-border/80 p-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-plugin-${index}`} className="text-xs">
              {copy.pluginId}
            </Label>
            <Input
              id={`${id}-plugin-${index}`}
              className="mt-1"
              disabled={disabled}
              maxLength={512}
              value={plugin.id}
              onChange={event =>
                onChange(
                  value.map((item, itemIndex) => (itemIndex === index ? { ...item, id: event.target.value } : item))
                )
              }
            />
          </div>
          <div>
            <Label htmlFor={`${id}-plugin-version-${index}`} className="text-xs">
              {copy.minimumVersionOptional}
            </Label>
            <Input
              id={`${id}-plugin-version-${index}`}
              className="mt-1"
              disabled={disabled}
              maxLength={512}
              value={plugin.minimum_version ?? ''}
              onChange={event =>
                onChange(
                  value.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, minimum_version: event.target.value || null } : item
                  )
                )
              }
            />
          </div>
          <BooleanField
            id={`${id}-plugin-required-${index}`}
            label={copy.required}
            description={copy.requiredPluginDescription}
            checked={plugin.required}
            disabled={disabled}
            onChange={required =>
              onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, required } : item)))
            }
          />
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              outlined
              disabled={disabled}
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              prefix={<Trash2 className="h-3.5 w-3.5" />}
            >
              {copy.remove}
            </Button>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        outlined
        disabled={disabled || value.length >= 64}
        onClick={() => onChange([...value, { id: '', minimum_version: null, required: true }])}
        prefix={<Plus className="h-3.5 w-3.5" />}
      >
        {copy.addPlugin}
      </Button>
    </div>
  )
}

export function WisdomSystemSpecificationEditor({ value, disabled = false, onChange }: SpecificationEditorProps) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  const update = <K extends keyof WisdomSystemSpecification>(key: K, next: WisdomSystemSpecification[K]) => {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="space-y-4">
      <p className="border border-border bg-muted/10 p-3 text-[11px] leading-4 text-text-secondary">
        {copy.compatibilityIntro}
      </p>
      <fieldset className="grid gap-4 border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.compatibilityTargets}</legend>
        <div>
          <Label htmlFor={`${id}-hermes-version`} className="text-xs font-medium">
            {copy.minimumHermesVersion}
          </Label>
          <p className="mb-2 mt-0.5 text-[11px] text-text-tertiary">{copy.olderHermesBlocked}</p>
          <Input
            id={`${id}-hermes-version`}
            disabled={disabled}
            maxLength={512}
            value={value.hermes.minimum_version}
            onChange={event => update('hermes', { minimum_version: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-context-window`} className="text-xs font-medium">
            {copy.minimumContextWindow}
          </Label>
          <p className="mb-2 mt-0.5 text-[11px] text-text-tertiary">{copy.noMinimum}</p>
          <Input
            id={`${id}-context-window`}
            type="number"
            min={1}
            step={1}
            disabled={disabled}
            value={value.model.minimum_context_window ?? ''}
            onChange={event =>
              update('model', {
                ...value.model,
                minimum_context_window: event.target.value === '' ? null : Number(event.target.value)
              })
            }
          />
        </div>
        <PresetMultiSelect
          label={copy.platforms}
          description={copy.platformsDescription}
          value={value.platforms}
          options={PLATFORM_OPTIONS}
          disabled={disabled}
          onChange={platforms => update('platforms', platforms)}
        />
        <PresetMultiSelect
          label={copy.architectures}
          description={copy.architecturesDescription}
          value={value.architectures}
          options={ARCHITECTURE_OPTIONS}
          disabled={disabled}
          onChange={architectures => update('architectures', architectures)}
        />
        <StringListField
          label={copy.modelCapabilities}
          description={copy.modelCapabilitiesDescription}
          itemLabel={copy.modelCapability}
          value={value.model.capabilities}
          disabled={disabled}
          placeholder="vision"
          onChange={capabilities => update('model', { ...value.model, capabilities })}
        />
        <StringListField
          label={copy.hardware}
          description={copy.hardwareDescription}
          itemLabel={copy.hardwareRequirement}
          value={value.hardware}
          disabled={disabled}
          placeholder="gpu"
          onChange={hardware => update('hardware', hardware)}
        />
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.runtimeAccess}</legend>
        <p className="mb-4 text-[11px] leading-4 text-text-tertiary">
          {copy.runtimeAccessDescription}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <BooleanField
            id={`${id}-shell`}
            label={copy.shellCommands}
            description={copy.shellCommandsDescription}
            checked={value.runtime.shell}
            disabled={disabled}
            onChange={shell => update('runtime', { ...value.runtime, shell })}
          />
          <BooleanField
            id={`${id}-browser`}
            label={copy.browserControl}
            description={copy.browserControlDescription}
            checked={value.runtime.browser}
            disabled={disabled}
            onChange={browser => update('runtime', { ...value.runtime, browser })}
          />
          <BooleanField
            id={`${id}-code`}
            label={copy.codeExecution}
            description={copy.codeExecutionDescription}
            checked={value.runtime.code}
            disabled={disabled}
            onChange={code => update('runtime', { ...value.runtime, code })}
          />
          <BooleanField
            id={`${id}-sandbox`}
            label={copy.sandboxRequired}
            description={copy.sandboxRequiredDescription}
            checked={value.runtime.sandbox}
            disabled={disabled}
            onChange={sandbox => update('runtime', { ...value.runtime, sandbox })}
          />
        </div>
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.toolsAndPlugins}</legend>
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-medium">{copy.tools}</h4>
            <p className="mb-3 mt-0.5 text-[11px] text-text-tertiary">
              {copy.toolsDescription}
            </p>
            <ToolRequirements value={value.tools} disabled={disabled} onChange={tools => update('tools', tools)} />
          </div>
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-medium">{copy.plugins}</h4>
            <p className="mb-3 mt-0.5 text-[11px] text-text-tertiary">
              {copy.pluginsDescription}
            </p>
            <PluginRequirements
              value={value.plugins}
              disabled={disabled}
              onChange={plugins => update('plugins', plugins)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-5 border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.credentialsAndConnections}</legend>
        <StringListField
          label={copy.credentials}
          description={copy.credentialsDescription}
          itemLabel={copy.credential}
          value={value.credentials}
          disabled={disabled}
          placeholder="EXAMPLE_TOKEN"
          onChange={credentials => update('credentials', credentials)}
        />
        <StringListField
          label={copy.connections}
          description={copy.connectionsDescription}
          itemLabel={copy.connection}
          value={value.connections}
          disabled={disabled}
          placeholder="team-mcp"
          onChange={connections => update('connections', connections)}
        />
      </fieldset>

      <fieldset className="grid gap-5 border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.dataAccess}</legend>
        <StringListField
          label={copy.filesystemRead}
          description={copy.filesystemReadDescription}
          itemLabel={copy.readPath}
          value={value.filesystem.read}
          disabled={disabled}
          placeholder="~/project"
          onChange={read => update('filesystem', { ...value.filesystem, read })}
        />
        <StringListField
          label={copy.filesystemWrite}
          description={copy.filesystemWriteDescription}
          itemLabel={copy.writePath}
          value={value.filesystem.write}
          disabled={disabled}
          placeholder="~/project/output"
          onChange={write => update('filesystem', { ...value.filesystem, write })}
        />
        <StringListField
          label={copy.networkDestinations}
          description={copy.networkDestinationsDescription}
          itemLabel={copy.networkDestination}
          value={value.network.destinations}
          disabled={disabled}
          placeholder="api.example.com"
          onChange={destinations => update('network', { destinations })}
        />
        <StringListField
          label={copy.knownLimitations}
          description={copy.knownLimitationsDescription}
          itemLabel={copy.knownLimitation}
          value={value.known_limitations}
          disabled={disabled}
          placeholder={copy.knownLimitationsDescription}
          onChange={known_limitations => update('known_limitations', known_limitations)}
        />
      </fieldset>
    </div>
  )
}

export function WisdomManifestEditor({ value, disabled = false, onChange }: ManifestEditorProps) {
  const copy = useI18n().t.skills.wisdom.reviewUi ?? en.skills.wisdom.reviewUi!
  const id = useId()
  let manifest: WisdomManifestV1
  try {
    manifest = parseWisdomManifest(value)
  } catch (reason) {
    return (
      <div role="alert" className="mt-3 border border-red-500/50 p-3 text-xs text-red-300">
        {copy.formUnavailable}{' '}
        {reason instanceof Error ? reason.message : String(reason)}
      </div>
    )
  }

  const validationError = wisdomManifestValidationError(value)
  const update = (next: WisdomManifestV1) => onChange(JSON.stringify(next))

  return (
    <div className="mt-3 space-y-4">
      {validationError && (
        <div role="alert" className="border border-amber-500/50 bg-amber-500/5 p-3 text-xs text-amber-200">
          {validationError}
        </div>
      )}
      <fieldset className="grid gap-4 border border-border p-4 sm:grid-cols-[1fr_auto]">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide">{copy.skillIdentity}</legend>
        <div>
          <Label htmlFor={`${id}-manifest-name`} className="text-xs font-medium">
            {copy.skillName}
          </Label>
          <p className="mb-2 mt-0.5 text-[11px] text-text-tertiary">{copy.skillNameDescription}</p>
          <Input
            id={`${id}-manifest-name`}
            disabled={disabled}
            maxLength={512}
            value={manifest.name}
            onChange={event => update({ ...manifest, name: event.target.value })}
          />
        </div>
        <div className="min-w-32">
          <Label className="text-xs font-medium">{copy.schemaVersion}</Label>
          <p className="mt-2 font-mono text-sm">1</p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">{copy.schemaVersionDescription}</p>
        </div>
      </fieldset>
      <WisdomSystemSpecificationEditor
        value={manifest.requirements}
        disabled={disabled}
        onChange={requirements => update({ ...manifest, requirements })}
      />
    </div>
  )
}
