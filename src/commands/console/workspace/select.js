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
const ConsoleCommand = require('../index')
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:workspace:select', { provider: 'debug' })
const { cli } = require('cli-ux')
const { CONFIG_KEYS } = require('../../../config')

class SelectCommand extends ConsoleCommand {
  async run () {
    aioConsoleLogger.debug('Trying to Select workspace')
    const { args } = this.parse(SelectCommand)

    const org = this.getConfig(CONFIG_KEYS.ORG)
    if (!org) {
      this.log('You have not selected any Organization and Project. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const project = this.getConfig(CONFIG_KEYS.PROJECT)
    if (!project) {
      this.log('You have not selected a Project. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      cli.action.start(`Retrieving the Workspace with id: ${args.workspaceId}`)
      const workspace = await this.getConsoleProjectWorkspace(org.id, project.id, args.workspaceId)
      cli.action.stop()

      aioConsoleLogger.debug('Found selected workspace')
      const obj = {
        id: workspace.id,
        name: workspace.name
      }

      this.setConfig(CONFIG_KEYS.WORKSPACE, obj)
      aioConsoleLogger.debug('Selected workspace')
      this.log(`Workspace selected ${workspace.name}`)

      this.printConsoleConfig()
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      cli.action.stop()
    }
  }
}

SelectCommand.description = 'Select a Workspace for the selected Project'

SelectCommand.aliases = [
  'console:workspace:sel',
  'console:ws:select',
  'console:ws:sel'
]

SelectCommand.args = [
  { name: 'workspaceId', required: true }
]

module.exports = SelectCommand
