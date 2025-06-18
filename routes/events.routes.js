const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

module.exports = (pool) => {
    router.get('/', async (req, res) => {
        try {
            const client = await pool.connect();
            const result = await client.query(
                `SELECT e.*, u.name as organizer_name, u.email as organizer_email
                 FROM events e
                 JOIN users u ON e.organizer_id = u.user_id
                 WHERE e.status = 'approved'
                 ORDER BY e.date ASC, e.time ASC;`
            );
            client.release();
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching approved events:', err.message);
            res.status(500).json({ message: 'Server error fetching events.' });
        }
    });

    router.get('/my-events', authenticateToken, authorizeRole(['organizer', 'admin']), async (req, res) => {
        const organizer_id = req.user.user_id;

        if (!organizer_id) {
            return res.status(400).json({ message: 'Organizer ID not found in token.' });
        }

        try {
            const client = await pool.connect();
            const result = await client.query(
                `SELECT e.*, u.name as organizer_name, u.email as organizer_email
                 FROM events e JOIN users u ON e.organizer_id = u.user_id
                 WHERE e.organizer_id = $1
                 ORDER BY e.created_at DESC;`,
                [organizer_id]
            );
            client.release();
            res.status(200).json(result.rows);
        } catch (err) {
            console.error('Error fetching organizer events:', err.message);
            res.status(500).json({ message: 'Server error fetching your events.' });
        }
    });

    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const client = await pool.connect();
            const result = await client.query(
                `SELECT e.*, u.name as organizer_name, u.email as organizer_email
                 FROM events e
                 JOIN users u ON e.organizer_id = u.user_id
                 WHERE e.event_id = $1;`,
                [id]
            );
            client.release();

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Event not found.' });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching event details:', err.message);
            res.status(500).json({ message: 'Server error fetching event details.' });
        }
    });

    router.post('/', authenticateToken, authorizeRole(['organizer', 'admin']), async (req, res) => {
        const { title, description, date, time, location, capacity, image_url } = req.body;
        const organizer_id = req.user.user_id;
        const status = 'pending';

        if (!title || !date || !time || !location || !organizer_id) {
            return res.status(400).json({ message: 'Title, date, time, and location are required.' });
        }

        try {
            const client = await pool.connect();
            const result = await client.query(
                `INSERT INTO events (title, description, date, time, location, organizer_id, capacity, status, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *;`,
                [title, description, date, time, location, organizer_id, capacity, status, image_url]
            );
            client.release();
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating event:', err.message);
            res.status(500).json({ message: 'Server error creating event.' });
        }
    });

    router.put('/:id', authenticateToken, authorizeRole(['organizer', 'admin']), async (req, res) => {
        const { id } = req.params;
        const { title, description, date, time, location, capacity, image_url, status } = req.body;
        const requesting_user_id = req.user.user_id;
        const requesting_user_role = req.user.role;

        if (!title && !description && !date && !time && !location && !capacity && !image_url && !status) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        try {
            const client = await pool.connect();
            const eventResult = await client.query('SELECT organizer_id, status FROM events WHERE event_id = $1', [id]);
            if (eventResult.rows.length === 0) {
                client.release();
                return res.status(404).json({ message: 'Event not found.' });
            }
            const event = eventResult.rows[0];

            if (event.organizer_id !== requesting_user_id && requesting_user_role !== 'admin') {
                client.release();
                return res.status(403).json({ message: 'Forbidden: You can only edit your own events.' });
            }

            if (requesting_user_role === 'organizer' && status === 'approved') {
                client.release();
                return res.status(403).json({ message: 'Forbidden: Organizers cannot approve their own events.' });
            }

            const updateFields = [];
            const queryParams = [];
            let paramIndex = 1;

            if (title !== undefined) { updateFields.push(`title = $${paramIndex++}`); queryParams.push(title); }
            if (description !== undefined) { updateFields.push(`description = $${paramIndex++}`); queryParams.push(description); }
            if (date !== undefined) { updateFields.push(`date = $${paramIndex++}`); queryParams.push(date); }
            if (time !== undefined) { updateFields.push(`time = $${paramIndex++}`); queryParams.push(time); }
            if (location !== undefined) { updateFields.push(`location = $${paramIndex++}`); queryParams.push(location); }
            if (capacity !== undefined) { updateFields.push(`capacity = $${paramIndex++}`); queryParams.push(capacity); }
            if (image_url !== undefined) { updateFields.push(`image_url = $${paramIndex++}`); queryParams.push(image_url); }
            if (status !== undefined) { 
                updateFields.push(`status = $${paramIndex++}`); 
                queryParams.push(status); 
            }

            updateFields.push('updated_at = NOW()');
            queryParams.push(id);

            const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE event_id = $${paramIndex} RETURNING *;`;

            const result = await client.query(updateQuery, queryParams);
            client.release();

            res.status(200).json({ message: 'Event updated successfully!', event: result.rows[0] });

        } catch (err) {
            console.error('Error updating event:', err.message);
            res.status(500).json({ message: 'Server error updating event.' });
        }
    });

    router.delete('/:id', authenticateToken, authorizeRole(['organizer', 'admin']), async (req, res) => {
        const { id } = req.params;
        const requesting_user_id = req.user.user_id;
        const requesting_user_role = req.user.role;

        try {
            const client = await pool.connect();
            const eventResult = await client.query('SELECT organizer_id, status FROM events WHERE event_id = $1', [id]);
            if (eventResult.rows.length === 0) {
                client.release();
                return res.status(404).json({ message: 'Event not found.' });
            }
            const event = eventResult.rows[0];

            if (event.organizer_id !== requesting_user_id && requesting_user_role !== 'admin') {
                client.release();
                return res.status(403).json({ message: 'Forbidden: You can only delete your own events.' });
            }

            await client.query('DELETE FROM events WHERE event_id = $1;', [id]);
            client.release();

            res.status(200).json({ message: 'Event deleted successfully!', eventId: id });
        } catch (err) {
            console.error('Error deleting event:', err.message);
            res.status(500).json({ message: 'Server error deleting event.' });
        }
    });

    router.put('/:id/approve', authenticateToken, authorizeRole(['admin']), async (req, res) => {
        const { id } = req.params;
        try {
            const client = await pool.connect();
            const result = await client.query(
                `UPDATE events SET status = 'approved', updated_at = NOW()
                 WHERE event_id = $1 AND status = 'pending' RETURNING *;`,
                [id]
            );
            client.release();

            if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found or not pending.' });
            res.status(200).json({ message: 'Event approved!', event: result.rows[0] });
        } catch (err) {
            console.error('Error approving event:', err.message);
            res.status(500).json({ message: 'Server error approving event.' });
        }
    });

    router.put('/:id/reject', authenticateToken, authorizeRole(['admin']), async (req, res) => {
        const { id } = req.params;
        try {
            const client = await pool.connect();
            const result = await client.query(
                `UPDATE events SET status = 'rejected', updated_at = NOW()
                 WHERE event_id = $1 AND status = 'pending' RETURNING *;`,
                [id]
            );
            client.release();

            if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found or not pending.' });
            res.status(200).json({ message: 'Event rejected!', event: result.rows[0] });
        } catch (err) {
            console.error('Error rejecting event:', err.message);
            res.status(500).json({ message: 'Server error rejecting event.' });
        }
    });

    router.post('/:id/register', authenticateToken, authorizeRole(['user', 'organizer', 'admin']), async (req, res) => {
        const eventId = req.params.id;
        const userId = req.user.user_id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required to register for an event.' });
        }
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required to register.' });
        }

        try {
            const client = await pool.connect();

            const eventCheck = await client.query(
                `SELECT event_id, status, capacity FROM events WHERE event_id = $1;`,
                [eventId]
            );
            if (eventCheck.rows.length === 0) {
                client.release();
                return res.status(404).json({ message: 'Event not found.' });
            }
            const event = eventCheck.rows[0];
            if (event.status !== 'approved') {
                client.release();
                return res.status(400).json({ message: 'Cannot register for an event that is not approved.' });
            }

            if (event.capacity) {
                const registrationCount = await client.query(
                    `SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status = 'registered';`,
                    [eventId]
                );
                if (parseInt(registrationCount.rows[0].count, 10) >= event.capacity) {
                    client.release();
                    return res.status(400).json({ message: 'Event is full, cannot register.' });
                }
            }

            const result = await client.query(
                `INSERT INTO registrations (user_id, event_id, status)
                 VALUES ($1, $2, 'registered')
                 RETURNING *;`,
                [userId, eventId]
            );
            client.release();
            res.status(201).json({ message: 'Successfully registered for the event!', registration: result.rows[0] });

        } catch (err) {
            console.error('Error registering for event:', err.message);
            if (err.code === '23505') {
                return res.status(409).json({ message: 'You are already registered for this event.' });
            }
            res.status(500).json({ message: 'Server error during event registration.' });
        }
    });

    return router;
};
