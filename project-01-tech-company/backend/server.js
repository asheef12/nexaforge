require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const session = require("express-session");

const app = express();

const PORT = 3000;

// ================================
// MIDDLEWARE
// ================================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.set("trust proxy", 1);

app.use(session({

    secret: "NexaForge-Admin-Secret-2026",

    resave: false,

    saveUninitialized: false,

    cookie: {

        httpOnly: true,

        secure: true,

        sameSite: "none",

        maxAge: 1000 * 60 * 60

    }

}));

// ================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ================================

function requireAdmin(req, res, next) {

    if (req.session.isAdmin) {
        next();
        return;
    }

    res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
    });
}

// ================================
// MYSQL DATABASE CONNECTION
// ================================

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE
});


// ================================
// TEST ROUTE
// ================================

app.get("/", (req, res) => {
    res.send("NexaForge backend is running!");
});


// ================================
// CONTACT FORM API
// ================================

app.post("/api/contact", async (req, res) => {

    const { name, email, subject, message } = req.body;

    try {

        const sql = `
            INSERT INTO contact_messages
            (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `;

        await db.execute(sql, [
            name,
            email,
            subject,
            message
        ]);

        console.log("New contact form submission:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Subject:", subject);
        console.log("Message:", message);

        res.json({
            success: true,
            message: "Message saved successfully!"
        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save message."
        });
    }
});


// ================================
// START SERVER
// ================================

// ================================
// ADMIN - GET ALL CONTACT MESSAGES
// ================================

app.get("/api/messages", requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id, name, email, subject, message, created_at
            FROM contact_messages
            ORDER BY created_at DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load messages."
        });
    }
});

// ================================
// ADMIN - DELETE CONTACT MESSAGE
// ================================

app.delete("/api/messages/:id", requireAdmin, async (req, res) => {

    const { id } = req.params;

    try {

        await db.execute(
            "DELETE FROM contact_messages WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Message deleted successfully!"
        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete message."
        });
    }
});

// ================================
// ADMIN LOGIN
// ================================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    console.log("LOGIN DEBUG:", {
        receivedUsername: username,
        receivedPasswordLength: password ? password.length : 0,
        expectedUsername: process.env.ADMIN_USERNAME,
        expectedPasswordLength: process.env.ADMIN_PASSWORD
            ? process.env.ADMIN_PASSWORD.length
            : 0
    });

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {

        req.session.isAdmin = true;

        res.json({
            success: true,
            message: "Login successful"
        });

    } else {

        res.status(401).json({
            success: false,
            message: "Invalid username or password."
        });
    }
});

// ================================
// ADMIN LOGOUT
// ================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to logout."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});