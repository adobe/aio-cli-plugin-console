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

const { Command } = require('@oclif/core')
const projects = [
  {
    appId: null,
    date_created: '2020-04-29T10:14:17.000Z',
    date_last_modified: '2020-04-29T10:14:17.000Z',
    deleted: 0,
    description: 'Description 1',
    id: '1000000001',
    name: 'name1',
    org_id: 1001,
    title: 'Title 1',
    type: 'default'
  },
  {
    appId: null,
    date_created: '2020-04-29T10:14:17.000Z',
    date_last_modified: '2020-04-29T10:14:17.000Z',
    deleted: 0,
    description: 'Description 2',
    id: '1000000002',
    name: 'name2',
    org_id: 1002,
    title: 'Title 2',
    type: 'default'
  }
]
const selectedProject = projects[0]
const mockConsoleCLIInstance = {}
/** @private */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getProjects = jest.fn().mockResolvedValue(projects)
  mockConsoleCLIInstance.promptForSelectProject = jest.fn().mockResolvedValue(selectedProject)
}

jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const config = require('@adobe/aio-lib-core-config')

const SelectCommand = require('../../../../src/commands/console/project/select')

let command
beforeEach(() => {
  command = new SelectCommand([])
  setDefaultMockConsoleCLI()
  config.set.mockReset()
  config.delete.mockReset()
})

test('exports', async () => {
  expect(typeof SelectCommand).toEqual('function')
  expect(SelectCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(SelectCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(SelectCommand.aliases).toBeDefined()
  expect(SelectCommand.aliases).toBeInstanceOf(Array)
  expect(SelectCommand.aliases.length).toBeGreaterThan(0)
})

test('args', async () => {
  const projectId = SelectCommand.args[0]
  expect(projectId.name).toEqual('projectIdOrName')
  expect(projectId.required).toEqual(false)
  expect(projectId.description).toBeDefined()
})

test('flags', async () => {
  expect(SelectCommand.flags.help.type).toBe('boolean')
  expect(SelectCommand.flags.orgId.type).toBe('option')
})

test('exists', async () => {
  expect(command.run).toBeInstanceOf(Function)
})

test('should select a project with given projectId and orgId', async () => {
  // Project id
  command.argv = ['1001', '--orgId', '1']
  await expect(command.run()).resolves.not.toThrowError()
  expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1')
  expect(mockConsoleCLIInstance.promptForSelectProject).toHaveBeenCalledWith(projects, { projectId: '1001', projectName: '1001' }, { allowCreate: false })
  expect(config.set).toHaveBeenCalledWith('console.project', selectedProject)
  expect(config.delete).toHaveBeenCalledWith('console.workspace')
})

test('should select a project with given projectName and selected orgId', async () => {
  // org id from config
  config.get.mockReturnValue('1')
  // Project name
  command.argv = ['name']
  await expect(command.run()).resolves.not.toThrowError()
  expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1')
  expect(mockConsoleCLIInstance.promptForSelectProject).toHaveBeenCalledWith(projects, { projectId: 'name', projectName: 'name' }, { allowCreate: false })
  expect(config.set).toHaveBeenCalledWith('console.project', selectedProject)
  expect(config.delete).toHaveBeenCalledWith('console.workspace')
})

test('should prompt and select a project with orgId in config', async () => {
  // org id from config
  config.get.mockReturnValue('1')
  // Project not passed in
  command.argv = []
  await expect(command.run()).resolves.not.toThrowError()
  expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1')
  expect(mockConsoleCLIInstance.promptForSelectProject).toHaveBeenCalledWith(projects, { projectId: undefined, projectName: undefined }, { allowCreate: false })
  expect(config.set).toHaveBeenCalledWith('console.project', selectedProject)
  expect(config.delete).toHaveBeenCalledWith('console.workspace')
})

test('should fail if orgId is missing and not in config', async () => {
  // org id from config
  config.get.mockReturnValue(undefined)
  command.argv = ['name']
  await expect(command.run()).rejects.toThrow('EEXIT: 1')
})

test('error while retrieving Project', async () => {
  mockConsoleCLIInstance.getProjects.mockRejectedValue(new Error('Error retrieving Project'))
  command.argv = ['1001', '--orgId', '1']
  await expect(command.run()).rejects.toThrowError(new Error('Error retrieving Project'))
})
