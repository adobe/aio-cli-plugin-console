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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:project:list', { provider: 'debug' })
const { Flags, ux } = require('@oclif/core')
const ConsoleCommand = require('../index')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(ListCommand)
    const orgId = flags.orgId || this.getConfig('org.id')
    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      const projects = await this.getConsoleOrgProjects(orgId)

      if (flags.json) {
        this.printJson(projects)
      } else if (flags.yml) {
        this.printYaml(projects)
      } else {
        this.printResults(projects)
      }
      return projects
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }

  /**
   * Retrieve projects from an Org
   *
   * @param {string} orgId organization id
   * @returns {Promise<Array>} Projects
   */
  async getConsoleOrgProjects (orgId) {
    const response = await this.consoleCLI.getProjects(orgId)
    return response
  }

  printResults (projects) {
    const columns = {
      id: {
        header: 'ID'
      },
      name: {
        header: 'Name'
      },
      title: {
        header: 'Title'
      }
    }
    ux.table(projects, columns)
  }
}

ListCommand.description = 'List your Projects for the selected Organization'

ListCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'OrgID for listing projects'
  }),
  json: Flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: Flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  })
}

ListCommand.aliases = [
  'console:project:ls'
]

module.exports = ListCommand
