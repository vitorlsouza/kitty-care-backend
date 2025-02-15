// src/config/config.js
require("dotenv").config();

module.exports = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    SESSION_SECRET: process.env.SESSION_SECRET || "",
    CLIENT_URL: process.env.CLIENT_URL || "",
    CALLBACK_URL: process.env.CALLBACK_URL || "",
};
