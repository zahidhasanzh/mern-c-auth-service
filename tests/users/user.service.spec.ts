import { DataSource, Repository } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { UserService } from '../../src/services/userService'
import { UserData, UserQueryParams } from '../../src/types'
import { Roles } from '../../src/constants'

describe('UserService create() & getAll() test coverage', () => {
    let dataSource: DataSource
    let userRepository: Repository<User>
    let userService: UserService
    jest.setTimeout(30000)

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

    it('should return all users with pagination', async () => {
        await userRepository.save([
            {
                firstName: 'Alice',
                lastName: 'Wonder',
                email: 'alice@example.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            },
            {
                firstName: 'Bob',
                lastName: 'Builder',
                email: 'bob@example.com',
                password: 'secret',
                role: Roles.ADMIN,
            },
        ])

        const query: UserQueryParams = {
            q: '',
            role: '',
            currentPage: 1,
            perPage: 10,
        }

        const [users, count] = await userService.getAll(query)
        expect(users.length).toBe(2)
        expect(count).toBe(2)
    })

    it('should filter users by search query', async () => {
        await userRepository.save([
            {
                firstName: 'Alice',
                lastName: 'Wonder',
                email: 'alice@example.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            },
            {
                firstName: 'Bob',
                lastName: 'Builder',
                email: 'bob@example.com',
                password: 'secret',
                role: Roles.ADMIN,
            },
        ])

        const query: UserQueryParams = {
            q: 'Bob',
            role: '',
            currentPage: 1,
            perPage: 10,
        }

        const [users, count] = await userService.getAll(query)
        expect(count).toBe(1)
        expect(users[0].firstName).toBe('Bob')
    })

    it('should filter users by role', async () => {
        await userRepository.save([
            {
                firstName: 'Charlie',
                lastName: 'Tester',
                email: 'charlie@example.com',
                password: 'secret',
                role: Roles.ADMIN,
            },
            {
                firstName: 'Dana',
                lastName: 'User',
                email: 'dana@example.com',
                password: 'secret',
                role: Roles.CUSTOMER,
            },
        ])

        const query: UserQueryParams = {
            q: '',
            role: Roles.ADMIN,
            currentPage: 1,
            perPage: 10,
        }

        const [users, count] = await userService.getAll(query)
        expect(count).toBe(1)
        expect(users[0].role).toBe(Roles.ADMIN)
    })

    it('should paginate users', async () => {
        for (let i = 1; i <= 15; i++) {
            await userRepository.save({
                firstName: `User${i}`,
                lastName: 'Paginate',
                email: `user${i}@example.com`,
                password: 'secret',
                role: Roles.CUSTOMER,
            })
        }

        const query: UserQueryParams = {
            q: '',
            role: '',
            currentPage: 2,
            perPage: 6,
        }

        const [users, count] = await userService.getAll(query)

        expect(users.length).toBe(6)
        expect(count).toBe(15)
    })

    it('should delete user by id', async () => {
        const userId = 123

        // mock delete method to resolve with DeleteResult or similar
        const deleteResult = { affected: 1 } // typeORM delete returns this kind of object
        jest.spyOn(userRepository, 'delete').mockResolvedValue(
            deleteResult as any,
        )

        const result = await userService.deleteById(userId)

        expect(userRepository.delete).toHaveBeenCalledWith(userId)
        expect(result).toBe(deleteResult)
    })
})
