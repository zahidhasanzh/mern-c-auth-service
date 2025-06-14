import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { createDefaultAdmin } from '../../src/utils/createdefaultAdmin'
import bcrypt from 'bcryptjs'
import { User } from '../../src/entity/User'

describe('Admin User Creation', () => {
    let dataSource: DataSource

    beforeAll(async () => {
        process.env.ADMIN_FIRST_NAME = 'Test'
        process.env.ADMIN_LAST_NAME = 'Admin'
        process.env.ADMIN_EMAIL = 'admin@test.com'
        process.env.ADMIN_PASSWORD = 'securepassword123'

        dataSource = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await dataSource.synchronize(true)
    })

    afterAll(async () => {
        await dataSource.destroy()
    })

    it('should create an admin user if not exists', async () => {
        await createDefaultAdmin(dataSource)
        const userRepository = dataSource.getRepository(User)
        const admin = await userRepository.findOne({
            where: { email: process.env.ADMIN_EMAIL },
        })

        expect(admin).toBeDefined()
        expect(admin?.role).toBe('admin')
    })

    it('should not create duplicate admin user', async () => {
        await createDefaultAdmin(dataSource)
        await createDefaultAdmin(dataSource)

        const userRepository = dataSource.getRepository(User)
        const admins = await userRepository.find({
            where: { email: process.env.ADMIN_EMAIL },
        })

        expect(admins.length).toBe(1)
    })

    it('should hash the password before saving', async () => {
        await createDefaultAdmin(dataSource)
        const userRepository = dataSource.getRepository(User)
        const admin = await userRepository.findOne({
            where: { email: process.env.ADMIN_EMAIL },
            select: ['password'],
            withDeleted: false,
        })

        expect(admin).toBeDefined()
        expect(admin?.password).not.toBe(process.env.ADMIN_PASSWORD)

        const isValidPassword = await bcrypt.compare(
            process.env.ADMIN_PASSWORD!,
            admin!.password,
        )
        expect(isValidPassword).toBe(true)
    })
})
