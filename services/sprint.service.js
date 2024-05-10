const models = require("../models");
const { sequelize } = require("../models");
const { Op, where } = require("sequelize");
const moment = require("moment");
const mailer = require("../helpers/mail.helper");

const findDesignation = async () => {
  const designation = await models.Designation.findOne({
    where: {
      [Op.or]: [{ designationCode: 103 }, { designationCode: 102 }],
    },
  });
  return designation;
};

const findAllWorkspace = async (userId) => {
  const designation = await findDesignation();
  const allWorkspace = await models.UserWorkspaceMapping.findAll({
    where: {
      [Op.and]: [{ userId: userId }, { designationId: designation.id }],
    },
  });
  return allWorkspace;
};

const createSprint = async (payload, user) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: payload.workspaceId },
  });
  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }
  const designation = await models.Designation.findOne({
    where: {
      [Op.or]: [{ designationCode: 103 }, { designationCode: 102 }],
    },
  });
  const isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: user.id },
        { workspaceId: payload.workspaceId },
        { designationId: designation.id },
      ],
    },
  });
  if (!isLeadWorkspace) {
    throw new Error("Access denied");
  }

  const currentTimeDateTime = moment().format("YYYY-MM-DD HH:mm:s");
  const deadline = payload.deadline;
  if (deadline <= currentTimeDateTime) {
    throw new Error("Invalid deadline");
  }

  const sprint = await models.Sprint.create(payload);
  return sprint;
};

const updateSprint = async (payload, user, paramsData) => {
  const checkSprint = await models.Sprint.findOne({
    where: { id: paramsData.sprintId },
  });
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }
  const designation = await models.Designation.findOne({
    where: {
      [Op.or]: [{ designationCode: 103 }, { designationCode: 102 }],
    },
  });
  let isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: user.id },
        { workspaceId: checkSprint.dataValues.workspaceId },
        { designationId: designation.id },
      ],
    },
  });
  if (!isLeadWorkspace) {
    throw new Error("Access denied");
  }

  const sprint = await models.Sprint.update(payload, {
    where: { id: paramsData.sprintId },
  });

  return "sprint updated successfully";
};

const archiveSprint = async (user, paramsData) => {
  const userId = user.id;
  const allWorkspace = await findAllWorkspace(userId);
  if (allWorkspace == "") {
    throw new Error("Access denied");
  }
  const trans = await sequelize.transaction();
  try {
    const checkSprint = await models.Sprint.findOne(
      {
        where: { id: paramsData.sprintId },
      },
      { transaction: trans }
    );
    if (!checkSprint) {
      throw new Error("Sprint not found");
    }
    const designation = await findDesignation();
    const isLeadWorkspace = await models.UserWorkspaceMapping.findOne(
      {
        where: {
          [Op.and]: [
            { userId: user.id },
            { workspaceId: checkSprint.dataValues.workspaceId },
            { designationId: designation.id },
          ],
        },
      },
      { transaction: trans }
    );

    if (!isLeadWorkspace) {
      throw new Error("Access denied");
    }
    const allSprintTask = await models.Task.findAll(
      {
        where: { sprintId: paramsData.sprintId },
      },
      { transaction: trans }
    );
    let userEmail = [];
    for (let userTask = 0; userTask < allSprintTask.length; userTask++) {
      const checkUser = await models.User.findOne({
        where: { id: allSprintTask[userTask].userId },
      });
      userEmail.push(checkUser.email);
    }
    const task = await models.Task.destroy(
      {
        where: { sprintId: paramsData.sprintId },
      },
      { transaction: trans }
    );
    const sprint = await models.Sprint.destroy(
      {
        where: { id: paramsData.sprintId },
      },
      { transaction: trans }
    );
    if (!sprint) {
      throw new Error("something went wrong");
    }
    await trans.commit();
    const body = `All task has been archive by -  ${user.email} in sprint ${checkSprint.name} `;
    const subject = "Task archive";
    const recipient = userEmail;
    mailer.sendMail(body, subject, recipient);
    return { data: "sprint archive successfully", error: null };
  } catch (error) {
    await trans.rollback();
    return { data: null, error: error.message };
  }
};

const mySprint = async (user, paramsData) => {
  const checkWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: user.id }, { workspaceId: paramsData.workspaceId }],
    },
  });

  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }

  const sprint = await models.Sprint.findAll({
    where: { workspaceId: checkWorkspace.workspaceId },
  });
  return sprint;
};

const openSprint = async (user, paramsData) => {
  const userId = user.id;
  const allWorkspace = await findAllWorkspace(userId);
  if (allWorkspace == "") {
    throw new Error("Access denied");
  }
  const sprint = await models.Sprint.restore({
    where: { id: paramsData.sprintId },
  });
  if (!sprint) {
    throw new Error("sprint not found");
  }

  const checkSprint = await models.Sprint.findOne({
    where: { id: paramsData.sprintId },
  });

  const designation = await findDesignation();
  const isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: user.id },
        { workspaceId: checkSprint.dataValues.workspaceId },
        { designationId: designation.id },
      ],
    },
  });

  if (!isLeadWorkspace) {
    await models.Sprint.destroy({
      where: { id: paramsData.sprintId },
    });
    throw new Error("Access denied");
  }
  const findWorkspace = await models.Workspace.findOne({
    where: { id: isLeadWorkspace.workspaceId },
  });
  if (!findWorkspace) {
    await models.Sprint.destroy({
      where: { id: paramsData.sprintId },
    });
    throw new Error("sprint can not be open");
  }
  return "sprint opened successfully";
};

const openAllSprint = async (user, paramsData) => {
  const userId = user.id;
  const allWorkspace = await findAllWorkspace(userId);
  if (allWorkspace == "") {
    throw new Error("Access denied");
  }
  const findWorkspace = await models.Workspace.findOne({
    where: { id: paramsData.workspaceId },
  });
  if (!findWorkspace) {
    throw new Error("Workspace not found");
  }
  const sprint = await models.Sprint.restore({
    where: { workspaceId: paramsData.workspaceId },
  });

  const checkSprint = await models.Sprint.findAll({
    where: { workspaceId: paramsData.workspaceId },
  });
  let userTask = [];
  let allSprintTask;
  for (let sprint = 0; sprint < checkSprint.length; sprint++) {
    await models.Task.restore({
      where: { sprintId: checkSprint[sprint].id },
    });

    allSprintTask = await models.Task.findAll({
      where: { sprintId: checkSprint[sprint].id },
    });
    userTask.push(allSprintTask.id);
  }

  let userEmail = [];
  for (let userTask = 0; userTask < allSprintTask.length; userTask++) {
    const checkUser = await models.User.findOne({
      where: { id: allSprintTask[userTask].userId },
    });
    userEmail.push(checkUser.email);
  }
  const designation = await findDesignation();
  let isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: user.id },
        { workspaceId: paramsData.workspaceId },
        { designationId: designation.id },
      ],
    },
  });

  if (!isLeadWorkspace) {
    for (let sprint = 0; sprint < checkSprint.length; sprint++) {
      await models.Task.destroy({
        where: { sprintId: checkSprint[sprint].id },
      });
    }
    await models.Sprint.destroy({
      where: { workspaceId: paramsData.workspaceId },
    });
    throw new Error("Access denied");
  }
  const body = `All task has been opend by -  ${user.email} in workspace ${findWorkspace.name} `;
  const subject = "Task Opened";
  const recipient = userEmail;
  mailer.sendMail(body, subject, recipient);
  return "All sprint opened successfully";
};
module.exports = {
  createSprint,
  updateSprint,
  archiveSprint,
  mySprint,
  openSprint,
  openAllSprint,
};
