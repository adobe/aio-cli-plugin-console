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
const { Flags, Args } = require('@oclif/core')
const { CONFIG_KEYS } = require('../../../config')
const ConsoleCommand = require('../index')

class DeleteCommand extends ConsoleCommand {
  async run () {
    const { args, flags } = await this.parse(DeleteCommand)

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

      const found = bindings.find((value) => value.bindingId === args.idOrFingerprint || value.certificateFingerprint === args.idOrFingerprint)
      if (found) {
        const deleted = await this.consoleCLI.deleteBindingFromWorkspace(orgId, project, workspace, found)
        if (deleted) {
          this.log(`Deleted binding ${found.bindingId} from workspace ${workspace.name}`)
        } else {
          this.error(`Failed to delete binding ${found.bindingId} from workspace ${workspace.name}`)
        }
      } else {
        this.error(`No binding found with bindingId or fingerprint ${args.idOrFingerprint}`)
      }
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

DeleteCommand.description = 'Delete a public key certificate from the selected Workspace'

DeleteCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'Organization id of the Console Workspace to delete the public key certificate from'
  }),
  projectId: Flags.string({
    description: 'Project id of the Console Workspace to delete the public key certificate from'
  }),
  workspaceId: Flags.string({
    description: 'Workspace id of the Console Workspace to delete the public key certificate from'
  })
}

DeleteCommand.args = {
  idOrFingerprint: Args.string({
    description: 'The bindingId or the fingerprint of the public key binding to delete',
    required: true
  })
}

DeleteCommand.aliases = []

module.exports = DeleteCommand
