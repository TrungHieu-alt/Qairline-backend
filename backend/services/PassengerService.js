// backend/services/PassengerService.js
const db = require('../config/db'); // Assume db is configured
const crypto = require('crypto'); // Import crypto for UUID generation

class PassengerService {
    constructor() {
        // Basic constructor
    }

    /**
     * Creates a new passenger record in the passengers table.
     * @param {Object} data - Passenger data including id, first_name, last_name, etc.
     * @returns {Promise<Object>} The created passenger record.
     */
    async createPassenger(data) {
        const passengerId = data.id || crypto.randomUUID(); // Use provided ID or generate new UUID

        const query = `
            INSERT INTO passengers (id, first_name, last_name, birth_date, gender, identity_number, phone_number, email, address, country, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            passengerId,
            data.first_name,
            data.last_name,
            data.birth_date,
            data.gender,
            data.identity_number,
            data.phone_number,
            data.email,
            data.address,
            data.country
        ];
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error creating passenger:', error.message);
            throw new Error(`Could not create passenger: ${error.message}`);
        }
    }

    /**
     * Updates an existing passenger record.
     * @param {string} id - The UUID of the passenger to update.
     * @param {Object} data - Fields to update (first_name, last_name, etc.).
     * @returns {Promise<Object>} The updated passenger record.
     */
    async updatePassenger(id, data) {
        const fields = Object.keys(data).filter(key => data[key] !== undefined && key !== 'id'); // Exclude id and undefined values
        if (fields.length === 0) {
            // No fields to update, return current record or throw error
             const existingPassenger = await this.getPassengerById(id);
             if (!existingPassenger) {
                 throw new Error('Passenger not found');
             }
             return existingPassenger;
           // Or throw new Error('No fields provided for update');
        }

        const setClauses = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = fields.map(field => data[field]);
        values.push(id); // Add id as the last parameter

        const query = `
            UPDATE passengers
            SET ${setClauses}, updated_at = NOW()
            WHERE id = $${values.length}
            RETURNING *;
        `;

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Passenger not found');
            }
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error updating passenger:', error.message);
            throw new Error(`Could not update passenger: ${error.message}`);
        }
    }

    /**
     * Gets a passenger record by ID.
     * @param {string} id - The UUID of the passenger.
     * @returns {Promise<Object|null>} The passenger record or null if not found.
     */
    async getPassengerById(id) {
        try {
            const result = await db.query('SELECT * FROM passengers WHERE id = $1', [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('❌ Error getting passenger by ID:', error.message);
            throw new Error(`Could not get passenger: ${error.message}`);
        }
    }

    /**
     * Deletes a passenger record if they have no associated reservations.
     * @param {string} id - The UUID of the passenger to delete.
     * @returns {Promise<{deleted: true}>} Success indicator.
     */
    async deletePassenger(id) {
        try {
            // Check for related reservations
            const reservationCheck = await db.query('SELECT 1 FROM reservations WHERE passenger_id = $1 LIMIT 1', [id]);
            if (reservationCheck.rows.length > 0) {
                throw new Error('Cannot delete: passenger has existing reservations');
            }
            await db.query('DELETE FROM passengers WHERE id = $1', [id]);
            return { deleted: true };
        } catch (error) {
            console.error('❌ Error deleting passenger:', error.message);
            throw new Error(`Could not delete passenger: ${error.message}`);
        }
    }

    /**
     * Searches for passenger records based on provided filters.
     * @param {Object} filters - Optional filters (email, firstName, lastName, identityNumber, phoneNumber).
     * @returns {Promise<Array<Object>>} An array of matching passenger records.
     */
    async searchPassengers(filters = {}) {
        const { email, firstName, lastName, identityNumber, phoneNumber } = filters;
        const queryParts = [];
        const values = [];
        let paramIndex = 1;

        if (email) {
            queryParts.push(`email ILIKE $${paramIndex++}`);
            values.push(`%${email}%`);
        }
        if (firstName) {
            queryParts.push(`first_name ILIKE $${paramIndex++}`);
            values.push(`%${firstName}%`);
        }
        if (lastName) {
            queryParts.push(`last_name ILIKE $${paramIndex++}`);
            values.push(`%${lastName}%`);
        }
        if (identityNumber) {
            queryParts.push(`identity_number ILIKE $${paramIndex++}`);
            values.push(`%${identityNumber}%`);
        }
        if (phoneNumber) {
            queryParts.push(`phone_number ILIKE $${paramIndex++}`);
            values.push(`%${phoneNumber}%`);
        }

        const whereClause = queryParts.length > 0 ? `WHERE ${queryParts.join(' AND ')}` : '';
        const query = `SELECT * FROM passengers ${whereClause}`;

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('❌ Error searching passengers:', error.message);
            throw new Error(`Could not search passengers: ${error.message}`);
        }
    }

    /**
     * Confirms the link between a passenger and a user based on matching UUIDs for registered users.
     * Assumes V2 schema uses the same UUID for users.id and passengers.id when linked.
     * @param {string} passengerId - The UUID of the passenger.
     * @param {string} userId - The UUID of the user.
     * @returns {Promise<{linked: true, passengerId: string, userId: string}>} Success indicator if linked.
     * @throws {Error} If the link cannot be confirmed.
     */
    async linkPassengerToUser(passengerId, userId) {
        if (passengerId !== userId) {
            throw new Error('Passenger ID and User ID must match for a registered account link.');
        }

        const passenger = await this.getPassengerById(passengerId);
        if (!passenger) {
            throw new Error('Passenger not found.');
        }

        const userResult = await db.query('SELECT id, password_hash FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user) {
            throw new Error('User not found.');
        }

        if (!user.password_hash) {
             throw new Error('User is not a registered account (no password hash).');
        }

        // If we reach here, it means the passenger exists, a user with the same ID exists,
        // and that user has a password hash, confirming they are linked as a registered user.
        return { linked: true, passengerId, userId };
    }
}

module.exports = new PassengerService();