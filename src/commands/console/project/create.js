/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console:project:create', { provider: 'debug' })
const { Flags } = require('@oclif/core')
const ConsoleCommand = require('../index')

class CreateCommand extends ConsoleCommand {
  async run () {
    const { flags } = await this.parse(CreateCommand)
    const orgId = flags.orgId || this.getConfig('org.id')
    if (!orgId) {
      this.log('You have not selected an Organization. Please select first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    if (!flags.name) {
      this.log('You have not provided a name for the project. Please provide a name.')
      this.exit(1)
    }

    const projectDetails = {
      name: flags.name,
      title: flags.title || flags.name,
      description: flags.description || flags.name
    }

    await this.initSdk()
    const project = await this.consoleCLI.createProject(orgId, projectDetails)
    this.log(`Project ${project.name} created successfully.`)
    return project
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
}

CreateCommand.description = 'Create a new App Builder Project for the selected Organization'

CreateCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'OrgID to create the project in'
  }),
  name: Flags.string({
    description: 'Name of the project',
    required: true
  }),
  title: Flags.string({
    description: 'Title of the project, defaults to the name'
  }),
  description: Flags.string({
    description: 'Description of the project, defaults to the name'
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

CreateCommand.aliases = [
  'console:project:create',
  'console:project:init'
]

module.exports = CreateCommand
