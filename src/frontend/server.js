const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

// Use the cors middleware
const corsMiddleware = cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
    allowedHeaders: '*', 
    credentials: true, 
});

app.prepare().then(() => {
    createServer((req, res) => {
        // Run the cors middleware
        corsMiddleware(req, res, () => {
            if (req.method === 'OPTIONS') {
                // Handle the preflight request
                res.writeHead(200);
                res.end();
                return;
            }

            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        });
    }).listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});