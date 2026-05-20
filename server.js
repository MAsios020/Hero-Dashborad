const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for MVP / Testing on Vercel
let orders = [];

// Get all orders
app.get('/api/orders', (req, res) => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedOrders);
});

// Add a new order
app.post('/api/orders', (req, res) => {
    const { customerName, product, productColor, phoneNumber, address, status } = req.body;
    
    if (!customerName || !product || !phoneNumber || !address) {
        return res.status(400).json({ error: 'customerName, product, phoneNumber, and address are required' });
    }

    const newOrder = {
        id: Date.now().toString().slice(-6), 
        customerName,
        product,
        productColor: productColor || '',
        phoneNumber,
        address,
        status: status || 'قيد الانتظار',
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
});

// Update order
app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    
    orders[index] = { ...orders[index], ...req.body };
    res.json({ message: 'Order updated', order: orders[index] });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    orders = orders.filter(o => o.id !== id);
    res.json({ message: 'Order deleted' });
});

// Bulk delete orders
app.post('/api/orders/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array is required' });
    }
    orders = orders.filter(o => !ids.includes(o.id));
    res.json({ message: 'Orders deleted' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Dashboard API Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
