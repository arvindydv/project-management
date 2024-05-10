const { commonErrorHandler } = require("../helpers/error-handler.helper");
const designationService = require("../services/designation.service");

const updateDesignation = async (req, res, next) => {
  try {
    const { body: payload } = req;
    const { params } = req;
    const paramsData = {
      userId: params.userId,
    };
    const data = await designationService.updateDesignation(
      payload,
      paramsData
    );
    res.data = data;
    next();
  } catch (error) {
    commonErrorHandler(req, res, error.message, 400, error);
  }
};

module.exports = {
  updateDesignation,
};
