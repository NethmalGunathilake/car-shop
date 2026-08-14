const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [carItems] = await connection.query(
            `SELECT cart.id AS cart_id, cart.car_id, cart.quantity, cars.price
             FROM cart JOIN cars ON cart.car_id = cars.id
             WHERE cart.user_id = ?`,
            [req.session.user.id]
        );

        const [accessoryItems] = await connection.query(
            `SELECT cart.id AS cart_id, cart.accessory_id, cart.quantity, accessories.price
             FROM cart JOIN accessories ON cart.accessory_id = accessories.id
             WHERE cart.user_id = ?`,
            [req.session.user.id]
        );

        if (carItems.length === 0 && accessoryItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Your cart is empty.' });
        }

        const total =
            carItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
            accessoryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
            [req.session.user.id, total, 'pending']
        );
        const orderId = orderResult.insertId;

        for (const item of carItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, car_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.car_id, item.quantity, item.price]
            );
        }

        for (const item of accessoryItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, accessory_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.accessory_id, item.quantity, item.price]
            );
        }

        await connection.query('DELETE FROM cart WHERE user_id = ?', [req.session.user.id]);

        await connection.commit();
        res.status(201).json({ orderId, total });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Checkout failed.' });
    } finally {
        connection.release();
    }
});

router.get('/', requireAuth, async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});

router.get('/all', requireAdmin, async (req, res) => {
    try {
        const [orders] = await pool.query(
            `SELECT orders.*, users.name AS customer_name, users.email AS customer_email
             FROM orders JOIN users ON orders.user_id = users.id
             ORDER BY orders.created_at DESC`
        );
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});

module.exports = router;