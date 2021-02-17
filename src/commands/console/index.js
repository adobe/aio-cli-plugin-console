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

const aioConsoleLogger = require('@adobe/aio-lib-core-logging')('@adobe/aio-cli-plugin-console', { provider: 'debug' })
const config = require('@adobe/aio-lib-core-config')
const { Command, flags } = require('@oclif/command')
const { getToken, context } = require('@adobe/aio-lib-ims')
const LibConsoleCLI = require('@adobe/generator-aio-console/lib/console-cli')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const Help = require('@oclif/plugin-help').default
const yaml = require('js-yaml')
const { CONFIG_KEYS, DEFAULT_ENV, API_KEYS, ORG_TYPE_ENTERPRISE } = require('../../config')

class ConsoleCommand extends Command {
  async run () {
    const help = new Help(this.config)
    help.showHelp(['console', '--help'])
  }

  async initSdk () {
    const currConfig = await context.getCli()
    this.imsEnv = (currConfig && currConfig.env) || DEFAULT_ENV
    this.apiKey = API_KEYS[this.imsEnv]

    await context.setCli({ 'cli.bare-output': true }, false) // set this globally
    aioConsoleLogger.debug('Retrieving Auth Token')
    this.accessToken = await getToken(CLI)
    this.consoleCLI = await LibConsoleCLI.init({ accessToken: this.accessToken, apiKey: this.apiKey, env: this.imsEnv })
  }

  /**
   * Output JSON data
   *
   * @param {object} data JSON data to print
   */
  printJson (data) {
    this.log(JSON.stringify(data))
  }

  /**
   * Output YAML data
   *
   * @param {object} data YAML data to print
   */
  printYaml (data) {
    // clean undefined values
    data = JSON.parse(JSON.stringify(data))
    this.log(yaml.safeDump(data, { noCompatMode: true }))
  }

  /**
   * print current selected console config
   *
   * @param {object} [options] printOptions
   * @param {string} [options.alternativeFormat] can be set to: 'json', 'yml'
   */
  printConsoleConfig (options = {}) {
    const config = {}
    config.org = this.getConfig('org.name')
    config.project = this.getConfig('project.name')
    config.workspace = this.getConfig('workspace.name')

    // handling json output
    if (options.alternativeFormat === 'json') {
      this.printJson(config)
      return
    }

    if (options.alternativeFormat === 'yml') {
      this.printYaml(config)
      return
    }

    this.log('You are currently in:')
    this.log(`1. Org: ${config.org || '<no org selected>'}`)
    this.log(`2. Project: ${config.project || '<no project selected>'}`)
    this.log(`3. Workspace: ${config.workspace || '<no workspace selected>'}`)
  }

  /**
   * Retrieve Orgs / Org from console
   *
   * @param {string} [orgCode] the Org Code
   * @returns {Promise<Array<{id, code, name}>>} Array of Orgs
   */
  async getConsoleOrgs (orgCode = null) {
    const response = await this.consoleCLI.getOrganizations()
    const orgs = response
      // Filter enterprise orgs
      .filter(org => org.type === ORG_TYPE_ENTERPRISE)
      // Filter org if orgId is specified
      .filter(org => orgCode ? (org.code === orgCode) : true)
      // Omit props
      .map(({ id, code, name }) => ({ id, code, name }))

    return orgs
  }

  /**
   * Retrieve projects from an Org
   *
   * @param {string} orgId organization id
   * @returns {Array} Projects
   */
  async getConsoleOrgProjects (orgId) {
    const response = await this.consoleCLI.getProjects(orgId)
    return response
  }

  /**
   * Retrieve project
   *
   * @param {string} orgId Ims Org ID
   * @param {string} projectId Project Id to select project
   * @returns {object} Project
   */
  async getConsoleOrgProject (orgId, projectId) {
    const response = await this.consoleCLI.sdkClient.getProject(orgId, projectId)
    if (!response.ok) {
      throw new Error('Error retrieving Project')
    }
    return response.body
  }

  /**
   * Retrieve Workspace from a Project
   *
   * @param {string} orgId organization id
   * @param {string} projectId project id
   * @returns {Array} Workspaces
   */
  async getConsoleProjectWorkspaces (orgId, projectId) {
    const response = await this.consoleCLI.getWorkspaces(orgId, projectId)
    return response
  }

  /**
   * Retrieve Workspace
   *
   * @param {string} orgId Ims Org ID
   * @param {string} projectId Project Id
   * @param {string} workspaceId Workspace Id to select workspace
   * @returns {object} Workspace
   */
  async getConsoleProjectWorkspace (orgId, projectId, workspaceId) {
    const response = await this.consoleCLI.sdkClient.getWorkspace(orgId, projectId, workspaceId)
    if (!response.ok) {
      throw new Error('Error retrieving Workspace')
    }
    return response.body
  }

  // todo that should be part of console-cli `selectProjectInteractive({ preSelected, allowCreate })`, return project.isNew ?
  // what about returning projects ?
  // todo note here we want to support preSelectedProjectIdOrName
  async selectProjectInteractive (orgId, preSelectedProjectId) {
    const projects = await this.consoleCLI.getProjects(orgId)
    let project = await this.consoleCLI.promptForSelectProject(
      projects,
      { projectId: preSelectedProjectId },
      { allowCreate: false }
    )
    if (!project) {
      // user has escaped project selection prompt, let's create a new one
      const projectDetails = await this.consoleCLI.promptForCreateProjectDetails()
      project = await this.consoleCLI.createProject(orgId, projectDetails)
    }
    return project
  }

  // todo should also be part of lib
  async selectWorkspaceInteractive (orgId, projectId, preSelectedWorkspaceId) {
    const workspaces = await this.consoleCLI.getWorkspaces(orgId, projectId)
    let workspace = await this.consoleCLI.promptForSelectWorkspace(
      workspaces,
      { workspaceId: preSelectedWorkspaceId },
      { allowCreate: false }
    )
    return workspace
  }

  // todo should also be part of lib
  // todo support orgid or orgCode
  async selectOrgInteractive (preSelectedOrgId) {
    const orgs = await  this.consoleCLI.getOrganizations()

    const org = await this.consoleCLI.promptForSelectOrganization(
      orgs,
      { orgId: preSelectedOrgId }
    )
    // Omit props
    return { id: org.id, code: org.code, name: org.name }
  }

  /**
   * Set console config
   *
   * @param {string} key key to store value
   * @param {string|object} value value to store
   */
  setConfig (key, value) {
    config.set(`${CONFIG_KEYS.CONSOLE}.${key}`, value)
  }

  /**
   * Get console config
   *
   * @param {string} key key to retrieve value
   * @returns {*} config data
   */
  getConfig (key) {
    return config.get(`${CONFIG_KEYS.CONSOLE}.${key}`)
  }

  /**
   * Clear console config
   *
   * @param {string} key key to clear
   */
  clearConfigKey (key) {
    config.delete(`${CONFIG_KEYS.CONSOLE}.${key}`)
  }

  /**
   * Clear console config
   */
  clearConfig () {
    config.delete(CONFIG_KEYS.CONSOLE)
  }
}

// this is set in package.json, see https://github.com/oclif/oclif/issues/120
// if not set it will get the first (alphabetical) topic's help description
ConsoleCommand.description = 'Console plugin for the Adobe I/O CLI'

// common flags
ConsoleCommand.flags = {
  help: flags.boolean({ description: 'Show help' })
}

module.exports = ConsoleCommand
