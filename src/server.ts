import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { initAdminUser } from './init-admin-user/initAdminUser'

const startServer = async () => {
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize().then(async () => {
            if (process.env.NODE_ENV !== 'test') {
                await initAdminUser()
            }
        })

        logger.info('Database connected successfully.')
        app.listen(PORT, () => {
            logger.info('server listing on port', { port: PORT })
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message)
            setTimeout(() => {
                process.exit(1)
            }, 1000)
        }
    }
}
void startServer()
