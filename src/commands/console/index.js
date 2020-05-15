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
const config = require('@adobe/aio-cli-config')
const { Command, flags } = require('@oclif/command')
const { getToken, context } = require('@adobe/aio-lib-ims')
const sdk = require('@adobe/aio-lib-console')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const Help = require('@oclif/plugin-help').default
const yaml = require('js-yaml')

const DEFAULT_ENV = 'prod'
const API_KEYS = {
  prod: 'aio-cli-console-auth',
  stage: 'aio-cli-console-auth-stage'
}

const ORG_TYPE_ENTERPRISE = 'entp'
const CONSOLE_CONFIG_KEY = '$console'

class ConsoleCommand extends Command {
  async run () {
    const help = new Help(this.config)
    help.showHelp(['console', '--help'])
  }

  async initSdk () {
    const currConfig = await context.getCli()
    this.imsEnv = (currConfig && currConfig.env) || DEFAULT_ENV
    this.apiKey = API_KEYS[this.imsEnv]

    await context.setCli({ '$cli.bare-output': true }, false) // set this globally
    aioConsoleLogger.debug('Retrieving Auth Token')
    this.accessToken = await getToken(CLI)
    this.consoleClient = await sdk.init(this.accessToken, this.apiKey, this.imsEnv)
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
    config.org = this.getConfig('org.name') || '<no org selected>'
    config.project = this.getConfig('project.name') || '<no project selected>'
    config.workspace = this.getConfig('workspace.name') || '<no workspace selected>'

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
    this.log(`1. Org: ${config.org}`)
    this.log(`2. Project: ${config.project}`)
    this.log(`3. Workspace: ${config.workspace}`)
  }

  /**
   * Retrieve Orgs / Org from console
   *
   * @param {string} [orgId] Org Id
   * @returns {Promise<Array<{id, code, name}>>} Array of Orgs
   */
  async getConsoleOrgs (orgId = null) {
    const response = await this.consoleClient.getOrganizations()

    if (!response.ok) {
      throw new Error('Error retrieving Orgs')
    }

    const orgs = response.body
      // Filter enterprise orgs
      .filter(org => org.type === ORG_TYPE_ENTERPRISE)
      // Filter org if orgId is specified
      .filter(org => orgId ? (org.id === orgId) : true)
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
    const response = await this.consoleClient.getProjectsForOrg(orgId)
    if (!response.ok) {
      throw new Error('Error retrieving Projects')
    }
    return response.body
  }

  /**
   * Retrieve project
   *
   * @param {string} orgId Ims Org ID
   * @param {string} projectId Project Id to select project
   * @returns {object} Project
   */
  async getConsoleOrgProject (orgId, projectId) {
    const response = await this.consoleClient.getProject(orgId, projectId)
    if (!response.ok) {
      throw new Error('Error retrieving Project')
    }
    return response.body
  }

  /**
   * Set $console config
   *
   * @param {string} key key to store value
   * @param {string|object} value value to store
   */
  setConfig (key, value) {
    config.set(`${CONSOLE_CONFIG_KEY}.${key}`, value)
  }

  /**
   * Get $console config
   *
   * @param {string} key key to retrieve value
   * @returns {*} config data
   */
  getConfig (key) {
    return config.get(`${CONSOLE_CONFIG_KEY}.${key}`)
  }

  /**
   * Clear $console config
   */
  clearConfig () {
    config.delete(CONSOLE_CONFIG_KEY)
  }
}

// this is set in package.json, see https://github.com/oclif/oclif/issues/120
// if not set it will get the first (alphabetical) topic's help description
ConsoleCommand.description = 'Console plugin for the Adobe I/O Console'

// common flags
ConsoleCommand.flags = {
  help: flags.boolean({ description: 'Show help' })
}

module.exports = ConsoleCommand
