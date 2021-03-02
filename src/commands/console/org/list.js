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
const { ORG_TYPE_ENTERPRISE } = require('../../../config')

const ConsoleCommand = require('../index')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = this.parse(ListCommand)

    await this.initSdk()

    try {
      const orgs = await this.getConsoleOrgs()

      if (flags.json) {
        this.printJson(orgs)
      } else if (flags.yml) {
        this.printYaml(orgs)
      } else {
        this.printResults(orgs)
      }
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }

  /**
   * Retrieve Orgs from console
   *
   * @returns {Promise<Array<{id, code, name}>>} Array of Orgs
   */
  async getConsoleOrgs () {
    const response = await this.consoleCLI.getOrganizations()
    const orgs = response
      // Filter enterprise orgs
      .filter(org => org.type === ORG_TYPE_ENTERPRISE)
      // Omit props
      .map(({ id, code, name }) => ({ id, code, name }))

    return orgs
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
  'console:org:ls'
]

module.exports = ListCommand
