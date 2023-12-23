/*
Copyright 2022 Adobe Inc. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Help, ux } = require('@oclif/core')
const ConsoleCommand = require('../')

class IndexCommand extends ConsoleCommand {
  async run () {
    const help = new Help(this.config)
    await help.showHelp(['console:publickey', '--help'])
  }
}

/**
 * Pretty-print a table of public key certificate bindings.
 *
 * @param {{ bindingId: string,
 *           orgId: string,
 *           technicalAccountId: string,
 *           certificateFingerprint: string,
 *           notAfter: number }[]} bindings array of bindings results
 */
IndexCommand.printBindings = function (bindings) {
  const columns = {
    bindingId: {
      header: 'ID'
    },
    certificateFingerprint: {
      header: 'Fingerprint'
    },
    expiresString: {
      header: 'Expires'
    }
  }
  const decorateds = []
  bindings.forEach(binding => {
    const decorated = {}
    Object.assign(decorated, binding)
    decorated.expiresString = binding.notAfter ? this.formatExpiry(binding.notAfter) : ''
    decorateds.push(decorated)
  })
  ux.table(decorateds, columns)
}

/**
 * Format the notAfter field for readability into YYYY-MM-DD. Make result a
 * little early by subtracting 1 day before truncating the time fields to
 * provide a small grace period to users with time zone differences or time blindness.
 *
 * @param {number} notAfter GMT epoch in nanoseconds
 * @returns {string} readable date
 */
IndexCommand.formatExpiry = function (notAfter) {
  const realDate = new Date(notAfter - (24 * 60 * 60 * 1000))
  return realDate.toISOString().substring(0, 10)
}

IndexCommand.description = 'Manage Public Key Bindings for your Adobe I/O Console Workspaces'

IndexCommand.aliases = []

module.exports = IndexCommand
