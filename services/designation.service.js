const models = require("../models");
const { sequelize } = require("../models");

const updateDesignation = async (payload, paramsData) => {
  const user = await models.User.findOne({
    where: { id: paramsData.userId },
  });

  if (!user) {
    throw new Error("user not found");
  }

  const findDesignation = await models.Designation.findOne({
    where: { id: payload.designationId },
  });

  if (!findDesignation) {
    throw new Error("Designation not found");
  }

  const checkDesignation = await models.UserDesignationMapping.findOne({
    where: {
      userId: paramsData.userId,
      designationId: payload.designationId,
    },
  });

  if (checkDesignation) {
    throw new Error("This relation is already exist");
  }

  const designation = await models.UserDesignationMapping.update(
    {
      designationId: payload.designationId,
    },
    { where: { userId: paramsData.userId } }
  );

  return "User designation updated successfully";
};

module.exports = {
  updateDesignation,
};
