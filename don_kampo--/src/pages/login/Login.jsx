import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomFooter from '../../components/footer/Footer';
import './Login.css';
import Navbar from '../../components/navbar/Navbar';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, user_password } = values;

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/login', // Solo la ruta relativa
        { email, user_password },
        { withCredentials: true }
      );

      // Guardar toda la respuesta de la API en localStorage
      localStorage.setItem('loginData', JSON.stringify(response.data));

      // Mensaje de éxito y redirección
      message.success(response.data.message);
      navigate('/');
    } catch (error) {
      message.error('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info('Redirigiendo a recuperación de contraseña...');
    navigate('/forgot-password'); // Cambia a la ruta adecuada
  };

  return (
    <>
    <Navbar />
    <div className="login-container">
      <h2>Inicio de Sesión</h2>
      <Form
        name="login_form"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Correo Electrónico"
          name="email"
          rules={[{ required: true, message: 'Por favor ingresa tu correo electrónico' }]}
        >
          <Input type="email" placeholder="Correo Electrónico" />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="user_password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Iniciar Sesión
          </Button>
        </Form.Item>
        <div
          className="forgot-password"
          onClick={handleForgotPassword}
        >
          Olvidé mi contraseña
        </div>
      </Form>
    </div>
    <CustomFooter />
    </>
  );
};

export default Login;
