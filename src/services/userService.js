const API_URL = 'https://backendpuntodeventa-1.onrender.com/api';

export const userService = {
    async getUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener usuarios');
        }
        
        return data;
    },
    async deleteUser(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar usuario');
        }
        return data;
    },
    async updateUser(id, userData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar usuario');
        }
        return data;
    },
    async createUser(userData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al crear usuario');
        }
        return data;
    }
}; 