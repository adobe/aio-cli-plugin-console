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
const { Flags, ux } = require('@oclif/core')
const { CONFIG_KEYS } = require('../../../config')

const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:list', { provider: 'debug' })

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(ListCommand)

    const orgId = flags.orgId || this.getConfig(`${CONFIG_KEYS.ORG}.id`)
    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const projectId = flags.projectId || this.getConfig(`${CONFIG_KEYS.PROJECT}.id`)
    if (!projectId) {
      this.log('You have not selected a Project. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      const workspaces = await this.getConsoleProjectWorkspaces(orgId, projectId)

      if (flags.json) {
        this.printJson(workspaces)
      } else if (flags.yml) {
        this.printYaml(workspaces)
      } else {
        // print formatted result
        ux.table(workspaces, {
          id: {
            minWidth: 25
          },
          name: {
            minWidth: 25
          },
          enabled: {}
        }, {
          printLine: this.log.bind(this)
        })
      }
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }

  /**
   * Retrieve list of Workspaces from a Project
   *
   * @param {string} orgId organization id
   * @param {string} projectId project id
   * @returns {Promise<Array>} Workspaces
   */
  async getConsoleProjectWorkspaces (orgId, projectId) {
    const response = await this.consoleCLI.getWorkspaces(orgId, projectId)
    return response
  }
}

ListCommand.description = 'List your Workspaces for your selected Project'

ListCommand.aliases = [
  'console:workspace:ls',
  'console:ws:list',
  'console:ws:ls'
]

ListCommand.flags = {
  ...ConsoleCommand.flags,
  json: Flags.boolean({
    description: 'Output json',
    char: 'j',
    exclusive: ['yml']
  }),
  yml: Flags.boolean({
    description: 'Output yml',
    char: 'y',
    exclusive: ['json']
  }),
  orgId: Flags.string({
    description: 'Organization id of the Console Workspaces to list'
  }),
  projectId: Flags.string({
    description: 'Project id of the Console Workspaces to list'
  })
}

module.exports = ListCommand
