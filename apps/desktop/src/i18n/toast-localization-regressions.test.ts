import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const SOURCE_ROOT = path.resolve(process.cwd(), 'src')
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const TOAST_FIELDS = new Set(['detail', 'message', 'title'])

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return sourceFiles(file)
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name)) || /\.(?:spec|test)\.[jt]sx?$/.test(entry.name)) {
      return []
    }

    return [file]
  })
}

function calleeName(expression: ts.Expression): string | null {
  if (ts.isIdentifier(expression)) {
    return expression.text
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text
  }

  return null
}

function englishLiterals(node: ts.Node): ts.StringLiteralLike[] {
  const found: ts.StringLiteralLike[] = []

  const visit = (current: ts.Node) => {
    if (ts.isCallExpression(current)) {
      return
    }

    if (ts.isStringLiteralLike(current) && !ts.isBinaryExpression(current.parent) && /[A-Za-z]{2}/.test(current.text)) {
      found.push(current)
    }

    ts.forEachChild(current, visit)
  }

  visit(node)

  return found
}

function propertyName(property: ts.ObjectLiteralElementLike): string | null {
  if (!('name' in property) || !property.name) {
    return null
  }

  return ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : null
}

function toastFieldValues(object: ts.ObjectLiteralExpression): ts.Expression[] {
  const values: ts.Expression[] = []

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const name = propertyName(property)

    if (name && TOAST_FIELDS.has(name)) {
      values.push(property.initializer)
    }

    if (name === 'action' && ts.isObjectLiteralExpression(property.initializer)) {
      for (const actionProperty of property.initializer.properties) {
        if (ts.isPropertyAssignment(actionProperty) && propertyName(actionProperty) === 'label') {
          values.push(actionProperty.initializer)
        }
      }
    }
  }

  return values
}

describe('toast localization regressions', () => {
  it('does not add user-facing English literals directly to toast calls', () => {
    const violations: string[] = []

    for (const file of sourceFiles(SOURCE_ROOT)) {
      const source = fs.readFileSync(file, 'utf8')
      const kind = file.endsWith('x') ? ts.ScriptKind.TSX : file.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind)

      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const name = calleeName(node.expression)
          const values =
            name === 'notifyError'
              ? node.arguments.slice(1)
              : name === 'notify' && ts.isObjectLiteralExpression(node.arguments[0])
                ? toastFieldValues(node.arguments[0])
                : []

          for (const value of values) {
            for (const literal of englishLiterals(value)) {
              const position = tree.getLineAndCharacterOfPosition(literal.getStart(tree))

              violations.push(
                `${path.relative(SOURCE_ROOT, file)}:${position.line + 1}: ${JSON.stringify(literal.text)}`
              )
            }
          }
        }

        ts.forEachChild(node, visit)
      }

      visit(tree)
    }

    expect(violations).toEqual([])
  })
})
