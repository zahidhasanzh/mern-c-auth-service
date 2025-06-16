import { DataSource, Repository } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { UserService } from '../../src/services/userService'
import { UserData } from '../../src/types'

describe('UserService create() error handling', () => {
    let dataSource: DataSource
    let userRepository: Repository<User>
    let userService: UserService

    beforeAll(async () => {
        dataSource = await AppDataSource.initialize()
        userRepository = dataSource.getRepository(User)
        userService = new UserService(userRepository)
    })

    beforeEach(async () => {
        await dataSource.synchronize(true)
    })

    afterAll(async () => {
        await dataSource.destroy()
    })

    it('should throw error if save to database fails', async () => {
        const data: UserData = {
            firstName: 'Fail',
            lastName: 'Test',
            email: 'fail@example.com',
            password: 'password',
            role: 'customer',
            tenantId: 1,
        }
        jest.spyOn(userRepository, 'save').mockRejectedValueOnce(
            new Error('DB failure'),
        )
        await expect(userService.create(data)).rejects.toThrow(
            'Failed to store the data in the database',
        )
    })
})
