const Joi = require("joi");
const { validateRequest } = require("../helpers/common-functions.helper");

module.exports = {
  createTaskSchema: async (req, res, next) => {
    const schema = Joi.object({
      task: Joi.string().min(3).required(),
      description: Joi.string().min(5).required(),
      pointer: Joi.string().required(),
      deadline: Joi.string().required(),
      sprintId: Joi.string().guid().required(),
      userId: Joi.string().guid().required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  updateTaskSchema: async (req, res, next) => {
    const schema = Joi.object({
      task: Joi.string().min(3),
      description: Joi.string().min(5),
      pointer: Joi.string(),
      deadline: Joi.string().min(3),
    });

    validateRequest(req, res, next, schema, "body");
  },
  addTaskCommentSchema: async (req, res, next) => {
    const schema = Joi.object({
      taskId: Joi.string().guid().required(),
      comment: Joi.string().min(5).required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  taskStatus: async (req, res, next) => {
    const schema = Joi.object({
      status: Joi.string().valid("Inprogress", "done").required(),
    });

    validateRequest(req, res, next, schema, "body");
  },

  updateTaskCommentSchema: async (req, res, next) => {
    const schema = Joi.object({
      comment: Joi.string().min(5),
    });

    validateRequest(req, res, next, schema, "body");
  },
};
