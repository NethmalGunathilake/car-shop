const express = require('express');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = 'SELECT * FROM accessories WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch accessories.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM accessories WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Accessory not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch accessory.' });
    }
});

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, image_url, description } = req.body;
        if (!name || !category || !price) {
            return res.status(400).json({ error: 'name, category, and price are required.' });
        }
        const [result] = await pool.query(
            `INSERT INTO accessories (name, category, price, stock, image_url, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, category, price, stock || 0, image_url || '', description || '']
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create accessory.' });
    }
});

router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, image_url, description } = req.body;
        await pool.query(
            `UPDATE accessories SET name=?, category=?, price=?, stock=?, image_url=?, description=? WHERE id=?`,
            [name, category, price, stock, image_url, description, req.params.id]
        );
        res.json({ message: 'Accessory updated.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update accessory.' });
    }
});

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM accessories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Accessory deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete accessory.' });
    }
});

module.exports = router;