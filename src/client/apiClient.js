class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const response = await fetch(
            `${this.baseURL}${endpoint}`, 
            { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }
        );
        return response.json();
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

module.exports = APIClient;