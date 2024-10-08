const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Import dotenv and load .env file

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// Create a schema and model
const walletSchema = new mongoose.Schema({
    totalAmount: Number,
    totalCost: Number,
    costs: [
        {
            costName: String,
            costAmount: Number
        }
    ]
});

const Wallet = mongoose.model('Wallet', walletSchema);

// Initialize wallet data if not exists
const initWallet = async () => {
    const wallet = await Wallet.findOne();
    if (!wallet) {
        const newWallet = new Wallet({ totalAmount: 0, totalCost: 0, costs: [] });
        await newWallet.save();
    }
};
initWallet();

// Routes

// Fetch the wallet data
app.get('/api/costs', async (req, res) => {
    try {
        const wallet = await Wallet.findOne();
        res.json(wallet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a cost and update total amount
app.post('/api/add-cost', async (req, res) => {
    try {
        const { costName, costAmount } = req.body;
        const wallet = await Wallet.findOne();

        if (wallet) {
            wallet.costs.push({ costName, costAmount });
            wallet.totalCost += costAmount;
            wallet.totalAmount -= costAmount;
            await wallet.save();
        }

        res.status(200).json({ message: 'Cost added successfully', wallet });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update the total amount
app.post('/api/update-total', async (req, res) => {
    try {
        const { newAmount } = req.body;
        const wallet = await Wallet.findOne();

        if (wallet) {
            wallet.totalAmount = newAmount;
            await wallet.save();
        }

        res.status(200).json({ message: 'Total amount updated successfully', wallet });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
