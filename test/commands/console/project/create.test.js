/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command } = require('@oclif/core')
const { stdout } = require('stdout-stderr')

const TheCommand = require('../../../../src/commands/console/project/create')

const mockProject = {
    appId: null,
    date_created: '2020-04-29T10:14:17.000Z',
    date_last_modified: '2020-04-29T10:14:17.000Z',
    deleted: 0,
    description: 'Description 1',
    id: '1000000001',
    name: 'name1',
    org_id: 1234567890,
    title: 'Title 1',
    type: 'default'
}

const mockConsoleCLIInstance = {}

function setDefaultMockConsoleCLI () {
  mockConsoleCLIInstance.getProjects = jest.fn().mockResolvedValue(mockProject)
}
jest.mock('@adobe/aio-cli-lib-console', () => ({
    init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
    cleanStdOut: jest.fn()
  }))

describe('console:project:create', () => {
  let command

  beforeEach(() => {
    jest.resetModules()
    command = new TheCommand()
    setDefaultMockConsoleCLI()
  })

  afterEach(() => {
    command = null
  })

  it('should create a project', async () => {
    command.argv = ['--name', 'test-project', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    const result = await command.run()
    expect(result).toContain('Project test-project created successfully.')  // TODO: Add more specific test for the result
  })
})