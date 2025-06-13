import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenants'
import userRouter from './routes/user'
import { Config } from './config'

const app = express()

const ALLOWED_DOMAINS = [Config.ADMIN_UI_DOMAIN]

app.use(cors({ origin: ALLOWED_DOMAINS as string[], credentials: true }))
app.use(express.static('public'))

app.use(express.json())
app.use(cookieParser())
app.get('/', (req, res) => {
    res.send('Welcome to auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
