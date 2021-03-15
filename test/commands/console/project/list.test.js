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
const { stdout } = require('stdout-stderr')

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
const mockConsoleCLIInstance = {}
/**
 *
 */
function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getProjects = jest.fn().mockResolvedValue(projects)
}
jest.mock('@adobe/generator-aio-console/lib/console-cli', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const config = require('@adobe/aio-lib-core-config')

const ListCommand = require('../../../../src/commands/console/project/list')

let command
beforeEach(() => {
  command = new ListCommand([])
  setDefaultMockConsoleCLI()
  config.get.mockReset()
})

test('exports', async () => {
  expect(typeof ListCommand).toEqual('function')
  expect(ListCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(ListCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(ListCommand.aliases).toBeDefined()
  expect(ListCommand.aliases).toBeInstanceOf(Array)
  expect(ListCommand.aliases.length).toBeGreaterThan(0)
})

test('flags', async () => {
  expect(ListCommand.flags.help.type).toBe('boolean')
  expect(ListCommand.flags.json.char).toBe('j')
  expect(ListCommand.flags.json.exclusive).toEqual(['yml'])
  expect(ListCommand.flags.yml.type).toBe('boolean')
  expect(ListCommand.flags.yml.char).toBe('y')
  expect(ListCommand.flags.yml.exclusive).toEqual(['json'])
  expect(ListCommand.flags.orgId.type).toBe('option')
})

describe('console:project:list', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should throw error if org not set', async () => {
    await expect(command.run()).rejects.toThrowError()
    expect(stdout.output).toMatchFixture('project/list-no-org.txt')
  })

  test('should return list of projects with selected orgId', async () => {
    config.get.mockReturnValue('someorgid')
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('project/list.txt')
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('someorgid')
  })

  test('should return list of projects with orgid as cli arg', async () => {
    command.argv = ['--orgId', '1001']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('project/list.txt')
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1001')
  })

  test('should return list of projects json', async () => {
    command.argv = ['--orgId', '1001', '--json']
    await expect(command.run()).resolves.not.toThrowError()
    expect(JSON.parse(stdout.output)).toMatchFixtureJson('project/list.json')
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1001')
  })

  test('should return list of projects yaml', async () => {
    command.argv = ['--orgId', '1001', '--yml']
    await expect(command.run()).resolves.not.toThrowError()
    expect(stdout.output).toMatchFixture('project/list.yml')
    expect(mockConsoleCLIInstance.getProjects).toHaveBeenCalledWith('1001')
  })

  test('error returning list of projects', async () => {
    mockConsoleCLIInstance.getProjects.mockRejectedValue(new Error('Error retrieving Projects'))
    command.argv = ['--orgId', '1001']
    await expect(command.run()).rejects.toThrowError('Error retrieving Projects')
  })
})
