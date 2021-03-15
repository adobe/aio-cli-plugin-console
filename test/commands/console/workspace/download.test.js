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
const fs = require('fs')
const { stdout } = require('stdout-stderr')
const { Command } = require('@oclif/command')
const path = require('path')

// mock data
const configOrgId = '012'
const configProjectId = '123'
const configWorkspaceId = '333'
const configProjectName = 'THE_PROJECT'
const configWorkspaceName = 'THE_WORKSPACE'
const fakeConfig = { someField: '1' }

// console mocks
const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getWorkspaceConfig = jest.fn()
  mockConsoleCLIInstance.getWorkspaceConfig.mockResolvedValue(fakeConfig)
}
jest.mock('@adobe/generator-aio-console/lib/console-cli', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

// fs mocks
const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync')
const mockStatSync = jest.spyOn(fs, 'statSync')
/** @private */
function setDefaultMockFs () {
  mockWriteFileSync.mockReset()
  mockStatSync.mockReset()
  mockWriteFileSync.mockImplementation(() => {})
  mockStatSync.mockReturnValue({ isFile: () => true, isDirectory: () => false })
}
// mock config
const config = require('@adobe/aio-lib-core-config')
/** @private */
function setDefaultMockConfigGet () {
  config.get.mockReset()
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.project.id') {
      return configProjectId
    }
    if (key === 'console.workspace.id') {
      return configWorkspaceId
    }
    if (key === 'console.project.name') {
      return configProjectName
    }
    if (key === 'console.workspace.name') {
      return configWorkspaceName
    }
  })
}
const DownloadCommand = require('../../../../src/commands/console/workspace/download')

let command
beforeEach(() => {
  setDefaultMockConsoleCLI()
  setDefaultMockConfigGet()
  setDefaultMockFs()
  config.set.mockReset()
  command = new DownloadCommand([])
})

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

test('args', async () => {
  const destination = DownloadCommand.args[0]
  expect(destination.name).toEqual('destination')
  expect(destination.required).toEqual(false)
  expect(destination.description).toBeDefined()
})

test('exists', async () => {
  expect(command.run).toBeInstanceOf(Function)
})

test('should download the config for the selected workspace', async () => {
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith(`${configOrgId}-${configProjectName}-${configWorkspaceName}.json`, JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config to a specified file - file exists', async () => {
  fs.statSync.mockReturnValue({ isFile: () => true, isDirectory: () => false })
  command.argv = ['other/file.json']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('other/file.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config to a specified file - file does not exist', async () => {
  fs.statSync.mockImplementation(() => { throw new Error('file does not exist') })
  command.argv = ['other/file.json']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('other/file.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config to a specified folder', async () => {
  fs.statSync.mockReturnValue({ isFile: () => false, isDirectory: () => true })
  command.argv = ['other/subdir/']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.normalize(`other/subdir/${configOrgId}-${configProjectName}-${configWorkspaceName}.json`),
    JSON.stringify(fakeConfig, null, 2)
  )
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config to the default file if destination is not a valid file or folder', async () => {
  fs.statSync.mockReturnValue({ isFile: () => false, isDirectory: () => false })
  command.argv = ['other/subdir/']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    path.normalize(`${configOrgId}-${configProjectName}-${configWorkspaceName}.json`),
    JSON.stringify(fakeConfig, null, 2)
  )
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config for the selected workspace, with --orgId flag', async () => {
  command.argv = ['--orgId', '555']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith('555', configProjectId, configWorkspaceId)
})

test('should download the config for the selected workspace, with --projectId flag', async () => {
  command.argv = ['--projectId', '555']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, '555', configWorkspaceId)
})

test('should download the config for the selected workspace, with --workspaceId flag', async () => {
  command.argv = ['--workspaceId', '555']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, '555')
})

test('should download the config for the selected workspace, with --workspace/project/orgId flag', async () => {
  command.argv = ['--orgId', '22', '--projectId', '111', '--workspaceId', '555']
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith('22', '111', '555')
})

test('should download the config for the selected workspace, config workspaceName is missing', async () => {
  command.argv = []
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.project.id') {
      return configProjectId
    }
    if (key === 'console.workspace.id') {
      return configWorkspaceId
    }
    if (key === 'console.project.name') {
      return configProjectName
    }
  })
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should download the config for the selected workspace, config projectName is missing', async () => {
  command.argv = []
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.project.id') {
      return configProjectId
    }
    if (key === 'console.workspace.id') {
      return configWorkspaceId
    }
    if (key === 'console.workspace.name') {
      return configWorkspaceName
    }
  })
  await command.run()
  expect(fs.writeFileSync).toHaveBeenCalledWith('console.json', JSON.stringify(fakeConfig, null, 2))
  expect(mockConsoleCLIInstance.getWorkspaceConfig).toHaveBeenCalledWith(configOrgId, configProjectId, configWorkspaceId)
})

test('should fail if the workspace config is missing', async () => {
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.project.id') {
      return configProjectId
    }
    if (key === 'console.project.name') {
      return configProjectName
    }
    if (key === 'console.org.name') {
      return 'THE_ORG'
    }
  })
  await expect(command.run()).rejects.toThrowError()
  expect(stdout.output).toMatchFixture('workspace/download-error3.txt')
  expect(fs.writeFileSync).not.toHaveBeenCalled()
})

test('should fail if the project config is missing', async () => {
  config.get.mockImplementation(key => {
    if (key === 'console.org.id') {
      return configOrgId
    }
    if (key === 'console.org.name') {
      return 'THE_ORG'
    }
  })
  await expect(command.run()).rejects.toThrowError()
  expect(stdout.output).toMatchFixture('workspace/download-error2.txt')
  expect(fs.writeFileSync).not.toHaveBeenCalled()
})

test('should fail if the org config is missing', async () => {
  config.get.mockImplementation(key => {
    return undefined
  })
  await expect(command.run()).rejects.toThrowError()
  expect(stdout.output).toMatchFixture('workspace/download-error1.txt')
  expect(fs.writeFileSync).not.toHaveBeenCalled()
})

test('should fail if download fails', async () => {
  mockConsoleCLIInstance.getWorkspaceConfig.mockImplementation(() => { throw new Error('The Error') })
  await expect(command.run()).rejects.toThrow('The Error')
  expect(fs.writeFileSync).not.toHaveBeenCalled()
})
