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
      this.log('You have not selected an Organization. Please select one first.')
      this.printConsoleConfig()
      this.exit(1)
    }

    const projectDetails = {
      name: flags.name,
      title: flags.title || flags.name,
      description: flags.description || flags.name
    }

    // first validate name, before calling server to check if it is already in use
    // Project name allows only alphanumeric values
    if (!/^[a-zA-Z0-9]+$/.test(projectDetails.name)) {
      this.error(`Project name ${projectDetails.name} is invalid. It should only contain alphanumeric values.`)
    }
    // Project name must be between 3 and 45 characters long.
    if (projectDetails.name.length < 3 || projectDetails.name.length > 45) {
      this.error('Project name must be between 3 and 45 characters long.')
    }

    // Project title allows only alphanumeric values and spaces
    if (!/^[a-zA-Z0-9\s]+$/.test(projectDetails.title)) {
      this.error(`Project title ${projectDetails.title} is invalid. It should only contain alphanumeric characters and spaces.`)
    }
    // Project title must be between 3 and 45 characters long.
    if (projectDetails.title.length < 3 || projectDetails.title.length > 45) {
      this.error('Project title must be between 3 and 45 characters long.')
    }
    // Description cannot be over 1000 characters.
    if (projectDetails.description.length > 1000) {
      this.error('Project description cannot be over 1000 characters.')
    }

    await this.initSdk()
    try {
      // check name is not already in use
      const projects = await this.consoleCLI.getProjects(orgId)
      if (projects.find(project => project.name === projectDetails.name)) {
        this.error(`Project ${projectDetails.name} already exists. Please choose a different name.`)
      }
      aioConsoleLogger.info(`Project ${projectDetails.name} is valid not already in use.`)
      // if we get here, all validation passed, so call server to create project
      const project = await this.consoleCLI.createProject(orgId, projectDetails)
      // Output handling: honor --json/--yml flags for structured output
      if (flags.json) {
        this.printJson(project)
      } else if (flags.yml) {
        this.printYaml(project)
      } else {
        this.log(`Project ${project.name} created successfully.`)
      }
      return project
    } catch (err) {
      aioConsoleLogger.debug(err)
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

CreateCommand.description = 'Create a new App Builder Project for the selected Organization'

CreateCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'OrgID to create the project in',
    char: 'o'
  }),
  name: Flags.string({
    description: 'Name of the project',
    required: true,
    char: 'n'
  }),
  title: Flags.string({
    description: 'Title of the project, defaults to the name',
    char: 't'
  }),
  description: Flags.string({
    description: 'Description of the project, defaults to the name',
    char: 'd'
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
