import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import './Users.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editForm, setEditForm] = useState({ nombre: '', apellido: '', email: '', username: '' });
    const [saving, setSaving] = useState(false);
    const [createForm, setCreateForm] = useState({ nombre: '', apellido: '', email: '', username: '', password: '' });
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        setDeleting(id);
        try {
            await userService.deleteUser(id);
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            alert(error.message);
        } finally {
            setDeleting(null);
        }
    };

    const openEditModal = (user) => {
        console.log('Abriendo modal para:', user);
        setEditUser(user);
        setEditForm({
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            username: user.username || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditUser(null);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await userService.updateUser(editUser._id, editForm);
            setUsers(users.map(u => u._id === updated._id ? updated : u));
            closeModal();
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const newUser = await userService.createUser(createForm);
            setUsers([...users, newUser]);
            setCreateForm({ nombre: '', apellido: '', email: '', username: '', password: '' });
            alert('Usuario creado exitosamente');
        } catch (error) {
            alert(error.message);
        } finally {
            setCreating(false);
        }
    };

    console.log('showModal:', showModal, 'editUser:', editUser);

    if (loading) {
        return <div className="users-container">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="users-container error">{error}</div>;
    }

    return (
        <div className="users-container">
            <h1>Usuarios Conectados</h1>
            
            <button 
                className="create-user-button"
                onClick={() => setShowCreateForm(!showCreateForm)}
            >
                {showCreateForm ? 'Ocultar formulario' : 'Crear nuevo usuario'}
            </button>

            {showCreateForm && (
                <form onSubmit={handleCreateSubmit} className="create-user-form">
                    <h2>Crear nuevo usuario</h2>
                    <input name="nombre" value={createForm.nombre} onChange={handleCreateChange} placeholder="Nombre" required />
                    <input name="apellido" value={createForm.apellido} onChange={handleCreateChange} placeholder="Apellido" required />
                    <input name="email" value={createForm.email} onChange={handleCreateChange} placeholder="Email" required type="email" />
                    <input name="username" value={createForm.username} onChange={handleCreateChange} placeholder="Usuario" required />
                    <input name="password" value={createForm.password} onChange={handleCreateChange} placeholder="Contraseña" required type="password" />
                    <button type="submit" disabled={creating}>{creating ? 'Creando...' : 'Crear usuario'}</button>
                </form>
            )}

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.nombre}</td>
                                <td>{user.apellido}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-badge ${user.username === currentUser?.username ? 'online' : 'offline'}`}>
                                        {user.username === currentUser?.username ? 'Conectado' : 'Desconectado'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => {
                                            console.log('Click en editar', user);
                                            openEditModal(user);
                                        }}
                                        className="btn-edit-user"
                                    >
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(user._id)} className="btn-delete-user" disabled={deleting === user._id}>
                                        {deleting === user._id ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                isOpen={showModal}
                onRequestClose={closeModal}
                contentLabel="Editar Usuario"
                className="modal"
                overlayClassName="modal-overlay"
                ariaHideApp={false}
            >
                {editUser ? (
                    <>
                        <h2>Editar Usuario</h2>
                        <form onSubmit={handleEditSubmit} className="edit-user-form">
                            <input name="nombre" value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" required />
                            <input name="apellido" value={editForm.apellido} onChange={handleEditChange} placeholder="Apellido" required />
                            <input name="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" required type="email" />
                            <input name="username" value={editForm.username} onChange={handleEditChange} placeholder="Usuario" required />
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancelar</button>
                                <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <p>Cargando datos del usuario...</p>
                )}
            </Modal>
        </div>
    );
}

export default Users;