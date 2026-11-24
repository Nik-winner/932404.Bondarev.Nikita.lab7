const sequelize = require('../config/database');
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');

Recipe.hasMany(Ingredient, {
    foreignKey: 'recipe_id',
    onDelete: 'CASCADE'
});

Ingredient.belongsTo(Recipe, {
    foreignKey: 'recipe_id'
});

module.exports = {
    sequelize,
    Recipe,
    Ingredient
};