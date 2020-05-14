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

const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:org:list', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { cli } = require('cli-ux')

const ConsoleCommand = require('../index')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = this.parse(ListCommand)

    await this.initSdk()

    try {
      aioConsoleLogger.debug('Listing Console Orgs')

      cli.action.start('Retrieving Organizations')

      const orgs = await this.getConsoleOrgs()

      aioConsoleLogger.debug('Listing Console Orgs: Data received')

      if (flags.json) {
        this.printJson(orgs)
      } else if (flags.yml) {
        this.printYaml(orgs)
      } else {
        this.printResults(orgs)
      }

      return orgs
    } catch (err) {
      aioConsoleLogger.error(err)
      this.error('failed to list Orgs')
    } finally {
      cli.action.stop()
    }
  }

  /**
   * Print Org list
   *
   * @param {Array<{id, code, name}>} orgs list of orgs
   */
  printResults (orgs) {
    const columns = {
      id: {
        header: 'Org ID'
      },
      code: {
        header: 'Code'
      },
      name: {
        header: 'Org Name'
      }
    }
    cli.table(orgs, columns)
  }
}

ListCommand.description = 'List your Organizations'

ListCommand.flags = {
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

ListCommand.aliases = [
  'org:list'
]

module.exports = ListCommand
