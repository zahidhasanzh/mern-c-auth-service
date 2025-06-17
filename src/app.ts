import 'reflect-metadata'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenants'
import userRouter from './routes/user'
import { Config } from './config'
import { globalErrorHandler } from './middlewares/globalErrorHandler'

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

app.use(globalErrorHandler)
export default app
