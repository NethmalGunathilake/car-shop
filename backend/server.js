require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pool = require('./db');
const carRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const accessoryRoutes = require('./routes/accessories');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: 'change_this_to_something_random_later',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use('/api/cars', carRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/accessories', accessoryRoutes);

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            automatic_payment_methods: { enabled: true }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create payment.' });
    }
});

app.get('/', (req, res) => {
    res.send('Car Shop API is running.');
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});