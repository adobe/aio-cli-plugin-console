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

const { stdout } = require('stdout-stderr')

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

const mockConsoleCLIInstance = {
  getProjects: jest.fn().mockResolvedValue([]),
  createProject: jest.fn().mockResolvedValue(mockProject)
}

jest.mock('@adobe/aio-cli-lib-console', () => ({
  init: jest.fn().mockResolvedValue(mockConsoleCLIInstance),
  cleanStdOut: jest.fn()
}))

const TheCommand = require('../../../../src/commands/console/project/create')

describe('console:project:create', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
    jest.clearAllMocks()
    mockConsoleCLIInstance.createProject.mockReset()
    mockConsoleCLIInstance.createProject = jest.fn().mockResolvedValue(mockProject)
    mockConsoleCLIInstance.getProjects.mockReset()
    mockConsoleCLIInstance.getProjects = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    command = null
  })

  it('should create a project', async () => {
    mockConsoleCLIInstance.createProject.mockResolvedValue(mockProject)
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.createProject).toHaveBeenCalledWith('1234567890', {
      name: 'testproject',
      title: 'Test Project',
      description: 'Test Project Description'
    })
    expect(result).toEqual(mockProject)
  })

  it('should not create a project if the name is not provided', async () => {
    command.argv = ['--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Missing required flag name')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should not create a project if the orgId is not provided', async () => {
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description']
    command.getConfig = jest.fn().mockReturnValue(null)
    await expect(command.run()).rejects.toThrow()
    expect(stdout.output).toMatchFixture('project/list-no-org.txt')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should use config.org.id if no orgId is provided', async () => {
    mockConsoleCLIInstance.createProject.mockResolvedValue(mockProject)
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description']
    command.getConfig = jest.fn().mockReturnValue('0987654321')
    const result = await command.run()
    expect(mockConsoleCLIInstance.createProject).toHaveBeenCalledWith('0987654321', {
      name: 'testproject',
      title: 'Test Project',
      description: 'Test Project Description'
    })
    expect(result).toEqual(mockProject)
  })

  it('should not create a project if the name is already in use', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([mockProject])
    mockConsoleCLIInstance.createProject.mockResolvedValue(mockProject)
    command.argv = ['--name', 'name1', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project name1 already exists. Please choose a different name.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should use name as title if no title is provided', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([])
    mockConsoleCLIInstance.createProject.mockResolvedValue(mockProject)
    command.argv = ['--name', 'testproject', '--description', 'Test Project Description', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.createProject).toHaveBeenCalledWith('1234567890', {
      name: 'testproject',
      title: 'testproject',
      description: 'Test Project Description'
    })
    expect(result).toEqual(mockProject)
  })

  it('should use name as description if no description is provided', async () => {
    mockConsoleCLIInstance.getProjects.mockResolvedValue([])
    mockConsoleCLIInstance.createProject.mockResolvedValue(mockProject)
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--orgId', '1234567890']
    const result = await command.run()
    expect(mockConsoleCLIInstance.createProject).toHaveBeenCalledWith('1234567890', {
      name: 'testproject',
      title: 'Test Project',
      description: 'testproject'
    })
    expect(result).toEqual(mockProject)
  })

  it('should not create a project if the name is invalid', async () => {
    command.argv = ['--name', 'test-project!', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project name test-project! is invalid. It should only contain alphanumeric values.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should not create a project if the title is invalid', async () => {
    command.argv = ['--name', 'testproject', '--title', 'Test Project!', '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project title Test Project! is invalid. It should only contain alphanumeric characters and spaces.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should not create a project if the description is too long', async () => {
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description'.repeat(1000), '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project description cannot be over 1000 characters.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should not create a project if the name is too long, or too short', async () => {
    command.argv = ['--name', 'testproject'.repeat(50), '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project name must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()

    command.argv = ['--name', '1', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project name must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('should not create a project if the title is too long or too short', async () => {
    command.argv = ['--name', 'testName', '--title', 'Test Project'.repeat(50), '--description', 'Test Project Description', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project title must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()

    command.argv = ['--name', 'testName', '--title', 'HI', '--orgId', '1234567890']
    await expect(command.run()).rejects.toThrow('Project title must be between 3 and 45 characters long.')
    expect(mockConsoleCLIInstance.createProject).not.toHaveBeenCalled()
  })

  it('respects --json flag', async () => {
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890', '--json']
    const result = await command.run()
    expect(result).toEqual(mockProject)
    expect(stdout.output).toMatchFixture('project/create-json.txt')
  })

  it('respects --yml flag', async () => {
    command.argv = ['--name', 'testproject', '--title', 'Test Project', '--description', 'Test Project Description', '--orgId', '1234567890', '--yml']
    const result = await command.run()
    expect(result).toEqual(mockProject)
    expect(stdout.output).toMatchFixture('project/create-yml.txt')
  })
})
