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
const { getToken } = require('@adobe/aio-lib-ims')
const LibConsoleCLI = require('@adobe/generator-aio-console/lib/console-cli')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const Help = require('@oclif/plugin-help').default
const yaml = require('js-yaml')
const { CONFIG_KEYS, API_KEYS } = require('../../config')
const { getCliEnv } = require('@adobe/aio-lib-env')

class ConsoleCommand extends Command {
  async run () {
    const help = new Help(this.config)
    help.showHelp(['console', '--help'])
  }

  async initSdk () {
    this.cliEnv = getCliEnv()
    this.apiKey = API_KEYS[this.cliEnv]

    // await context.setCli({ 'cli.bare-output': true }, false) // set this globally
    aioConsoleLogger.debug('Retrieving Auth Token')
    this.accessToken = await getToken(CLI)
    this.consoleCLI = await LibConsoleCLI.init({ accessToken: this.accessToken, apiKey: this.apiKey, env: this.cliEnv })
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

  cleanOutput () {
    LibConsoleCLI.cleanStdOut()
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
