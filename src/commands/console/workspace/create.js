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

    const workspaceDetails = {
      name: flags.name,
      title: flags.title || flags.name
    }

    // Workspace name allows only alphanumeric values
    if (!/^[a-zA-Z0-9]+$/.test(workspaceDetails.name)) {
      this.error(`Workspace name ${workspaceDetails.name} is invalid. It should only contain alphanumeric values.`)
    }
    if (workspaceDetails.name.length < 3 || workspaceDetails.name.length > 45) {
      this.error('Workspace name must be between 3 and 45 characters long.')
    }

    // Workspace title should only contain alphanumeric characters and spaces
    if (!/^[a-zA-Z0-9 ]+$/.test(workspaceDetails.title)) {
      this.error(`Workspace title ${workspaceDetails.title} is invalid. It should only contain alphanumeric characters and spaces.`)
    }
    if (workspaceDetails.title.length < 3 || workspaceDetails.title.length > 45) {
      this.error('Workspace title must be between 3 and 45 characters long.')
    }

    await this.initSdk()

    try {
      // resolve project by name or title to project id
      const projects = await this.consoleCLI.getProjects(orgId)
      const project = projects.find(p => p.name === flags.projectName || p.title === flags.projectName)
      if (!project) {
        this.error(`Project ${flags.projectName} not found in the Organization.`)
      }
      const projectId = project.id

      const workspaces = await this.consoleCLI.getWorkspaces(orgId, projectId)
      if (workspaces.find(ws => ws.name === workspaceDetails.name)) {
        this.error(`Workspace ${workspaceDetails.name} already exists. Please choose a different name.`)
      }

      const workspace = await this.consoleCLI.createWorkspace(orgId, projectId, workspaceDetails)
      if (flags.json) {
        this.printJson(workspace)
      } else if (flags.yml) {
        this.printYaml(workspace)
      } else {
        this.log(`Workspace ${workspace.name} created successfully.`)
      }
      return workspace
    } catch (err) {
      this.error(err.message)
    } finally {
      this.cleanOutput()
    }
  }
}

CreateCommand.description = 'Create a new Workspace in the specified Project'

CreateCommand.flags = {
  ...ConsoleCommand.flags,
  orgId: Flags.string({
    description: 'OrgID of the organization that contains the project to create the workspace in'
  }),
  projectName: Flags.string({
    description: 'Name or title of the project to create the workspace in',
    required: true
  }),
  name: Flags.string({
    description: 'Name of the workspace',
    required: true
  }),
  title: Flags.string({
    description: 'Title of the workspace, defaults to the name'
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
  'console:workspace:create',
  'console:workspace:init',
  'console:ws:create',
  'console:ws:init'
]

module.exports = CreateCommand
