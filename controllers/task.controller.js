const { commonErrorHandler } = require("../helpers/error-handler.helper");
const taskService = require("../services/task.service");

const createTask = async (req, res, next) => {
  try {
    const { body: payload, user } = req;
    const data = await taskService.createTask(payload, user);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { body: payload, user } = req;
    const data = await taskService.updateTask(payload, user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const archiveTask = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { user } = req;
    const data = await taskService.archiveTask(user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const myTask = async (req, res, next) => {
  try {
    const { user } = req;
    const data = await taskService.myTask(user);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const watch = async (req, res, next) => {
  try {
    const { params } = req;
    const { user } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const data = await taskService.watch(user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const addTaskComment = async (req, res, next) => {
  try {
    const { body: payload, user } = req;
    const data = await taskService.addTaskComment(payload, user);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const taskStatus = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { body: payload, user } = req;
    const data = await taskService.taskStatus(payload, user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const approveTask = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { user } = req;
    const data = await taskService.approveTask(user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const openTask = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { user } = req;
    const data = await taskService.openTask(user, paramsData);
    if (data.error) {
      throw new Error(data.error);
    }
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const updateTaskComment = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      taskId: params.taskId,
    };
    const { body: payload, user } = req;
    const data = await taskService.updateTaskComment(payload, user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const openAllTask = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      sprintId: params.sprintId,
    };
    const { user } = req;
    const data = await taskService.openAllTask(user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

module.exports = {
  createTask,
  updateTask,
  archiveTask,
  myTask,
  watch,
  addTaskComment,
  taskStatus,
  approveTask,
  openTask,
  updateTaskComment,
  openAllTask,
};
