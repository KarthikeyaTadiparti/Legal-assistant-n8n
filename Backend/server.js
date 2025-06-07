require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS with specific configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for file deletion
app.post('/delete-file', async (req, res) => {
    try {
        const { fileName } = req.body;
        
        // Forward the request to the n8n-demo endpoint for file deletion
        const response = await axios.post(
            process.env.N8N_FILE_DELETE_WEBHOOK,
            { fileName },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('File deletion webhook called:', process.env.N8N_FILE_DELETE_WEBHOOK);
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        
        // Send request to chat webhook
        const response = await axios.post(
            process.env.N8N_CHAT_WEBHOOK,
            {
                sessionId,
                message
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Chat webhook called:', process.env.N8N_CHAT_WEBHOOK);

        // Log the full response for debugging
        console.log('Full response from webhook:', JSON.stringify(response.data, null, 2));
        
        // Return the response as-is
        res.json(response.data);
    } catch (error) {
        console.error('Error in chat:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to get response from chat' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Not Found'
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`CORS allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection! Shutting down...');
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception! Shutting down...');
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = server;
