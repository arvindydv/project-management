const models = require("../models");
const { sequelize } = require("../models");
const { Op, where } = require("sequelize");
const mailer = require("../helpers/mail.helper");
const { query } = require("express");

const createWorkspace = async (payload, user) => {
  const trans = await sequelize.transaction();
  try {
    const workspace = await models.Workspace.create(payload, {
      transaction: trans,
    });

    if (!workspace) {
      throw new Error("Something went wrong");
    }
    const userId = user.id;
    const workspaceId = workspace.dataValues.id;

    const workspaceData = {
      userId: userId,
      workspaceId: workspaceId,
      designationId: user.Designation[0].dataValues.id,
    };

    const userWorkspaceMapping = await models.UserWorkspaceMapping.create(
      workspaceData,
      {
        transaction: trans,
      }
    );
    if (!userWorkspaceMapping) {
      throw new Error("Something went wrong");
    }
    await trans.commit();
    return workspace;
  } catch (error) {
    await trans.rollback();
    return { data: null, error: error.message };
  }
};

const addUserInWorkspace = async (payload) => {
  const workspace = await models.Workspace.findOne({
    where: { id: payload.workspaceId },
  });

  if (!workspace) {
    throw new Error("Workspace Not Found");
  }

  const user = await models.User.findOne({
    where: { id: payload.userId },
  });
  if (!user) {
    throw new Error("User Not Found");
  }
  const designation = await models.Designation.findOne({
    where: { id: payload.designationId },
  });
  if (!designation) {
    throw new Error("Designation Not Found");
  }
  const existingRelation = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: payload.userId },
        { workspaceId: payload.workspaceId },
      ],
    },
  });

  if (existingRelation) {
    throw new Error("User is already exist in workspace ");
  }

  let userWorkspaceData = {
    userId: payload.userId,
    workspaceId: payload.workspaceId,
    designationId: payload.designationId,
  };
  const addInWorkspace = await models.UserWorkspaceMapping.create(
    userWorkspaceData
  );
  const body = `you are added into  ${workspace.name}  workspace`;
  const subject = "workspace";
  const recipient = user.email;
  mailer.sendMail(body, subject, recipient);
  return addInWorkspace;
};

const getAllWorkSpace = async (query) => {
  let limit = query.page == 0 ? null : query.limit;
  let page = query.page < 2 ? 0 : query.page;

  const workspace = await models.UserWorkspaceMapping.findAll({
    attributes: {
      exclude: [
        "created_at",
        "userId",
        "designationId",
        "updated_at",
        "deleted_at",
      ],
    },
    include: [
      {
        model: models.Workspace,
        as: "Workspace",
        attributes: ["name"],
      },
      {
        model: models.User,
        as: "User",
        attributes: ["email"],
      },
      {
        model: models.Designation,
        as: "Designation",
        attributes: ["designationTitle"],
      },
    ],
    limit: limit,
    offset: page * limit,
  });
  return workspace;
};

const updateWorkspace = async (payload, user, paramsData) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: paramsData.workspaceId },
  });

  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }

  let existingManager = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: user.id }, { workspaceId: paramsData.workspaceId }],
    },
  });

  if (!existingManager) {
    throw new Error("Access denied");
  }

  const workspace = await models.Workspace.update(payload, {
    where: { id: paramsData.workspaceId },
  });
  return "workspace updated successfully";
};

const updateUserDesignationInWorkspace = async (payload, user, paramsData) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: paramsData.workspaceId },
  });

  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }
  const userInWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: payload.userId },
        { workspaceId: paramsData.workspaceId },
      ],
    },
  });

  if (!userInWorkspace) {
    throw new Error("User does not exist in workspace ");
  }
  const checkUser = await models.User.findOne({
    where: { id: payload.userId },
  });

  const designation = await models.Designation.findOne({
    where: { id: payload.designationId },
  });
  if (!designation) {
    throw new Error("Designation Not Found");
  }

  let existingRelation = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: payload.userId },
        { workspaceId: paramsData.workspaceId },
        { designationId: payload.designationId },
      ],
    },
  });

  if (existingRelation) {
    throw new Error("This relation is already exist in workspace ");
  }
  await models.UserWorkspaceMapping.update(
    {
      designationId: payload.designationId,
    },
    {
      where: {
        [Op.and]: [
          { userId: payload.userId },
          { workspaceId: paramsData.workspaceId },
        ],
      },
    }
  );
  const body = `your designation has been updated into  ${checkWorkspace.name}  workspace`;
  const subject = "update designation";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);

  return "user designation updated successfully";
};

const archiveWorkspace = async (paramsData) => {
  const trans = await sequelize.transaction();
  try {
    const checkWorkspace = await models.Workspace.findOne(
      {
        where: { id: paramsData.workspaceId },
      },
      { transaction: trans }
    );

    if (!checkWorkspace) {
      throw new Error("Workspace not found");
    }
    const sprint = await models.Sprint.findAll(
      {
        where: { workspaceId: paramsData.workspaceId },
      },
      { transaction: trans }
    );

    for (let sprintId = 0; sprintId < sprint.length; sprintId++) {
      const task = await models.Task.destroy(
        {
          where: { sprintId: sprint[sprintId].id },
        },
        { transaction: trans }
      );
    }

    const destroySprint = await models.Sprint.destroy(
      {
        where: { workspaceId: paramsData.workspaceId },
      },
      { transaction: trans }
    );

    const workspace = await models.Workspace.destroy(
      {
        where: { id: paramsData.workspaceId },
      },
      { transaction: trans }
    );
    if (!workspace) {
      throw new Error("Something went wrong");
    }

    await trans.commit();
    return "workspace deleted successfully";
  } catch (error) {
    await trans.rollback();
    return { data: null, error: error.message };
  }
};

const removeUserWorkspace = async (query) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: query.workspaceId },
  });

  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }

  let existingRelation = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: query.userId }, { workspaceId: query.workspaceId }],
    },
  });

  if (!existingRelation) {
    throw new Error("User does not exist in workspace");
  }
  await models.UserWorkspaceMapping.destroy({
    where: {
      [Op.and]: [{ userId: query.userId }, { workspaceId: query.workspaceId }],
    },
  });
  const user = await models.User.findOne({
    where: { id: query.userId },
  });

  const body = `you are remove from  ${checkWorkspace.name}  workspace`;
  const subject = "workspace";
  const recipient = user.email;
  mailer.sendMail(body, subject, recipient);
  return "User remove successfully";
};

const myWorkspace = async (user) => {
  const workspace = await models.UserWorkspaceMapping.findAll({
    where: { userId: user.id },
    include: [
      {
        model: models.Designation,
        as: "Designation",
        attributes: ["designationTitle"],
      },
      {
        model: models.User,
        as: "User",
        attributes: ["email"],
      },
    ],
  });
  return workspace;
};

const openWorkspace = async (paramsData) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: paramsData.workspaceId },
  });

  if (checkWorkspace) {
    throw new Error("Workspace is already opend");
  }
  const workspace = await models.Workspace.restore({
    where: { id: paramsData.workspaceId },
  });
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return "workspace open successfully";
};

const getSingleworkspace = async (paramsData) => {
  const workspace = await models.UserWorkspaceMapping.findAll({
    where: { workspaceId: paramsData.workspaceId },
    attributes: {
      exclude: ["deleted_at", "created_at", "updated_at"],
    },
    include: [
      {
        model: models.Workspace,
        as: "Workspace",
        attributes: ["name"],
      },
      {
        model: models.User,
        as: "User",
        attributes: ["email"],
      },
      {
        model: models.Designation,
        as: "Designation",
        attributes: ["designationTitle"],
      },
    ],
  });
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  return workspace;
};

module.exports = {
  createWorkspace,
  addUserInWorkspace,
  getAllWorkSpace,
  updateWorkspace,
  updateUserDesignationInWorkspace,
  archiveWorkspace,
  removeUserWorkspace,
  myWorkspace,
  openWorkspace,
  getSingleworkspace,
};
