const models = require("../models");
const { sequelize } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const mailer = require("../helpers/mail.helper");
const UniqueStringGenerator = require("unique-string-generator");
const redisClient = require("../utility/redis");

const createUser = async (payload) => {
  const password = randomstring.generate(7);
  const trans = await sequelize.transaction();
  try {
    const existingUser = await models.User.findOne(
      {
        where: { email: payload.email },
      },
      { transaction: trans }
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    payload.password = await bcrypt.hash(password, 10);
    const user = await models.User.create(payload, { transaction: trans });

    if (!user) {
      throw new Error("Something went wrong");
    }
    const userId = user.dataValues.id;

    if (payload.designationCode) {
      const designation = await models.Designation.findOne(
        {
          where: {
            designationCode: payload.designationCode,
          },
        },
        { transaction: trans }
      );

      if (!designation) {
        throw new Error("Invalid Designation");
      }
      const designationUserMappingDesignationID =
        await models.UserDesignationMapping.create(
          {
            designationId: designation.dataValues.id,
            userId: userId,
          },
          { transaction: trans }
        );
      if (!designationUserMappingDesignationID) {
        throw new Error("Something went wrong");
      }
    }
    if (payload.roleKey) {
      const role = await models.Role.findOne(
        {
          where: {
            roleKey: payload.roleKey,
          },
        },
        { transaction: trans }
      );

      if (!role) {
        throw new Error("Invalid Role");
      }
      const userRoleMapping = await models.UserRoleMapping.create(
        {
          userId: userId,
          roleId: role.id,
        },
        { transaction: trans }
      );

      if (!userRoleMapping) {
        throw new Error("Something went wrong");
      }
    }
    await trans.commit();
    const body = `your project management passsword is- ${password}`;
    const subject = "project management registration";
    const recipient = payload.email;
    mailer.sendMail(body, subject, recipient);
    return payload;
  } catch (error) {
    await trans.rollback();
    return { data: null, error: error };
  }
};

const loginUser = async (payload) => {
  const { email, password } = payload;

  const user = await models.User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new Error("User Not Found!");
  }
  let key = user.dataValues.id + "-refresh-token";
  let refreshToken = await redisClient.get(key);
  if (!refreshToken) {https://github.com/arvindgkmit/pm
    const match = await bcrypt.compare(password, user.dataValues.password);
    if (!match) {
      throw new Error("Wrong email or password");
    }
    refreshToken = jwt.sign(
      { userId: user.dataValues.id },
      process.env.SECRET_KEY_REFRESH,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      }
    );
  }

  const accessToken = jwt.sign(
    { userId: user.dataValues.id },
    process.env.SECRET_KEY_ACCESS
  );

  delete user.dataValues.password;
  await redisClient.set(key, refreshToken, 60 * 24);

  return {
    id: user.id,
    email: user.email,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const getAllUser = async (query) => {
  let limit = query.page == 0 ? null : query.limit;
  let page = query.page < 2 ? 0 : query.page;

  const users = await models.User.findAll({
    attributes: {
      exclude: ["created_at", "updated_at", "deleted_at", "password"],
    },
    include: [
      {
        model: models.Designation,
        as: "Designation",
        attributes: ["designationTitle"],
      },
    ],
    limit: limit,
    offset: page * 3,
  });
  return users;
};

const getSingleUser = async (query) => {
  const user = await models.User.findOne({
    where: { id: query.userId },
    attributes: {
      exclude: ["deleted_at", "created_at", "updated_at", "password"],
    },
    include: [
      {
        model: models.Designation,
        as: "Designation",
        attributes: ["designationTitle"],
      },
    ],
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const resetPassword = async (payload, user) => {
  const userId = user.id;
  const password = payload.oldPassword;
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Wrong credentials");
  }
  const newPassword = await bcrypt.hash(payload.newPassword, 10);
  const updatePassword = await models.User.update(
    { password: newPassword },
    { where: { id: userId } }
  );

  return "password reset successdully";
};

const forgetPassword = async (payload) => {
  const email = payload.email;
  const findUser = await models.User.findOne({
    where: { email: email },
  });

  if (!findUser) {
    throw new Error("user not found");
  }
  const randomToken = UniqueStringGenerator.UniqueString();
  const body = `reset password link- ${process.env.BASE_URL}/user/reset-password/${randomToken}`;
  const subject = "reset password";
  const recipient = email;
  const userId = findUser.dataValues.id;
  await redisClient.set(randomToken, userId, 20);
  mailer.sendMail(body, subject, recipient);
  return "reset password link send successfully";
};

const resetPasswordByLink = async (payload, params) => {
  const resetToken = params.token;
  const password = payload.password;
  let key = resetToken;
  const cachedUserId = await redisClient.get(key);
  if (!cachedUserId) {
    throw new Error("Invalid Reset Link");
  }

  const userExist = await models.User.findOne({ where: { id: cachedUserId } });
  if (!userExist) {
    throw new Error("User Not Found");
  }
  await redisClient.del(key);

  await models.User.update(
    { password: await bcrypt.hash(password, 10) },
    { where: { email: userExist.dataValues.email } }
  );

  const body = "Password reset successfull";
  const subject = "Password reset";
  const recipient = userExist.dataValues.email;
  mailer.sendMail(body, subject, recipient);
  return "Password reset successfully";
};

const refreshToken = async (payload) => {
  const { userId, token: refreshToken } = payload;

  let newAccessToken = jwt.sign(
    { userId: userId },
    process.env.SECRET_KEY_ACCESS,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    }
  );

  return {
    accessToken: newAccessToken,
    refreshToken,
  };
};

const deactivateUser = async (paramsData) => {
  const user = await models.User.findOne({
    where: { id: paramsData.userId },
  });

  if (!user) {
    throw new Error("User Not Found!");
  }

  await models.User.destroy({
    where: { id: paramsData.userId },
  });

  return "user deactivated successfully";
};

const logOutUser = async (payload, user) => {
  const userId = user.id;
  const refreshTokenKey = userId + "-refresh-token";
  const isCachedRefreshToken = redisClient.get(refreshTokenKey);

  if (isCachedRefreshToken) {
    redisClient.del(refreshTokenKey);
  }
  return "logout successfully";
};

module.exports = {
  createUser,
  loginUser,
  getAllUser,
  getSingleUser,
  resetPassword,
  forgetPassword,
  refreshToken,
  resetPasswordByLink,
  deactivateUser,
  logOutUser,
};
