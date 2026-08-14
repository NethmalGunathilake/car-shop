const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, minPrice, maxPrice } = req.query;
        let query = 'SELECT * FROM cars WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (make LIKE ? OR model LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }
        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cars.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Car not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch car.' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { make, model, year, price, mileage, description, image_url, stock } = req.body;

        if (!make || !model || !year || !price) {
            return res.status(400).json({ error: 'make, model, year, and price are required.' });
        }

        const [result] = await pool.query(
            `INSERT INTO cars (make, model, year, price, mileage, description, image_url, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [make, model, year, price, mileage || 0, description || '', image_url || '', stock || 1]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create car.' });
    }
});

router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { make, model, year, price, mileage, description, image_url, stock } = req.body;

        await pool.query(
            `UPDATE cars SET make=?, model=?, year=?, price=?, mileage=?, description=?, image_url=?, stock=?
             WHERE id=?`,
            [make, model, year, price, mileage, description, image_url, stock, req.params.id]
        );

        res.json({ message: 'Car updated.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update car.' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
        res.json({ message: 'Car deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete car.' });
    }
});

module.exports = router;