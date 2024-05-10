const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { validateRequest } = require("../helpers/common-functions.helper");

const complexityOptions = {
  min: 4,
  max: 16,
};

module.exports = {
  createUserSchema: async (req, res, next) => {
    const schema = Joi.object({
      firstName: Joi.string().min(1).required(),
      lastName: Joi.string().min(1).required(),
      email: Joi.string().email().lowercase().required(),
      roleKey: Joi.string().valid("ADM", "USR").required(),
      designationCode: Joi.string().valid(101, 102, 103, 104).required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  loginSchema: async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().required(),
    });
    validateRequest(req, res, next, schema, "body");
  },

  resetPassword: async (req, res, next) => {
    const schema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(5).required(),
    });
    validateRequest(req, res, next, schema, "body");
  },

  forgetPassword: async (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().email().lowercase().required(),
    });
    validateRequest(req, res, next, schema, "body");
  },

  resetPasswordByLink: async (req, res, next) => {
    const schema = Joi.object({
      password: Joi.string().min(5).required(),
    });
    validateRequest(req, res, next, schema, "body");
  },

  limitPageSchema: async (req, res, next) => {
    const schema = Joi.object({
      page: Joi.number().positive().allow(0).required(),
      limit: Joi.number().positive().required(),
    });
    validateRequest(req, res, next, schema, "query");
  },
};
