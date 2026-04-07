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

/**
 * Print a table to stdout, replicating the ux.table output format from @oclif/core v2.
 * Required because ux.table was removed in @oclif/core v4.
 *
 * @param {Array<object>} data Array of row objects
 * @param {object} columns Column definitions keyed by object property name.
 *   Each column may have: header (string), minWidth (number)
 * @param {object} [options] Options
 * @param {Function} [options.printLine] Function to print each line (defaults to process.stdout.write)
 */
function table (data, columns, options = {}) {
  const printLine = options.printLine || ((line) => process.stdout.write(line + '\n'))

  const cols = Object.entries(columns).map(([key, opts]) => {
    const header = opts.header || capitalize(key)
    const minContentWidth = opts.minWidth ? opts.minWidth - 1 : 0
    const maxDataWidth = data.reduce((max, row) => {
      const val = String(row[key] === undefined || row[key] === null ? '' : row[key])
      return Math.max(max, val.length)
    }, 0)
    const width = Math.max(header.length, maxDataWidth, minContentWidth)
    return { key, header, width }
  })

  // Header row
  printLine(cols.map(col => ' ' + col.header.padEnd(col.width)).join('') + ' ')

  // Separator row
  printLine(cols.map(col => ' ' + '\u2500'.repeat(col.width)).join('') + ' ')

  // Data rows
  for (const row of data) {
    printLine(cols.map(col => {
      const val = String(row[col.key] === undefined || row[col.key] === null ? '' : row[col.key])
      return ' ' + val.padEnd(col.width)
    }).join('') + ' ')
  }
}

/**
 * Capitalize the first letter of a string.
 *
 * @param {string} str input string
 * @returns {string} string with first letter uppercased
 */
function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = { table }
