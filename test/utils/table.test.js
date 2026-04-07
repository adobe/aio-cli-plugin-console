/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { table } = require('../../src/utils/table')

describe('table', () => {
  test('renders a basic table with headers', () => {
    const lines = []
    const data = [{ id: '1', name: 'Alice' }]
    table(data, { id: { header: 'ID' }, name: { header: 'Name' } }, { printLine: l => lines.push(l) })
    expect(lines[0]).toBe(' ID Name  ')
    expect(lines[1]).toBe(' \u2500\u2500 \u2500\u2500\u2500\u2500\u2500 ')
    expect(lines[2]).toBe(' 1  Alice ')
  })

  test('derives header from key when header option is omitted', () => {
    const lines = []
    table([{ foo: 'bar' }], { foo: {} }, { printLine: l => lines.push(l) })
    expect(lines[0]).toBe(' Foo ')
  })

  test('respects minWidth option', () => {
    const lines = []
    table([{ x: 'a' }], { x: { minWidth: 10 } }, { printLine: l => lines.push(l) })
    // minWidth=10 means content width = max(header=1, data=1, minWidth-1=9) = 9
    expect(lines[1]).toBe(' ' + '\u2500'.repeat(9) + ' ')
  })

  test('handles null values in data', () => {
    const lines = []
    table([{ val: null }], { val: { header: 'Val' } }, { printLine: l => lines.push(l) })
    // null value should render as empty string, padded to header width
    expect(lines[2]).toBe('     ')
  })

  test('handles undefined values in data', () => {
    const lines = []
    table([{ val: undefined }], { val: { header: 'Val' } }, { printLine: l => lines.push(l) })
    // undefined value should render as empty string, padded to header width
    expect(lines[2]).toBe('     ')
  })

  test('uses process.stdout.write when no printLine option is provided', () => {
    const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {})
    table([{ x: '1' }], { x: { header: 'X' } })
    expect(writeSpy).toHaveBeenCalled()
    writeSpy.mockRestore()
  })
})
