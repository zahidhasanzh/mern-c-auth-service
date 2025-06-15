import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    firstName: {
        errorMessage: 'First Name is Required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'First Name is Required',
        notEmpty: true,
        trim: true,
    },
    password: {
        trim: true,
        errorMessage: 'Last name is required!',
        notEmpty: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: 'Password length should be at least 8 chars!',
        },
    },
})
