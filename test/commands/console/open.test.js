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

const TestCommand = require('../../../src/commands/console/open')
const config = require('@adobe/aio-lib-core-config')
const { STAGE_ENV } = require('@adobe/aio-lib-env')

const mockOpen = jest.fn()
jest.unstable_mockModule('open', () => ({
  default: mockOpen
}))
const { Command } = require('@oclif/core')

let command
let ORIGINAL_AIO_CLI_ENV
beforeAll(() => {
  ORIGINAL_AIO_CLI_ENV = process.env.AIO_CLI_ENV
})
beforeEach(() => {
  config.get.mockReset()
  mockOpen.mockReset()
  command = new TestCommand([])
})
afterEach(() => {
  process.env.AIO_CLI_ENV = ORIGINAL_AIO_CLI_ENV
})

test('exports', async () => {
  expect(typeof TestCommand).toEqual('function')
  expect(TestCommand.prototype instanceof Command).toBeTruthy()
})

test('description', async () => {
  expect(TestCommand.description).toBeDefined()
})

test('aliases', async () => {
  expect(TestCommand.aliases).toBeDefined()
  expect(TestCommand.aliases).toBeInstanceOf(Array)
  expect(TestCommand.aliases.length).toBeGreaterThan(0)
})

test('flags', async () => {
  expect(TestCommand.flags.help.type).toBe('boolean')
})

describe('console:open', () => {
  test('exists', async () => {
    expect(command.run).toBeInstanceOf(Function)
  })

  test('should open a browser', async () => {
    await expect(command.run()).resolves.not.toThrow()
    expect(mockOpen).toHaveBeenCalledWith('https://developer.adobe.com/console/projects')
  })

  test('should open a browser (stage_env)', async () => {
    process.env.AIO_CLI_ENV = STAGE_ENV
    await expect(command.run()).resolves.not.toThrow()
    expect(mockOpen).toHaveBeenCalledWith('https://developer-stage.adobe.com/console/projects')
  })

  test('should open a browser with default view if no project/workspace selected', async () => {
    config.get.mockReturnValue(null)
    await expect(command.run()).resolves.not.toThrow()
    expect(mockOpen).toHaveBeenLastCalledWith('https://developer.adobe.com/console/projects')
  })

  test('should open a browser with project overview', async () => {
    config.get.mockReturnValue({
      project: {
        name: 'ghActionDeploy',
        id: '4566206088344853970',
        title: 'Deploy with Github actions',
        description: 'see title ...',
        org_id: '53444'
      }
    })
    await expect(command.run()).resolves.not.toThrow()
    expect(mockOpen).toHaveBeenLastCalledWith('https://developer.adobe.com/console/projects/53444/4566206088344853970/overview')
  })

  test('should open a browser with project workspace', async () => {
    config.get.mockReturnValue({
      project: {
        name: 'ghActionDeploy',
        id: '4566206088344853970',
        title: 'Deploy with Github actions',
        description: 'see title ...',
        org_id: '53444'
      },
      workspace: { id: '4566206088344859372', name: 'Stage' }
    })
    await expect(command.run()).resolves.not.toThrow()
    expect(mockOpen).toHaveBeenLastCalledWith('https://developer.adobe.com/console/projects/53444/4566206088344853970/workspaces/4566206088344859372/details')
  })
})
