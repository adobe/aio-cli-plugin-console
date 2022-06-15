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

const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:publickey:list', { provider: 'debug' })
const { flags } = require('@oclif/command')
const { CONFIG_KEYS } = require('../../../config')

const ConsoleCommand = require('../index')
const IndexCommand = require('./index')

class ListCommand extends ConsoleCommand {
  async run () {
    const { flags } = this.parse(ListCommand)

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

    const workspaceId = flags.workspaceId || this.getConfig(`${CONFIG_KEYS.WORKSPACE}.id`)
    if (!workspaceId) {
      this.log('You have not selected a Workspace. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }
    await this.initSdk()

    try {
      const consoleConfig = await this.consoleCLI.getWorkspaceConfig(orgId, projectId, workspaceId)

      const project = consoleConfig.project
      const workspace = project.workspace

      const bindings = await this.consoleCLI.getBindingsForWorkspace(orgId, project, workspace)

      if (flags.json) {
        this.printJson(bindings)
      } else if (flags.yml) {
        this.printYaml(bindings)
      } else {
        IndexCommand.printBindings(bindings)
      }
      return bindings
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

ListCommand.description = 'List the public key certificates bound to the selected Workspace'

ListCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: flags.string({
    description: 'Organization id of the Console Workspace to list the public key certificates for'
  }),
  projectId: flags.string({
    description: 'Project id of the Console Workspace to list the public key certificate for'
  }),
  workspaceId: flags.string({
    description: 'Workspace id of the Console Workspace to list the public key certificate for'
  }),
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

ListCommand.aliases = []

module.exports = ListCommand
