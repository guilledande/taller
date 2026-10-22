class ApiService {
  static async request(endpoint, options = {}) {
    if (CONFIG.USE_MOCK) {
      if (endpoint.includes('/auth/login')) {
        return MockApiService.authenticate(options.body.username, options.body.password);
      }

      const method = options.method || 'GET';
      const cleanEndpoint = endpoint.split('?')[0];

      if (method === 'GET') {
        return MockApiService.getData(cleanEndpoint);
      }
      if (method === 'POST') {
        return MockApiService.createItem(cleanEndpoint, options.body);
      }
      if (method === 'PUT') {
        const parts = cleanEndpoint.split('/');
        const id = parts.pop();
        const resource = parts.join('/');
        return MockApiService.updateItem(resource, id, options.body);
      }
      if (method === 'DELETE') {
        const parts = cleanEndpoint.split('/');
        const id = parts.pop();
        const resource = parts.join('/');
        return MockApiService.deleteItem(resource, id);
      }

      return {};
    } else {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const fetchOptions = {
        ...options,
        headers
      };
      if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.reload();
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Ocurrió un error en el servidor.');
      }
      return response.json();
    }
  }
}