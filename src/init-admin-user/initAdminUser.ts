import bcrypt from 'bcryptjs'
import { UserService } from '../services/userService'
import { AppDataSource } from '../config/data-source'
import logger from '../config/logger'
import { User } from '../entity/User'

export async function initAdminUser() {
    const userRepository = AppDataSource.getRepository(User)
    const userService = new UserService(userRepository)

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const firstName = process.env.ADMIN_FIRST_NAME
    const lastName = process.env.ADMIN_LAST_NAME

    if (!email || !password || !firstName || !lastName) {
        process.exit(1)
    }

    const existingAdmin = await userRepository.findOne({ where: { email } })

    if (existingAdmin) {
        return
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        await userService.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'admin',
        })
    } catch (error) {
        logger.error(error)
    }
}
