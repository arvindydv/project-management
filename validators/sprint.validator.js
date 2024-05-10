const Joi = require("joi");
const { validateRequest } = require("../helpers/common-functions.helper");
const moment = require("moment");

module.exports = {
  createSprintSchema: async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2).required(),
      description: Joi.string().min(5).required(),
      workspaceId: Joi.string().guid().required(),
      deadline: Joi.string().required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  updateSprintSchema: async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2),
      description: Joi.string().min(5),
      deadline: Joi.string(),
    });

    validateRequest(req, res, next, schema, "body");
  },
};
