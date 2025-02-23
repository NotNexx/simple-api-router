const fs = require('fs');
const path = require('path');

class APILoader {
    constructor(apiDir) {
        this.apiDir = apiDir;
    }

    loadRoutes(app) {
        this._loadDirectory(this.apiDir, app, '');
    }

    _loadDirectory(directory, app, baseRoute) {
        fs.readdirSync(directory).forEach(file => {
            const fullPath = path.join(directory, file);
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;
            
            if (fs.statSync(fullPath).isDirectory()) {
                this._loadDirectory(fullPath, app, routePath);
            } else if (file.endsWith('.js')) {
                const route = require(fullPath);
                app.use(routePath, route);
            }
        });
    }
}

module.exports = APILoader;