const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    try {
        const [carItems] = await pool.query(
            `SELECT cart.id AS cart_id, cart.quantity, 'car' AS item_type,
                    cars.id AS item_id, cars.make, cars.model, cars.year,
                    cars.price, cars.image_url
             FROM cart JOIN cars ON cart.car_id = cars.id
             WHERE cart.user_id = ?`,
            [req.session.user.id]
        );

        const [accessoryItems] = await pool.query(
            `SELECT cart.id AS cart_id, cart.quantity, 'accessory' AS item_type,
                    accessories.id AS item_id, accessories.name, accessories.category,
                    accessories.price, accessories.image_url
             FROM cart JOIN accessories ON cart.accessory_id = accessories.id
             WHERE cart.user_id = ?`,
            [req.session.user.id]
        );

        res.json([...carItems, ...accessoryItems]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart.' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { car_id, accessory_id, quantity } = req.body;

        if (!car_id && !accessory_id) {
            return res.status(400).json({ error: 'car_id or accessory_id is required.' });
        }

        if (car_id) {
            await pool.query(
                `INSERT INTO cart (user_id, car_id, quantity) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
                [req.session.user.id, car_id, quantity || 1]
            );
        } else {
            await pool.query(
                `INSERT INTO cart (user_id, accessory_id, quantity) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
                [req.session.user.id, accessory_id, quantity || 1]
            );
        }

        res.status(201).json({ message: 'Added to cart.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add to cart.' });
    }
});

router.put('/:cartId', requireAuth, async (req, res) => {
    try {
        const { quantity } = req.body;
        await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.cartId, req.session.user.id]
        );
        res.json({ message: 'Cart updated.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart.' });
    }
});

router.delete('/:cartId', requireAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.cartId, req.session.user.id]);
        res.json({ message: 'Item removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove item.' });
    }
});

module.exports = router;