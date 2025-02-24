# Simple API Router

## Overview
**Simple API Router** is a lightweight npm package that simplifies setting up Express APIs. It automatically detects all API routes in a defined directory and binds them to an Express app. Additionally, it provides an API client generator for frontend integration and automatic API documentation generation.

## Installation

To install the package in an existing project, use the following command:

```bash
npm install @notnexx/n-sar
```

## Usage

### 1. Manual Setup

Create an Express app and use `@notnexx/n-sar` to automatically load all routes from the `api/` directory:

```javascript
const express = require('express');
const loadRoutes = require('@notnexx/n-sar');

const app = express();
const PORT = 3000;

app.use(express.json());
loadRoutes(app);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

### 2. Automatically Generate a Sample Project

The package allows easy creation of a sample project with a predefined structure:

```bash
npx n-sar create my-api-project
```

This creates a new folder `my-api-project` with the following structure:

```
my-api-project/
├── api/
│   ├── router.js
│   └── user.js
├── package.json
└── server.js
```

Then, start the project:

```bash
cd my-api-project
npm install
node server.js
```

### 3. Generate an API Client for Frontend Integration

With `n-sar`, you can automatically generate a frontend API client that connects to your backend (localhost or your server domain/IP):

```bash
npx n-sar export-routes http://localhost:3000
```

This creates an `apiClient.js` file with functions for each detected route, making API calls simple:

```javascript
import APIClient from './apiClient';

APIClient.user_get().then(response => console.log(response));
```

### 4. Generate API Documentation

You can automatically generate API documentation based on your routes:

```bash
npx n-sar generate-docs
```

This will create an `API_DOCS.md` file containing all detected API endpoints and their methods.

## API Definitions

The package expects API files to be located in the `api/` directory. Each file corresponds to a route. Example:

### `api/user.js`

```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'User endpoint' });
});

module.exports = router;
```

This automatically creates the route:
```
GET /user
```

## License
This package is licensed under the **MIT License**.

## Author
Created by NotNexx.

