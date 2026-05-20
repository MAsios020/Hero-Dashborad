const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function setupDatabase() {
    db = await open({
        filename: path.join(__dirname, 'orders.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customerName TEXT NOT NULL,
            product TEXT NOT NULL,
            productColor TEXT,
            phoneNumber TEXT NOT NULL,
            address TEXT NOT NULL,
            status TEXT DEFAULT 'قيد الانتظار',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

setupDatabase().then(() => {
    console.log('Database initialized successfully.');
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await db.all('SELECT * FROM orders ORDER BY createdAt DESC');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Add a new order
app.post('/api/orders', async (req, res) => {
    const { customerName, product, productColor, phoneNumber, address, status } = req.body;
    
    if (!customerName || !product || !phoneNumber || !address) {
        return res.status(400).json({ error: 'customerName, product, phoneNumber, and address are required' });
    }

    try {
        const result = await db.run(
            'INSERT INTO orders (customerName, product, productColor, phoneNumber, address, status) VALUES (?, ?, ?, ?, ?, ?)',
            [customerName, product, productColor || '', phoneNumber, address, status || 'قيد الانتظار']
        );
        
        const newOrder = await db.get('SELECT * FROM orders WHERE id = ?', result.lastID);
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Dashboard API Server is running on http://localhost:${port}`);
});
