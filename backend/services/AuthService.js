// backend/services/AuthService.js
const db = require('../config/db'); // Assuming db connection is configured
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating UUIDs
const PassengerService = require('./PassengerService'); // Needs to be created

class AuthService {

    async registerPassenger({ email, password, firstName, lastName, phoneNumber, address, city, state, zipcode, country }) {
        // Logic đăng ký passenger
        // 1. Validate input
        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            throw new Error('Missing required passenger registration fields');
        }
        if (!process.env.JWT_SECRET) {
             throw new Error('JWT_SECRET is not defined');
        }


        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 2. Check if email exists in users table
            const existingUser = await client.query('SELECT id, password_hash FROM users WHERE email = $1 FOR UPDATE', [email]);

            if (existingUser.rows.length > 0) {
                if (existingUser.rows[0].password_hash) {
                     throw new Error('Email already registered.');
                } else { // email exists but password_hash is null
                    // Handle linking account scenario if needed, or disallow registration with existing email
                    throw new Error('Email already exists in our records but is not linked to a user account. Please contact support.');
                }
            }

            // 3. Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 4. Generate UUID for user and passenger (assuming 1-1 relationship and same ID)
             const userId = crypto.randomUUID();

            // 5. Insert into users table
            const userInsertQuery = `
                 INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW())
                 RETURNING id, email, role;
             `;
            const userResult = await client.query(userInsertQuery, [userId, email, passwordHash, 'passenger']);
            const newUser = userResult.rows[0];

            // 6. Insert into passengers table (using the same UUID)
            // This assumes passenger table has columns matching input data
            const passengerInsertQuery = `
                 INSERT INTO passengers (id, first_name, last_name, email, phone_number, address, city, state, zipcode, country)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id, first_name, last_name, email;
             `;
            const passengerResult = await client.query(passengerInsertQuery, [
                 userId, // Use the same UUID as user_id
                 firstName,
                 lastName,
                 email,
                 phoneNumber,
                 address,
                 city,
                 state,
                 zipcode,
                 country
            ]);
            const newPassengerInfo = passengerResult.rows[0];


            // 7. Create JWT token
            const token = jwt.sign(
                 { id: newUser.id, role: newUser.role },
                 process.env.JWT_SECRET,
                 { expiresIn: '24h' } // Configurable
            );

            await client.query('COMMIT');

            return {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    // Include relevant passenger info
                    firstName: newPassengerInfo.first_name,
                    lastName: newPassengerInfo.last_name
                }
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error during passenger registration:', error.message);
            throw new Error(`Registration failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async registerAdmin({ email, password }) {
        // Logic đăng ký admin
        // 1. Validate input
        if (!email || !password) {
            throw new Error('Email and password are required for admin registration.');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 2. Check if email exists
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1 FOR UPDATE', [email]);

            if (existingUser.rows.length > 0) {
                throw new Error('Email already exists.');
            }

            // 3. Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 4. Generate UUID
            const userId = crypto.randomUUID();

            // 5. Insert into users table with role 'admin'
            const userInsertQuery = `
                INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING id, email, role;
            `;
            const userResult = await client.query(userInsertQuery, [userId, email, passwordHash, 'admin']);
            const newUser = userResult.rows[0];

            await client.query('COMMIT');
            return newUser; // Return created user record (excluding password_hash)
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error during admin registration:', error.message);
            throw new Error(`Admin registration failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async login(email, password) {
        // Logic đăng nhập (cho cả passenger và admin)
        if (!email || !password) {
             throw new Error('Email and password are required');
        }
        if (!process.env.JWT_SECRET) {
             throw new Error('JWT_SECRET is not defined');
        }

        const client = await db.connect();
        try {
            // 1. Find user by email
            const userResult = await client.query(
                 'SELECT id, email, password_hash, role FROM users WHERE email = $1',
                 [email]
            );

            if (userResult.rows.length === 0) {
                 throw new Error('Invalid credentials'); // Avoid revealing if email exists
            }

            const user = userResult.rows[0];

            // 2. Check if user has a password (registered account)
            if (!user.password_hash) {
                 throw new Error('Account not fully registered. Please complete registration or contact support.');
            }

            // 3. Compare password
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                 throw new Error('Invalid credentials');
            }

            // 4. Create JWT token
            const token = jwt.sign(
                 { id: user.id, role: user.role },
                 process.env.JWT_SECRET,
                 { expiresIn: '24h' } // Configurable
            );

            // TODO: Implement refresh token logic if needed (insert into refresh_tokens table)

            // 5. Get additional info based on role (e.g., passenger details)
             let additionalInfo = {};
             if (user.role === 'passenger') {
                 const passengerResult = await client.query(
                     'SELECT first_name, last_name, email FROM passengers WHERE id = $1', // Assuming passenger id is same as user id
                     [user.id]
                 );
                if (passengerResult.rows.length > 0) {
                     additionalInfo = {
                         firstName: passengerResult.rows[0].first_name,
                         lastName: passengerResult.rows[0].last_name,
                         passengerEmail: passengerResult.rows[0].email // Redundant but useful
                     };
                 }
             }
             // Add similar logic for admin if needed

            await client.query('COMMIT'); // Transaction for login might not be strictly necessary unless adding refresh token

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    ...additionalInfo // Include passenger/admin info
                }
            };

        } catch (error) {
             await client.query('ROLLBACK'); // Rollback if transaction was started
             console.error('❌ Error during login:', error.message);
             throw new Error(`Login failed: ${error.message}`);
        } finally {
             // Ensure client is released even if commit/rollback failed
             if (client && client.release) client.release();
        }
    }
    async logout(userId) {
        // Basic logout: delete refresh token from DB
        if (!userId) {
            throw new Error('User ID is required for logout.');
        }
        try {
            // Delete refresh tokens associated with the user
            await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
             // Note: Client is responsible for discarding the access token
            return { success: true };
        } catch (error) {
            console.error('❌ Error during logout:', error.message);
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is required.');
        }
         if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
              throw new Error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined');
         }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Find and validate refresh token in DB
            const tokenResult = await client.query(
                 'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1 FOR UPDATE',
                 [refreshToken]
            );

            if (tokenResult.rows.length === 0) {
                 throw new Error('Invalid refresh token.');
            }

            const storedToken = tokenResult.rows[0];
            if (new Date() > new Date(storedToken.expires_at)) {
                // Delete expired token
                await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
                 throw new Error('Refresh token expired.');
            }

            // 2. Get user information
            const userResult = await client.query(
                 'SELECT id, role FROM users WHERE id = $1',
                 [storedToken.user_id]
            );

             if (userResult.rows.length === 0) {
                  // Should not happen if DB integrity is maintained
                  await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]); // Clean up invalid token
                  throw new Error('User not found for refresh token.');
             }
             const user = userResult.rows[0];

            // 3. Generate new tokens
            const newAccessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Shorter expiry for access token
            const newRefreshToken = crypto.randomUUID(); // Generate a new UUID for refresh token
            const newRefreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // e.g., 7 days

            // 4. Update refresh token in DB (delete old, insert new)
             await client.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]); // Delete old token
             await client.query(
                 'INSERT INTO refresh_tokens (token, user_id, expires_at, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
                 [newRefreshToken, user.id, newRefreshTokenExpiry]
             );

            await client.query('COMMIT');

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error refreshing token:', error.message);
            throw new Error(`Token refresh failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        if (!userId || !currentPassword || !newPassword) {
            throw new Error('User ID, current password, and new password are required.');
        }
        if (newPassword.length < 6) { // Basic validation
            throw new Error('New password must be at least 6 characters long.');
        }

         const saltRounds = 10; // Define salt rounds here for hashing new password
        const client = await db.connect();
        try {
            await client.query('BEGIN'); // Use transaction for update

            // 1. Find user by ID and get their current password hash
            const userResult = await client.query(
                'SELECT id, password_hash FROM users WHERE id = $1 FOR UPDATE', // Lock row
                [userId]
            );

            if (userResult.rows.length === 0 || !userResult.rows[0].password_hash) {
                 throw new Error('User not found or account not fully registered.');
             }

            const user = userResult.rows[0];

            // 2. Compare current password
            const match = await bcrypt.compare(currentPassword, user.password_hash);
            if (!match) {
                throw new Error('Invalid current password.');
            }

            // 3. Hash new password and update
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId]);

            await client.query('COMMIT');
            return { success: true, message: 'Password changed successfully.' };

        } catch (error) {
             await client.query('ROLLBACK');
             console.error('❌ Error resetting password:', error.message);
             throw new Error(`Password reset failed: ${error.message}`);
        } finally {
             client.release();
        }
    }

}

module.exports = new AuthService();