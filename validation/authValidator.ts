import Joi from 'joi';

export const authValidator = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(15).max(30).email().required(),
    address: Joi.object({
        country_id: Joi.string().required(),
        city_id: Joi.string().required(),
        street_id: Joi.string().required(),
    }).optional(),
    age: Joi.number().min(18).max(120).optional(),
})

