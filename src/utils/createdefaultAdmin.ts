// src/utils/createDefaultAdmin.ts

import bcrypt from 'bcryptjs'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'

export const createDefaultAdmin = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(User)

    const adminEmail = process.env.ADMIN_EMAIL!

    const existingAdmin = await userRepository.findOne({
        where: { email: adminEmail },
    })

    if (existingAdmin) {
        return
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10)

    const adminUser = userRepository.create({
        firstName: process.env.ADMIN_FIRST_NAME!,
        lastName: process.env.ADMIN_LAST_NAME!,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
    })

    await userRepository.save(adminUser)
}
