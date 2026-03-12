const express = require('express');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, 'data', 'expenses.json');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Helper function to read expenses
const getExpenses = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '[]', 'utf8');
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper function to save expenses
const saveExpenses = (expenses) => {
    fs.writeFileSync(dataPath, JSON.stringify(expenses, null, 2), 'utf8');
};

// Routes

// Read (GET /)
app.get('/', (req, res) => {
    const expenses = getExpenses();
    
    // Sort expenses by date descending
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    // Group expenses by category for mini chart
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
        return acc;
    }, {});

    res.render('index', { expenses, total, categoryTotals });
});

// Create (POST /expenses)
app.post('/expenses', (req, res) => {
    const { title, amount, category, date } = req.body;
    
    if (title && amount) {
        const newExpense = {
            id: crypto.randomUUID(),
            title,
            amount: parseFloat(amount),
            category: category || 'Other',
            date: date || new Date().toISOString().split('T')[0]
        };

        const expenses = getExpenses();
        expenses.push(newExpense);
        saveExpenses(expenses);
    }

    res.redirect('/');
});

// Delete (DELETE /expenses/:id)
app.delete('/expenses/:id', (req, res) => {
    const id = req.params.id;
    let expenses = getExpenses();
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(expenses);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Expense Tracker running on http://localhost:${PORT}`);
});
