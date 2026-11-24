const express = require('express');
const { sequelize } = require('./models');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'API рецептов работает',
        endpoints: {
            'GET /api/recipes': 'Получить все рецепты',
            'GET /api/recipes/:id': 'Получить рецепт по ID',
            'POST /api/recipes': 'Создать рецепт',
            'PUT /api/recipes/:id': 'Обновить рецепт',
            'DELETE /api/recipes/:id': 'Удалить рецепт'
        }
    });
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('База данных синхронизирована');
        app.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Ошибка подключения к БД:', err);
    });