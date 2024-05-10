const models = require("../models");
const { sequelize } = require("../models");
const { Op, where } = require("sequelize");
const mailer = require("../helpers/mail.helper");
const moment = require("moment");
const user = require("../models/user");

const sprint = async (sprintId) => {
  const sprint = await models.Sprint.findOne({
    where: { id: sprintId },
  });
  return sprint;
};

const userInWorkspaceMapping = async (userId, workspaceId) => {
  const userWorkspaceMapping = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: userId }, { workspaceId: workspaceId }],
    },
  });
  return userWorkspaceMapping;
};

const createTask = async (payload, user) => {
  const sprintId = payload.sprintId;
  const checkSprint = await sprint(sprintId);
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }

  const checkUser = await models.User.findOne({
    where: { id: payload.userId },
  });

  const loginUser = user.id;
  const workspaceId = checkSprint.workspaceId;

  const taskCreator = await userInWorkspaceMapping(loginUser, workspaceId);
  if (!taskCreator) {
    throw new Error("Access denied");
  }

  const assignTo = payload.userId;
  const taskToUser = await userInWorkspaceMapping(assignTo, workspaceId);
  if (!taskToUser) {
    throw new Error("User does not exist in workspace ");
  }

  const currentTimeDateTime = moment().format("YYYY-MM-DD HH:mm:s");
  const deadline = payload.deadline;
  if (deadline <= currentTimeDateTime) {
    throw new Error("Invalid deadline");
  }
  payload.watch = [user.email];
  payload.status = "pending";
  const task = await models.Task.create(payload);

  const body = `You have assign task -  ${task.dataValues.task} by ${user.email}`;
  const subject = "Your workspace Task";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return task;
};

const updateTask = async (payload, user, paramsData) => {
  const checkTask = await models.Task.findOne({
    where: { id: paramsData.taskId },
  });

  if (!checkTask) {
    throw new Error("Task not found");
  }

  const checkUser = await models.User.findOne({
    where: { id: checkTask.userId },
  });

  const sprintId = checkTask.sprintId;
  const checkSprint = await sprint(sprintId);

  const currentTimeDateTime = moment().format("YYYY-MM-DD HH:mm:s");
  const deadline = payload.deadline;
  if (deadline <= currentTimeDateTime) {
    throw new Error("Invalid deadline");
  }
  const loginUser = user.id;
  const workspaceId = checkSprint.workspaceId;

  const taskUpdatedBy = await userInWorkspaceMapping(loginUser, workspaceId);
  if (!taskUpdatedBy) {
    throw new Error("Access denied");
  }

  await models.Task.update(payload, {
    where: { id: paramsData.taskId },
  });

  const body = `Your task has been updated by -  ${user.email}`;
  const subject = "Task Updated";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return "task updated successfully";
};

const archiveTask = async (user, paramsData) => {
  const checkTask = await models.Task.findOne({
    where: { id: paramsData.taskId },
  });

  if (!checkTask) {
    throw new Error("Task not found");
  }

  const checkUser = await models.User.findOne({
    where: { id: checkTask.userId },
  });

  const sprintId = checkTask.sprintId;
  const checkSprint = await sprint(sprintId);
  if (!checkSprint) {
    throw new Error("Task sprint not found");
  }
  const loginUser = user.id;
  const workspaceId = checkSprint.workspaceId;

  const taskDeletedBy = await userInWorkspaceMapping(loginUser, workspaceId);
  if (!taskDeletedBy) {
    throw new Error("Access denied");
  }

  await models.Task.destroy({
    where: { id: paramsData.taskId },
  });

  const body = `Your task ${checkTask.task} has been archive by -  ${user.email}`;
  const subject = "Task archive";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return "task archive successfully";
};

const myTask = async (user) => {
  const task = await models.Task.findAll({
    where: { userId: user.id },
  });
  return task;
};

const watch = async (user, paramsData) => {
  const task = await models.Task.findOne({
    where: { id: paramsData.taskId },
  });
  if (!task) {
    throw new Error("Task not found");
  }
  const checkSprint = await sprint(task.sprintId);
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }

  const loginUser = user.id;
  const workspaceId = checkSprint.workspaceId;

  const taskCreator = await userInWorkspaceMapping(loginUser, workspaceId);
  if (!taskCreator) {
    throw new Error("Access denied");
  }
  const checkUser = await models.User.findOne({
    where: { id: task.userId },
  });
  task.watch.push(user.email);
  const watchedBy = task.watch;
  await models.Task.update(
    {
      watch: watchedBy,
    },
    { where: { id: paramsData.taskId } }
  );

  const body = `${user.email} added into watch`;
  const subject = "Task watch";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return "you are added into task";
};

const addTaskComment = async (payload, user) => {
  const task = await models.Task.findOne({
    where: {
      [Op.and]: [{ id: payload.taskId }, { userId: user.id }],
    },
  });
  if (!task) {
    throw new Error("Task not found");
  }
  if (task.status == "approve") {
    throw new Error("You can not add task comment");
  }
  const taskComment = await models.TaskComment.create(payload);
  return taskComment;
};

const taskStatus = async (payload, user, paramsData) => {
  const task = await models.Task.findOne({
    where: {
      [Op.and]: [{ id: paramsData.taskId }, { userId: user.id }],
    },
  });
  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status == "approve") {
    throw new Error("You can not change task status");
  }
  const leadDesignation = await models.Designation.findOne({
    where: {
      [Op.or]: [{ designationCode: 103 }, { designationCode: 102 }],
    },
  });
  const sprintId = task.sprintId;
  const checkSprint = await sprint(sprintId);
  if (!checkSprint) {
    throw new Error("Task sprint not found");
  }
  const workspaceLead = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { workspaceId: checkSprint.workspaceId },
        { designationId: leadDesignation.id },
      ],
    },
  });
  const leadInfo = await models.User.findOne({
    where: { id: workspaceLead.userId },
  });

  const status = await models.Task.update(payload, {
    where: { id: paramsData.taskId },
  });
  if (payload.status == "done") {
    const body = `Please approve this task -  ${paramsData.taskId} task deadline (${task.deadline})`;
    const subject = "Approve Task ";
    const recipient = leadInfo.email;
    mailer.sendMail(body, subject, recipient);
  }

  return "status updated successfully";
};

const approveTask = async (user, paramsData) => {
  const task = await models.Task.findOne({
    where: {
      id: paramsData.taskId,
    },
  });
  const checkUser = await models.User.findOne({
    where: { id: task.userId },
  });

  const leadDesignation = await models.Designation.findOne({
    where: {
      [Op.or]: [{ designationCode: 103 }, { designationCode: 102 }],
    },
  });
  const sprintId = task.sprintId;
  const checkSprint = await sprint(sprintId);
  const workspaceLead = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { userId: user.id },
        { workspaceId: checkSprint.workspaceId },
        { designationId: leadDesignation.id },
      ],
    },
  });
  if (!workspaceLead) {
    throw new Error("Access denied");
  }

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status == "approved") {
    throw new Error("Task is already approved");
  }

  const status = await models.Task.update(
    {
      status: "approved",
    },
    { where: { id: paramsData.taskId } }
  );
  const body = `Your Task is approved -  ${paramsData.taskId}`;
  const subject = "Approve Task ";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return "Task approved";
};

const openTask = async (user, paramsData) => {
  const openTask = await models.Task.restore({
    where: {
      id: paramsData.taskId,
    },
  });
  if (!openTask) {
    throw new Error("Task not found");
  }
  const findTask = await models.Task.findOne({
    where: { id: paramsData.taskId },
  });
  const findSprint = await models.Sprint.findOne({
    where: { id: findTask.sprintId },
  });
  if (!findSprint) {
    const archiveTask = await models.Task.destroy({
      where: {
        id: paramsData.taskId,
      },
    });
    throw new Error("Task can not be open");
  }
  const userInWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: user.id }, { workspaceId: findSprint.workspaceId }],
    },
  });
  if (!userInWorkspace) {
    const archiveTask = await models.Task.destroy({
      where: {
        id: paramsData.taskId,
      },
    });
    throw new Error("Access denied");
  }
  const checkUser = await models.User.findOne({
    where: { id: findTask.userId },
  });
  const body = `Your task ${findTask.task} has been opend by -  ${user.email}`;
  const subject = "Task Opened";
  const recipient = checkUser.email;
  mailer.sendMail(body, subject, recipient);
  return "task opened successfully";
};

const updateTaskComment = async (payload, user, paramsData) => {
  const task = await models.Task.findOne({
    where: {
      [Op.and]: [{ id: paramsData.taskId }, { userId: user.id }],
    },
  });
  if (!task) {
    throw new Error("Task not found");
  }
  const taskComment = await models.TaskComment.update(payload);
  return "comment updated successfully";
};

const openAllTask = async (user, paramsData) => {
  const checkSprint = await sprint(paramsData.sprintId);
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: checkSprint.workspaceId },
  });
  const userInWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [{ userId: user.id }, { workspaceId: checkSprint.workspaceId }],
    },
  });
  if (!userInWorkspace) {
    throw new Error("Access denied");
  }

  const task = await models.Task.restore({
    where: { sprintId: paramsData.sprintId },
  });
  const allSprintTask = await models.Task.findAll({
    where: { sprintId: paramsData.sprintId },
  });
  let userEmail = [];
  for (let userTask = 0; userTask < allSprintTask.length; userTask++) {
    const checkUser = await models.User.findOne({
      where: { id: allSprintTask[userTask].userId },
    });
    userEmail.push(checkUser.email);
  }
  const body = `All task has been opend by -  ${user.email} in sprint ${checkSprint.name}`;
  const subject = "Task Opened";
  const recipient = userEmail;
  mailer.sendMail(body, subject, recipient);
  return "All task opend successfully";
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
