"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.TaskComment, {
        foreignKey: "taskId",
        sourceKey: "id",
        as: "TaskComment",
      });

      this.hasMany(models.Tag, {
        foreignKey: "taskId",
        sourceKey: "id",
        as: "Tag",
      });

      this.belongsTo(models.Sprint, {
        foreignKey: "sprintId",
        targetKey: "id",
        as: "Sprint",
      });

      this.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: 'User'
      });
    }
  }
  Task.init(
    {
      task: {
        type: Sequelize.STRING,
        allowNull: false,
        isAlpha: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
        isAlpha: true,
      },
      pointer: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      watch: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        isAlpha: true,
      },
      sprintId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "sprint",
          key: "id",
        },
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      tableName: "task",
      modelName: "Task",
    }
  );
  return Task;
};
