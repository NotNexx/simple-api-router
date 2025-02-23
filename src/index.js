const express = require('express');
const APIRouter = require('./core/router');
const APILoader = require('./core/loader');

module.exports = function createServer({ apiDir, port = 3000 }) {
    const app = express();
    app.use(express.json());

    const apiRouter = new APIRouter(apiDir);
    apiRouter.registerRoutes(app);

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    return app;
};
