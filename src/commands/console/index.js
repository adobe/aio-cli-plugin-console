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
const { Command, Flags, Help } = require('@oclif/core')
const { getToken, context } = require('@adobe/aio-lib-ims')
const LibConsoleCLI = require('@adobe/aio-cli-lib-console')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const { getCliEnv } = require('@adobe/aio-lib-env')
const yaml = require('js-yaml')
const hyperlinker = require('hyperlinker')
const { CONFIG_KEYS, API_KEYS } = require('../../config')

const DEV_TERMS_URL = 'https://www.adobe.com/go/developer-terms'

class ConsoleCommand extends Command {
  async run () {
    const help = new Help(this.config)
    await help.showHelp(['console', '--help'])
  }

  async initSdk () {
    this.cliEnv = getCliEnv()
    this.apiKey = API_KEYS[this.cliEnv]

    await context.setCli({ 'cli.bare-output': true }, false) // set this globally
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
    this.log(JSON.stringify(data, null, 2))
  }

  /**
   * Output YAML data
   *
   * @param {object} data YAML data to print
   */
  printYaml (data) {
    // clean undefined values
    data = JSON.parse(JSON.stringify(data))
    this.log(yaml.dump(data, { noCompatMode: true }))
  }

  /**
   * print current selected console config
   *
   * @param {object} [options] printOptions
   * @param {string} [options.alternativeFormat] can be set to: 'json', 'yml'
   */
  printConsoleConfig (options = {}) {
    const state = {}
    state.org = this.getConfig('org.name')
    state.project = this.getConfig('project.title')
    state.workspace = this.getConfig('workspace.name')

    // handling json output
    if (options.alternativeFormat === 'json') {
      this.printJson(state)
      return
    }

    if (options.alternativeFormat === 'yml') {
      this.printYaml(state)
      return
    }

    this.log('You are currently in:')
    this.log(`1. Org: ${state.org || '<no org selected>'}`)
    this.log(`2. Project: ${state.project || '<no project selected>'}`)
    this.log(`3. Workspace: ${state.workspace || '<no workspace selected>'}`)
  }

  cleanOutput () {
    LibConsoleCLI.cleanStdOut()
  }

  /**
   * Ensure the Developer Terms of Service have been accepted for the given org.
   * Mirrors the flow in @adobe/aio-cli-plugin-app's `app init` command so that
   * `console` subcommands surface a CLI-native prompt instead of leaking a raw
   * 451 "use POST /console/services/ims/organizations/:orgId/terms" message
   * from the underlying SDK.
   *
   * @param {object} consoleCLI initialised @adobe/aio-cli-lib-console instance (this.consoleCLI)
   * @param {string} orgId organization id to check
   * @param {boolean} [skipPrompts] when true, fail fast instead of prompting (default false)
   * @returns {Promise<void>}
   */
  async ensureDevTermAccepted (consoleCLI, orgId, skipPrompts = false) {
    const isTermAccepted = await consoleCLI.checkDevTermsForOrg(orgId)
    if (isTermAccepted) {
      return
    }
    if (skipPrompts) {
      this.error('Developer Terms of Service have not been accepted for this organization. Please re-run this command without `--json`/`--yml`, or run `aio app init` to accept the terms first.')
    }
    const terms = await consoleCLI.getDevTermsForOrg()
    const termsText = terms.text ? terms.text.trimEnd() : ''
    const confirmDevTerms = await consoleCLI.prompt.promptConfirm(`${termsText}\n\nYou have not accepted the Developer Terms of Service. Go to ${hyperlinker(DEV_TERMS_URL, DEV_TERMS_URL)} to view the terms. Do you accept the terms? (y/n):`)
    if (!confirmDevTerms) {
      this.error('The Developer Terms of Service were declined')
    }
    const accepted = await consoleCLI.acceptDevTermsForOrg(orgId)
    if (!accepted) {
      this.error('The Developer Terms of Service could not be accepted')
    }
    this.log(`The Developer Terms of Service were successfully accepted for org ${orgId}`)
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
    if (key) {
      return config.get(`${CONFIG_KEYS.CONSOLE}.${key}`)
    } else {
      return config.get(CONFIG_KEYS.CONSOLE)
    }
  }

  /**
   * Clear console config
   *
   * @param {string} key key to store value
   */
  clearConfig (key) {
    if (key) {
      config.delete(`${CONFIG_KEYS.CONSOLE}.${key}`)
    } else {
      config.delete(CONFIG_KEYS.CONSOLE)
    }
  }
}

// this is set in package.json, see https://github.com/oclif/oclif/issues/120
// if not set it will get the first (alphabetical) topic's help description
ConsoleCommand.description = 'Console plugin for the Adobe I/O CLI'

// common flags
ConsoleCommand.flags = {
  help: Flags.boolean({ description: 'Show help' })
}

module.exports = ConsoleCommand
