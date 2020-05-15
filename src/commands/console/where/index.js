/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const aioLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:where', { provider: 'debug' })
const { flags } = require('@oclif/command')

const ConsoleCommand = require('../index')
class WhereCommand extends ConsoleCommand {
  async run () {
    const { flags } = this.parse(WhereCommand)

    aioLogger.debug('Where command: inquiring currently selected Org, Project and Workspace')

    const printOptions = {}
    if (flags.json) {
      printOptions.alternativeFormat = 'json'
    }
    if (flags.yml) {
      printOptions.alternativeFormat = 'yml'
    }
    this.printConsoleConfig(printOptions)
  }
}

WhereCommand.description = 'Show the currently selected Organization, Project and Workspace'

WhereCommand.flags = {
  ...ConsoleCommand.flags,
  json: flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  })
}

WhereCommand.aliases = [
  'where'
]

module.exports = WhereCommand
