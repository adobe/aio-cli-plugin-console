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
const config = require('@adobe/aio-cli-config')
const Help = require('@oclif/plugin-help').default
const yaml = require('js-yaml')

const CONSOLE_CONFIG_KEY = '$console'

describe('ConsoleCommand', () => {
  beforeEach(() => {
    mockLogger.mockReset()
  })

  let command
  beforeEach(() => {
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

  describe('run', () => {
    test('exists', async () => {
      expect(command.run).toBeInstanceOf(Function)
    })

    test('returns help file for console command', () => {
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
          if (key === `${CONSOLE_CONFIG_KEY}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.project.name`) {
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
          if (key === `${CONSOLE_CONFIG_KEY}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.project.name`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.workspace.name`) {
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
          if (key === `${CONSOLE_CONFIG_KEY}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.project.name`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.workspace.name`) {
            return 'THE_WORKSPACE'
          }
          return null
        })
        command.printConsoleConfig({ alternativeFormat: 'json' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith(JSON.stringify({ org: 'THE_ORG', project: 'THE_PROJECT', workspace: 'THE_WORKSPACE' }))
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
          if (key === `${CONSOLE_CONFIG_KEY}.org.name`) {
            return 'THE_ORG'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.project.name`) {
            return 'THE_PROJECT'
          }
          if (key === `${CONSOLE_CONFIG_KEY}.workspace.name`) {
            return 'THE_WORKSPACE'
          }
          return null
        })
        command.printConsoleConfig({ alternativeFormat: 'yml' })
        expect(command.log).toHaveBeenCalledTimes(1)
        expect(command.log).toHaveBeenCalledWith(yaml.safeDump({ org: 'THE_ORG', project: 'THE_PROJECT', workspace: 'THE_WORKSPACE' }))
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
      expect(config.set).toBeCalledWith(`${CONSOLE_CONFIG_KEY}.test`, 'value')
    })

    test('getConfig', () => {
      const command = new ConsoleCommand([])
      command.getConfig('test')
      expect(config.get).toBeCalledWith(`${CONSOLE_CONFIG_KEY}.test`)
    })

    test('clearConfig', () => {
      const command = new ConsoleCommand([])
      command.clearConfig()
      expect(config.delete).toBeCalledWith(CONSOLE_CONFIG_KEY)
    })
  })
})
