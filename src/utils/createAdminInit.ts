import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { Roles } from '../constants'
import bcrypt from 'bcryptjs'
import logger from '../config/logger'

export const createAdminInit = async (): Promise<void> => {
    const userRepository = AppDataSource.getRepository(User)

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
        logger.warn('Admin email or password is missing')
        return
    }

    const existingAdmin = await userRepository.findOne({
        where: { email: adminEmail },
    })

    if (existingAdmin) {
        return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = userRepository.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Roles.ADMIN,
    })

    await userRepository.save(admin)

    logger.info('Default admin user created successfully')
}
