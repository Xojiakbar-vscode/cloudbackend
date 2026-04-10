const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(6),
});

const userIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const validateUpdateUser = (data) => updateUserSchema.validate(data);
const validateUserId = (params) => userIdSchema.validate(params);

module.exports = { validateUpdateUser, validateUserId };