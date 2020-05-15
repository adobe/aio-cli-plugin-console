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

const { Command } = require('@oclif/command')
const sdk = require('@adobe/aio-lib-console')
const fs = require('fs')
jest.mock('fs')
const DownloadCommand = require('../../../../src/commands/console/workspace/download')
const ConsoleCommand = require('../../../../src/commands/console')

test('exports', async () => {
  expect(typeof DownloadCommand).toEqual('function')
  expect(DownloadCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(DownloadCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(DownloadCommand.aliases).toBeDefined()
  expect(DownloadCommand.aliases).toBeInstanceOf(Array)
  expect(DownloadCommand.aliases.length).toBeGreaterThan(0)
})

describe('console:workspace:download', () => {
  let command
  beforeEach(() => {
    command = new DownloadCommand([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  describe('run', () => {
    const fakeDownloadData = { id: 1, name: 'WRKSPC1', enabled: 1 }
    const downloadWorkspaceJson = jest.fn()
    beforeEach(() => {
      downloadWorkspaceJson.mockReset()
      downloadWorkspaceJson.mockResolvedValue({ ok: true, body: fakeDownloadData })

      sdk.init.mockImplementation(() => ({ downloadWorkspaceJson }))
      fs.writeFileSync = jest.fn()
      command.getConfig = jest.fn()
    })

    afterEach(() => {
      command.getConfig.mockReset()
      jest.clearAllMocks()
    })

    test('should download the config for the selected workspace', async () => {
      command.getConfig.mockImplementation(key => {
        if (key === ConsoleCommand.CONFIG_KEYS.ORG) {
          return { name: 'THE_ORG', id: 123 }
        }
        if (key === ConsoleCommand.CONFIG_KEYS.PROJECT) {
          return { name: 'THE_PROJECT', id: 456 }
        }
        if (key === ConsoleCommand.CONFIG_KEYS.WORKSPACE) {
          return { name: 'THE_WORKSPACE', id: 789 }
        }
        return null
      })
      await command.run()
      expect(fs.writeFileSync).toHaveBeenCalledWith('123-THE_PROJECT-THE_WORKSPACE.json', JSON.stringify(fakeDownloadData, null, 2))
      expect(downloadWorkspaceJson).toHaveBeenCalledWith(123, 456, 789)
    })

    test('should fail if the workspace is missing', async () => {
      command.getConfig.mockImplementation(key => {
        if (key === ConsoleCommand.CONFIG_KEYS.ORG) {
          return { name: 'THE_ORG', id: 123 }
        }
        if (key === ConsoleCommand.CONFIG_KEYS.PROJECT) {
          return { name: 'THE_PROJECT', id: 456 }
        }
        return null
      })
      await expect(command.run()).rejects.toThrow('No Workspace selected')
      expect(downloadWorkspaceJson).not.toHaveBeenCalled()
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('should fail if the project is missing', async () => {
      command.getConfig.mockImplementation(key => {
        if (key === ConsoleCommand.CONFIG_KEYS.ORG) {
          return { name: 'THE_ORG', id: 123 }
        }
        return null
      })
      await expect(command.run()).rejects.toThrow('No Project selected')
      expect(downloadWorkspaceJson).not.toHaveBeenCalled()
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('should fail if the org is missing', async () => {
      command.getConfig.mockImplementation(key => {
        return null
      })
      await expect(command.run()).rejects.toThrow('No Organization selected')
      expect(downloadWorkspaceJson).not.toHaveBeenCalled()
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('should fail if download fails', async () => {
      downloadWorkspaceJson.mockRejectedValue(new Error('The Error'))
      command.getConfig.mockImplementation(key => {
        return { name: 'FAKE', id: 123 }
      })
      await expect(command.run()).rejects.toThrow('The Error')
      expect(downloadWorkspaceJson).toHaveBeenCalled()
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })
  })
})
