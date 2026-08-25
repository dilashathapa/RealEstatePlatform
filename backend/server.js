import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import agentRouter from './routes/agent.routes.js';
import { uploadSingle } from './middlewares/upload.middleware.js';
import { protect } from './middlewares/auth.middleware.js';
import buyerRouter from './routes/buyer.routes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// DB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use('/api/agent', agentRouter);
app.use("/api/buyer", buyerRouter);

// Health Check
app.get("/", (req, res) => {
    res.send("API WORKING");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});
// Test image upload endpoint
app.post('/api/test-upload', uploadSingle, (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        file: req.file
    });
});
// Test endpoint for agent route
app.get('/api/test-agent-route', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Agent route is accessible',
        user: {
            id: req.user.id,
            role: req.user.role,
            name: req.user.name
        }
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
    console.log(`✅ Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`✅ Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`✅ Agent API: http://localhost:${PORT}/api/agent`);
    console.log(`✅ Buyer API: http://localhost:${PORT}/api/buyer`);
});
