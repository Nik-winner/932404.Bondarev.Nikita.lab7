const { Recipe, Ingredient } = require('../models');

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

exports.getAllRecipes = async (req, res) => {
    try {
        const { difficulty, order } = req.query;
        
        const where = {};
        if (difficulty) {
            if (!VALID_DIFFICULTIES.includes(difficulty)) {
                return res.status(400).json({ 
                    error: `Неизвестная сложность: '${difficulty}'. Допустимые: ${VALID_DIFFICULTIES.join(', ')}` 
                });
            }
            where.difficulty = difficulty;
        }

        const sortDirection = order === 'desc' ? 'DESC' : 'ASC';
        
        const sortField = 'cooking_time_min';

        const recipes = await Recipe.findAll({
            where,
            order: [[sortField, sortDirection]],
            include: [Ingredient]
        });

        res.json({
            count: recipes.length,
            sort: { field: sortField, direction: sortDirection },
            data: recipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id, {
            include: [Ingredient]
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Рецепт не найден' });
        }

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.createRecipe = async (req, res) => {
    try {
        const { name, difficulty, cooking_time_min, ingredients } = req.body;

        if (!name || !difficulty || !cooking_time_min) {
            return res.status(400).json({ 
                error: 'Поля name, difficulty и cooking_time_min обязательны' 
            });
        }

        if (!VALID_DIFFICULTIES.includes(difficulty)) {
            return res.status(400).json({ 
                error: `Неизвестная сложность: '${difficulty}'. Допустимые: ${VALID_DIFFICULTIES.join(', ')}` 
            });
        }

        if (typeof cooking_time_min !== 'number' || cooking_time_min <= 0) {
            return res.status(400).json({ 
                error: 'cooking_time_min должно быть положительным числом' 
            });
        }

        const recipe = await Recipe.create({ name, difficulty, cooking_time_min });

        if (ingredients && Array.isArray(ingredients)) {
            const ingredientRecords = ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                recipe_id: recipe.id
            }));
            await Ingredient.bulkCreate(ingredientRecords);
        }

        const fullRecipe = await Recipe.findByPk(recipe.id, {
            include: [Ingredient]
        });

        res.status(201).json(fullRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.updateRecipe = async (req, res) => {
    try {
        const { name, difficulty, cooking_time_min } = req.body;

        const recipe = await Recipe.findByPk(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Рецепт не найден' });
        }

        if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
            return res.status(400).json({ 
                error: `Неизвестная сложность: '${difficulty}'. Допустимые: ${VALID_DIFFICULTIES.join(', ')}` 
            });
        }

        await recipe.update({
            ...(name !== undefined && { name }),
            ...(difficulty !== undefined && { difficulty }),
            ...(cooking_time_min !== undefined && { cooking_time_min })
        });

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Рецепт не найден' });
        }

        await recipe.destroy();
        res.json({ message: 'Рецепт удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};