// src/server.js
const express = require('express');
const openaiRoutes = require('./routes/openaiRoutes');
const supabaseRoutes = require('./routes/supabaseRoutes');

const app = express();
app.use(express.json());

app.use('/api/openai', openaiRoutes);
app.use('/api/supabase', supabaseRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
