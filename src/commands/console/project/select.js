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
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:project:select', { provider: 'debug' })
const { Flags, Args } = require('@oclif/core')
const { CONFIG_KEYS } = require('../../../config')
const ConsoleCommand = require('../index')

class SelectCommand extends ConsoleCommand {
  async run () {
    const { args, flags } = await this.parse(SelectCommand)

    const orgId = flags.orgId || this.getConfig(`${CONFIG_KEYS.ORG}.id`)

    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    await this.initSdk()

    try {
      const project = await this.selectProjectInteractive(orgId, args.projectIdOrName)

      this.setConfig(CONFIG_KEYS.PROJECT, project)
      this.clearConfig(CONFIG_KEYS.WORKSPACE)

      this.log(`Project selected : ${project.title}`)

      this.printConsoleConfig()
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }

  async selectProjectInteractive (orgId, preSelectedProjectIdOrName) {
    const projects = await this.consoleCLI.getProjects(orgId)
    const project = await this.consoleCLI.promptForSelectProject(
      projects,
      { projectId: preSelectedProjectIdOrName, projectName: preSelectedProjectIdOrName },
      { allowCreate: false }
    )
    return project
  }
}

SelectCommand.description = 'Select a Project for the selected Organization'

SelectCommand.args = {
  projectIdOrName: Args.string({
    required: false,
    description: 'Adobe Developer Console Project id or Project name'
  })
}

SelectCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'Organization id of the Console Project to select'
  })
}

SelectCommand.aliases = [
  'console:project:sel'
]

module.exports = SelectCommand
