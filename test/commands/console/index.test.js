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

const ConsoleCommand = require('../../../src/commands/console/index')
const mockLogger = require('@adobe/aio-lib-core-logging')
const config = require('@adobe/aio-lib-core-config')
const { Help } = require('@oclif/core')
const yaml = require('js-yaml')
const { CONFIG_KEYS, API_KEYS } = require('../../../src/config')
const { PROD_ENV, STAGE_ENV, DEFAULT_ENV } = require('@adobe/aio-lib-env')

jest.mock('@adobe/aio-lib-ims')

describe('ConsoleCommand', () => {
  let command
  let ORIGINAL_AIO_CLI_ENV

  beforeAll(() => {
    ORIGINAL_AIO_CLI_ENV = process.env.AIO_CLI_ENV
  })
  afterAll(() => {
    process.env.AIO_CLI_ENV = ORIGINAL_AIO_CLI_ENV
  })

  beforeEach(() => {
    delete process.env.AIO_CLI_ENV
    mockLogger.mockReset()
    jest.clearAllMocks()
    command = new ConsoleCommand([])
    command.log = jest.fn()
  })

  test('exports', () => {
    expect(typeof ConsoleCommand).toEqual('function')
  })

  test('description', () => {
    expect(ConsoleCommand.description).toBeDefined()
  })

  test('flags', async () => {
    expect(ConsoleCommand.flags.help.type).toBe('boolean')
  })

  describe('initSDK', () => {
    test('exists', async () => {
      expect(command.initSdk).toBeInstanceOf(Function)
    })

    test('env STAGE_ENV', async () => {
      process.env.AIO_CLI_ENV = STAGE_ENV

      await command.initSdk()
      expect(command.cliEnv).toEqual(STAGE_ENV)
      expect(command.apiKey).toEqual(API_KEYS[STAGE_ENV])
      expect(command.consoleCLI.sdkClient.env).toEqual(STAGE_ENV)
    })
    test('env PROD_ENV', async () => {
      process.env.AIO_CLI_ENV = PROD_ENV

      await command.initSdk()
      expect(command.cliEnv).toEqual(PROD_ENV)
      expect(command.apiKey).toEqual(API_KEYS[PROD_ENV])
      expect(command.consoleCLI.sdkClient.env).toEqual(PROD_ENV)
    })
    test('env unknown', async () => {
      process.env.AIO_CLI_ENV = 'unknown-env'

      await command.initSdk()
      expect(command.cliEnv).toEqual(DEFAULT_ENV)
      expect(command.apiKey).toEqual(API_KEYS[DEFAULT_ENV])
      expect(command.consoleCLI.sdkClient.env).toEqual(DEFAULT_ENV)
    })
    test('env not set', async () => {
      delete process.env.AIO_CLI_ENV

      await command.initSdk()
      expect(command.cliEnv).toEqual(DEFAULT_ENV)
      expect(command.apiKey).toEqual(API_KEYS[DEFAULT_ENV])
      expect(command.consoleCLI.sdkClient.env).toEqual(DEFAULT_ENV)
    })
  })

  describe('run', () => {
    test('exists', async () => {
      expect(command.run).toBeInstanceOf(Function)
    })

    test('returns help file for console command', () => {
      command.config = {}
      const spy = jest.spyOn(Help.prototype, 'showHelp').mockReturnValue(true)
      return command.run().then(() => {
        expect(spy).toHaveBeenCalledWith(['console', '--help'])
      })
    })
  })

  describe('helper methods', () => {
    describe('printConsoleConfig', () => {
      test('no selected org', () => {
        config.get.mockImplementation((key) => null)
        command.printConsoleConfig()
        expect(command.log).toHaveBeenCalledTimes(4)
        expect(command.log).toHaveBeenCalledWith('You are currently in:')
        expect(command.log).toHaveBeenCalledWith('1. Org: <no org selected>')
        expect(command.log).toHaveBeenCalledWith('2. Project: <no project selected>')
        expect(command.log).toHaveBeenCalledWith('3. Workspace: <no workspace selected>')
      })
      test('only selected org and project', () => {
        config.get.mockImplementation(key => {
          if (key === `${CONFIG_KEYS.CONSOLE}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.project.title`) {
            return 'THE_PROJECT'
          }
          return null
        })
        command.printConsoleConfig()
        expect(command.log).toHaveBeenCalledTimes(4)
        expect(command.log).toHaveBeenCalledWith('You are currently in:')
        expect(command.log).toHaveBeenCalledWith('1. Org: THE_ORG')
        expect(command.log).toHaveBeenCalledWith('2. Project: THE_PROJECT')
        expect(command.log).toHaveBeenCalledWith('3. Workspace: <no workspace selected>')
      })
      test('selected org, project and workspace', () => {
        config.get.mockImplementation(key => {
          if (key === `${CONFIG_KEYS.CONSOLE}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.project.title`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.workspace.name`) {
            return 'THE_WORKSPACE'
          }
          return null
        })
        command.printConsoleConfig()
        expect(command.log).toHaveBeenCalledTimes(4)
        expect(command.log).toHaveBeenCalledWith('You are currently in:')
        expect(command.log).toHaveBeenCalledWith('1. Org: THE_ORG')
        expect(command.log).toHaveBeenCalledWith('2. Project: THE_PROJECT')
        expect(command.log).toHaveBeenCalledWith('3. Workspace: THE_WORKSPACE')
      })
      test('selected org, project and workspace in json format', () => {
        config.get.mockImplementation(key => {
          if (key === `${CONFIG_KEYS.CONSOLE}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.project.title`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.workspace.name`) {
            return 'THE_WORKSPACE'
          }
          return null
        })
        command.printConsoleConfig({ alternativeFormat: 'json' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith(JSON.stringify({ org: 'THE_ORG', project: 'THE_PROJECT', workspace: 'THE_WORKSPACE' }, null, 2))
      })
      test('no selected in json format', () => {
        config.get.mockImplementation(key => {
          return undefined
        })
        command.printConsoleConfig({ alternativeFormat: 'json' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith('{}')
      })
      test('selected org, project and workspace in yml format', () => {
        config.get.mockImplementation(key => {
          if (key === `${CONFIG_KEYS.CONSOLE}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.project.title`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONFIG_KEYS.CONSOLE}.workspace.name`) {
            return 'THE_WORKSPACE'
          }
          return null
        })
        command.printConsoleConfig({ alternativeFormat: 'yml' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith(yaml.dump({ org: 'THE_ORG', project: 'THE_PROJECT', workspace: 'THE_WORKSPACE' }))
      })
      test('no selected in yml format', () => {
        config.get.mockImplementation(key => {
          return undefined
        })
        command.printConsoleConfig({ alternativeFormat: 'yml' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith('{}\n')
      })
    })

    test('setConfig', () => {
      const command = new ConsoleCommand([])
      command.setConfig('test', 'value')
      expect(config.set).toHaveBeenCalledWith(`${CONFIG_KEYS.CONSOLE}.test`, 'value')
    })

    test('getConfig', () => {
      const command = new ConsoleCommand([])
      command.getConfig('test')
      expect(config.get).toHaveBeenCalledWith(`${CONFIG_KEYS.CONSOLE}.test`)
    })

    test('getConfig - nokey', () => {
      const command = new ConsoleCommand([])
      command.getConfig()
      expect(config.get).toHaveBeenCalledWith(`${CONFIG_KEYS.CONSOLE}`)
    })

    test('clearConfig', () => {
      const command = new ConsoleCommand([])
      command.clearConfig()
      expect(config.delete).toHaveBeenCalledWith(CONFIG_KEYS.CONSOLE)
    })

    test('getOrgFeatures', async () => {
      command.cliEnv = STAGE_ENV
      command.apiKey = API_KEYS[STAGE_ENV]
      command.accessToken = 'token'
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([{ name: 'RUNTIME' }])
      })

      await expect(command.getOrgFeatures('304327')).resolves.toEqual([{ name: 'RUNTIME' }])
      expect(global.fetch).toHaveBeenCalledWith('https://developer-stage.adobe.com/console/api/organizations/304327/features', {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer token',
          'x-api-key': API_KEYS[STAGE_ENV]
        }
      })
    })

    test('getOrgFeatures returns empty list for non-ok response', async () => {
      command.cliEnv = PROD_ENV
      command.apiKey = API_KEYS[PROD_ENV]
      command.accessToken = 'token'
      global.fetch = jest.fn().mockResolvedValue({ ok: false })

      await expect(command.getOrgFeatures('304327')).resolves.toEqual([])
    })

    test('getOrgFeatures falls back to prod url for unknown env', async () => {
      command.cliEnv = 'unknown-env'
      command.apiKey = API_KEYS[PROD_ENV]
      command.accessToken = 'token'
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      })

      await expect(command.getOrgFeatures('304327')).resolves.toEqual([])
      expect(global.fetch).toHaveBeenCalledWith('https://developer.adobe.com/console/api/organizations/304327/features', expect.any(Object))
    })

    test('hasRuntimeFeature', async () => {
      command.getOrgFeatures = jest.fn().mockResolvedValue([{ name: 'RUNTIME' }])
      await expect(command.hasRuntimeFeature('304327')).resolves.toBe(true)

      command.getOrgFeatures = jest.fn().mockResolvedValue([{ name: 'OTHER' }])
      await expect(command.hasRuntimeFeature('304327')).resolves.toBe(false)
    })

    test('hasRuntimeFeature returns false when feature lookup fails', async () => {
      command.getOrgFeatures = jest.fn().mockRejectedValue(new Error('bad feature lookup'))
      await expect(command.hasRuntimeFeature('304327')).resolves.toBe(false)
    })

    test('getSelectableOrgs includes enterprise orgs and developer orgs with Runtime', async () => {
      command.hasRuntimeFeature = jest.fn(orgId => Promise.resolve(orgId === 'developer-runtime'))
      const orgs = [
        { id: 'enterprise', type: 'entp' },
        { id: 'developer-runtime', type: 'developer' },
        { id: 'developer-no-runtime', type: 'developer' },
        { id: 'other', type: 'other' }
      ]

      await expect(command.getSelectableOrgs(orgs)).resolves.toEqual([
        { id: 'enterprise', type: 'entp' },
        { id: 'developer-runtime', type: 'developer' }
      ])
    })
  })
})
