const { commonErrorHandler } = require("../helpers/error-handler.helper");
const sprintService = require("../services/sprint.service");

const createSprint = async (req, res, next) => {
  try {
    const { body: payload, user } = req;
    const data = await sprintService.createSprint(payload, user);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const updateSprint = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      sprintId: params.sprintId,
    };
    const { body: payload, user } = req;
    const data = await sprintService.updateSprint(payload, user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const archiveSprint = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      sprintId: params.sprintId,
    };
    const { user } = req;
    const data = await sprintService.archiveSprint(user, paramsData);
    if (data.error) {
      throw new Error(data.error);
    }
    res.data = data.data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const mySprint = async (req, res, next) => {
  try {
    const { params, user } = req;
    const paramsData = {
      workspaceId: params.workspaceId,
    };
    const data = await sprintService.mySprint(user, paramsData);
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const openSprint = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      sprintId: params.sprintId,
    };
    const { user } = req;
    const data = await sprintService.openSprint(user, paramsData);
     if (data.error) {
       throw new Error(data.error);
     }
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

const openAllSprint = async (req, res, next) => {
  try {
    const { params } = req;
    const paramsData = {
      workspaceId: params.workspaceId,
    };
    const { user } = req;
    const data = await sprintService.openAllSprint(user, paramsData);
     if (data.error) {
       throw new Error(data.error);
     }
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

module.exports = {
  createSprint,
  updateSprint,
  archiveSprint,
  mySprint,
  openSprint,
  openAllSprint,
};
