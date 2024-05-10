const { date } = require("joi");

const createUser = async (req, res, next) => {
  const data = res.data || null;
  const response = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    roleKey: data.roleKey,
  };
  res.data = response;
  next();
};
const getAllUser = async (req, res, next) => {
  const data = res.data || null;

  const serializedData = [];

  data.forEach((item) => {
    const user = {
      id: item.dataValues.id,
      firstName: item.dataValues.firstName,
      lastName: item.dataValues.lastName,
      email: item.dataValues.email,
      designationTitle: item.Designation[0].designationTitle,
    };
    serializedData.push(user);
  });

  res.data = serializedData;
  next();
};

const getSingleUser = async (req, res, next) => {
  const data = res.data || null;
  const response = {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    designationTitle: data.Designation[0].designationTitle,
  };
  res.data = response;
  next();
};

module.exports = {
  createUser,
  getAllUser,
  getSingleUser,
};
