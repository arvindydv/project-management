const createSprint = async (req, res, next) => {
  const data = res.data || null;
  const response = {
    id: data.id,
    workspaceId: data.workspaceId,
    name: data.name,
    description: data.description,
    deadline: data.deadline,
  };
  res.data = response;
  next();
};

const getMySprint = async (req, res, next) => {
  const data = res.data || null;
  const serializedData = [];
  data.forEach((item) => {
    const user = {
      id: item.dataValues.id,
      name: item.dataValues.name,
      description: item.dataValues.description,
      deadline: item.dataValues.deadline,
      workspaceId: item.dataValues.workspaceId,
    };
    serializedData.push(user);
  });
  res.data = serializedData;
  next();
};

module.exports = {
  createSprint,
  getMySprint,
};
