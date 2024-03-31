import Joi from 'joi';

export const authValidatorRegistration = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(15).max(30).email().required(),
    password: Joi.alternatives().try(Joi.string().min(4), Joi.number()).required(),
    isAdmin: Joi.boolean().required()
})

export const authValidatorLogin = Joi.object({
    email: Joi.string().min(15).max(30).email().required(),
    password: Joi.alternatives().try(Joi.string().min(4), Joi.number()).required(),
    firstName: Joi.string().min(3).max(30).optional(),
    lastName: Joi.string().min(3).max(30).optional(),
    isAdmin: Joi.boolean().optional(),
})