const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for MVP / Testing on Vercel
// Note: This will reset whenever Vercel's serverless function goes to sleep!
let orders = [];

// Get all orders
app.get('/api/orders', (req, res) => {
    // Sort by newest first
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
        id: Date.now().toString().slice(-6), // Simple short ID for display
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

// Only start the server if run directly (not via Vercel)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Dashboard API Server is running on http://localhost:${port}`);
    });
}

// Export the app for Vercel Serverless
module.exports = app;
