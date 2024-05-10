"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
  class UserDesignationMapping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "User",
      });

      this.belongsTo(models.Designation, {
        foreignKey: "designationId",
        targetKey: "id",
        as: "Designation",
      });
    }
  }
  UserDesignationMapping.init(
    {
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
      },
      designationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "designation",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      tableName: "user_designation_mapping",
      modelName: "UserDesignationMapping",
    }
  );
  return UserDesignationMapping;
};
