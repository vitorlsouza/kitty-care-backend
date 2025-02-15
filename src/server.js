// src/server.js
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

// keep only the authRoutes to avoid errors
// const openaiRoutes = require("./routes/openaiRoutes");
// const supabaseRoutes = require("./routes/supabaseRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const { CLIENT_URL, SESSION_SECRET } = require("./config/config");
require("./config/passport");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// keep only the authRoutes to avoid errors
// app.use("/api/openai", openaiRoutes);
// app.use("/api/supabase", supabaseRoutes);
// app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is up and running! 😸");
});

app.get('/', (req, res) => {
    res.send('Server is up and running! 😸');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
