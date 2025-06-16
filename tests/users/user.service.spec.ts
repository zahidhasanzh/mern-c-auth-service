import { DataSource, Repository } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { UserService } from '../../src/services/userService'
import { UserData } from '../../src/types'

describe('UserService', () => {
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

    describe('create', () => {
        it('should create a user with hashed password', async () => {
            const user = await userService.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: '123456',
                role: 'customer',
            })

            expect(user).toHaveProperty('id')
            expect(user.password).not.toBe('123456')
        })

        it('should throw error if email already exists', async () => {
            const data: UserData = {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: 'password',
                role: 'customer',
                tenantId: 1,
            }
            await userService.create(data)
            await expect(userService.create(data)).rejects.toThrow(
                'Email is already exists!',
            )
        })

        it('should throw internal error if DB save fails', async () => {
            jest.spyOn(userRepository, 'save').mockRejectedValueOnce(
                new Error('DB error'),
            )

            await expect(
                userService.create({
                    firstName: 'Fail',
                    lastName: 'Save',
                    email: 'fail@example.com',
                    password: 'pass',
                    role: 'customer',
                }),
            ).rejects.toThrow('Failed to store the data in the database')
        })
    })
})
