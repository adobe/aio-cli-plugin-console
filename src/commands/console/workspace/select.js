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
const inquirer = require('inquirer')

class SelectCommand extends ConsoleCommand {
  async run () {
    await this.initSdk()
    try {
      aioConsoleLogger.debug('Trying to Select workspace')
      const { args } = this.parse(SelectCommand)

      const org = this.getConfig(ConsoleCommand.CONFIG_KEYS.ORG)
      if (!org) {
        this.error('No Organization selected')
      }

      const project = this.getConfig(ConsoleCommand.CONFIG_KEYS.PROJECT)
      if (!project) {
        this.error('No Project selected')
      }

      let workspace = null
      if (args.workspaceId) {
        cli.action.start(`Retrieving workspace with id: ${args.workspaceId}`)
        const result = await this.consoleClient.getWorkspace(org.id, project.id, args.workspaceId)
        workspace = result.body
      } else {
        cli.action.start('Retrieving workspaces')
        const workspaceList = await this.getConsoleOrgProjectWorkspaces(org.id, project.id)
        cli.action.stop()
        if (workspaceList.length > 1) {
          const result = await inquirer.prompt([{
            type: 'list',
            name: 'name',
            message: 'Pick a workspace',
            choices: workspaceList
          }])
          workspace = workspaceList.find(ws => ws.name === result.name)
        } else {
          workspace = workspaceList[0]
        }
      }

      aioConsoleLogger.debug('Found selected workspace')
      const obj = {
        id: workspace.id,
        name: workspace.name
      }

      this.setConfig(ConsoleCommand.CONFIG_KEYS.WORKSPACE, obj)
      aioConsoleLogger.debug('Selected workspace')
      this.log(`Workspace selected ${workspace.name}`)

      this.printConsoleConfig()
    } catch (e) {
      this.error(e.message)
    } finally {
      cli.action.stop()
    }
  }
}

SelectCommand.description = 'Select a Workspace for the selected Project'

SelectCommand.aliases = [
  'console:workspace:select',
  'console:workspace:sel',
  'console:ws:select',
  'console:ws:sel'
]

SelectCommand.args = [{
  name: 'workspaceId',
  required: false
}]

module.exports = SelectCommand
