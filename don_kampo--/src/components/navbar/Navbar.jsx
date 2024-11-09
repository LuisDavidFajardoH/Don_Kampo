import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { HomeOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const loginData = JSON.parse(localStorage.getItem('loginData'));
  const isLoggedIn = Boolean(loginData && loginData.user);

  const handleLogout = () => {
    localStorage.removeItem('loginData'); // Elimina los datos de inicio de sesión
    navigate('/login'); // Redirige a la página de login
  };

  return (
    <Header className="navbar">
      <div className="logo" onClick={() => navigate('/home')}>
        Don Kampo
      </div>
      <Menu theme="light" mode="horizontal" defaultSelectedKeys={['home']} className="menu">
        <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
          Inicio
        </Menu.Item>
        <Menu.Item key="products" icon={<AppstoreOutlined />} onClick={() => navigate('/products')}>
          Productos
        </Menu.Item>

        {isLoggedIn ? (
          <>
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
              {loginData.user.user_name} {/* Muestra el nombre del usuario */}
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Cerrar Sesión
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="login" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Menu.Item>
            <Menu.Item key="register" onClick={() => navigate('/register')}>
              Registrarse
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
};

export default Navbar;
