const Joi = require('joi');

const fileIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const validateFileId = (params) => fileIdSchema.validate(params);

module.exports = { validateFileId };