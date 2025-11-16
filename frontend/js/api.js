
/**
 * API Client para Backend Beristain & Asociados
 * Maneja toda la comunicación con el backend
 */

const API = {
    baseURL: 'https://beristainyasociados.com.ar/api',
    
    // Obtener token del localStorage
    getToken() {
        return localStorage.getItem('auth_token');
    },
    
    // Guardar token
    setToken(token) {
        localStorage.setItem('auth_token', token);
    },
    
    // Remover token
    removeToken() {
        localStorage.removeItem('auth_token');
    },
    
    // Guardar usuario
    setUser(user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
    },
    
    // Obtener usuario
    getUser() {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    },
    
    // Verificar si está autenticado
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Headers por defecto
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        return headers;
    },
    
    // Método genérico para hacer requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false)
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Si es error de autenticación, limpiar token
            if (error.message.includes('token') || error.message.includes('autenticación')) {
                this.removeToken();
                localStorage.removeItem('auth_user');
            }
            
            throw error;
        }
    },
    
    // AUTH ENDPOINTS
    auth: {
        async login(email, password) {
            const response = await API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                auth: false
            });
            
            if (response.success) {
                API.setToken(response.data.token);
                API.setUser(response.data.user);
            }
            
            return response;
        },
        
        async logout() {
            API.removeToken();
            localStorage.removeItem('auth_user');
            window.location.href = '/login.html';
        },
        
        async verifyToken() {
            try {
                const response = await API.request('/auth/verify');
                return response.success;
            } catch (error) {
                return false;
            }
        }
    },
    
    // PRESUPUESTOS ENDPOINTS
    presupuestos: {
        async listar(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `/presupuestos?${queryString}` : '/presupuestos';
            return await API.request(endpoint);
        },
        
        async obtener(id) {
            return await API.request(`/presupuestos/${id}`);
        },
        
        async crear(data) {
            return await API.request('/presupuestos', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        async actualizar(id, data) {
            return await API.request(`/presupuestos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        async eliminar(id) {
            return await API.request(`/presupuestos/${id}`, {
                method: 'DELETE'
            });
        },
        
        async estadisticas() {
            return await API.request('/presupuestos/estadisticas');
        }
    },
    
    // CAUSAS ENDPOINTS
    causas: {
        async listar(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `/causas?${queryString}` : '/causas';
            return await API.request(endpoint);
        },
        
        async obtener(id) {
            return await API.request(`/causas/${id}`);
        },
        
        async crear(data) {
            return await API.request('/causas', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        async actualizar(id, data) {
            return await API.request(`/causas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        async actualizarTareas(id, tareas) {
            return await API.request(`/causas/${id}/tareas`, {
                method: 'PATCH',
                body: JSON.stringify({ tareas })
            });
        },
        
        async eliminar(id) {
            return await API.request(`/causas/${id}`, {
                method: 'DELETE'
            });
        },
        
        async estadisticas() {
            return await API.request('/causas/estadisticas');
        }
    }
};

// Verificar autenticación en páginas protegidas
function requireAuth() {
    if (!API.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Mostrar información del usuario en el navbar
function displayUserInfo() {
    const user = API.getUser();
    if (user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.nombre;
        }
    }
}
