import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'
import { createAdminInit } from './utils/createAdminInit'

const startServer = async () => {
    const PORT = Config.PORT
    try {
        await AppDataSource.initialize()

        // Admin create call
        await createAdminInit()

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
