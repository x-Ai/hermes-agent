/** A drop item the composer could not attach: what was dropped, and why when it is known. */
export interface DropFailure {
  name: string
  reason?: string
}

/** How many failed drop items the warning names before it counts the rest. */
const DROP_FAILURES_SHOWN = 3

/** The longest name the warning shows whole; a longer one keeps its start and its end. */
const DROP_FAILURE_NAME_CHARS = 48

/** The warning names failures until this many characters, then counts the rest. */
const DROP_WARNING_CHARS = 240

function middleEllipsis(text: string, max: number): string {
  if (text.length <= max) {
    return text
  }

  const head = Math.ceil((max - 1) / 2)

  return `${text.slice(0, head)}…${text.slice(text.length - (max - 1 - head))}`
}

function failureText(
  { name, reason }: DropFailure,
  item: (name: string) => string,
  maxName = Infinity,
  joined = false
): string {
  const label = item(middleEllipsis(name, maxName))
  // A reason ends with a period, which reads '….;' before the '; ' that joins the next item.
  // In Chinese or Japanese the period is '。'.
  const text = joined ? reason?.replace(/[.。]$/, '') : reason

  return text ? `${label}: ${text}` : label
}

/** The failures joined into one line, then the count of the rest when there is one. */
function summaryText(failures: DropFailure[], item: (name: string) => string, maxName: number, rest?: string): string {
  const items = failures.map((failure, index) =>
    failureText(failure, item, maxName, rest !== undefined || index < failures.length - 1)
  )

  return (rest === undefined ? items : [...items, rest]).join('; ')
}

/** One bounded warning for a drop's failures: shortened names, a few of them, and a count of the
 *  rest, so a large drop or long paths can't grow the toast off screen. Whenever anything is
 *  shortened or left out, the full list, each reason whole, rides in the collapsible detail.
 *  The caller supplies the words, in the UI language: `item` names one failure, `more` counts the
 *  rest. */
export function dropWarning(
  failures: DropFailure[],
  item: (name: string) => string,
  more: (count: number) => string
): { detail?: string; message: string } {
  const shown: DropFailure[] = []

  for (const failure of failures.slice(0, DROP_FAILURES_SHOWN)) {
    if (shown.length && summaryText([...shown, failure], item, DROP_FAILURE_NAME_CHARS).length > DROP_WARNING_CHARS) {
      break
    }

    shown.push(failure)
  }

  const hidden = failures.length - shown.length
  const message = summaryText(shown, item, DROP_FAILURE_NAME_CHARS, hidden > 0 ? more(hidden) : undefined)

  return message === summaryText(failures, item, Infinity)
    ? { message }
    : { detail: failures.map(failure => failureText(failure, item)).join('\n'), message }
}
