const Joi = require("joi");
const { validateRequest } = require("../helpers/common-functions.helper");

module.exports = {
  workspaceSchema: async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      description: Joi.string().min(5).required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  addUserWorkspaceSchema: async (req, res, next) => {
    const schema = Joi.object({
      workspaceId: Joi.string().guid().required(),
      userId: Joi.string().guid().required(),
      designationId: Joi.string().guid().required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  updateWorkspaceSchema: async (req, res, next) => {
    const schema = Joi.object({
      description: Joi.string().min(5),
      name: Joi.string().min(2),
    });

    validateRequest(req, res, next, schema, "body");
  },

  updateDesignationWorkspaceSchema: async (req, res, next) => {
    const schema = Joi.object({
      designationId: Joi.string().guid().required(),
      userId: Joi.string().guid().required(),
    });

    validateRequest(req, res, next, schema, "body");
  },
};
