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

const ORG_KEY = 'org'
const PROJECT_KEY = 'project'
const WORKSPACE_KEY = 'workspace'

class SelectCommand extends ConsoleCommand {
  async run () {
    await this.initSdk()
    try {
      aioConsoleLogger.debug('Trying to Select workspace')
      const { args } = this.parse(SelectCommand)

      const org = this.getConfig(ORG_KEY)
      if (!org) {
        throw new Error('No Organization selected')
      }

      const project = this.getConfig(PROJECT_KEY)
      if (!project) {
        throw new Error('No Project selected')
      }

      cli.action.start(`Retrieving the Workspace with id: ${args.workspaceId}`)
      const result = await this.consoleClient.getWorkspace(org.id, project.id, args.workspaceId)
      const workspace = result.body
      aioConsoleLogger.debug('Found selected workspace')
      const obj = {
        id: workspace.id,
        name: workspace.name
      }

      this.setConfig(WORKSPACE_KEY, obj)
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
  'workspace:select',
  'workspace:sel'
]

SelectCommand.args = [
  { name: 'workspaceId', required: true }
]

module.exports = SelectCommand
