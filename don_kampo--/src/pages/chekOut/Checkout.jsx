import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Divider, Checkbox } from 'antd';
import axios from 'axios';
import Navbar from '../../components/navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../products/CartContext';
import './Checkout.css';

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const { cart } = useCart();
  const navigate = useNavigate();
  const shippingCost = 5000;

  useEffect(() => {
    const fetchUserData = async () => {
      const loginData = JSON.parse(localStorage.getItem('loginData'));
      if (loginData && loginData.user) {
        try {
          const response = await axios.get(`/api/users/${loginData.user.id}`);
          setUserData(response.data);
        } catch (error) {
          message.error('Error al cargar los datos del usuario.');
          console.error(error);
        }
      } else {
        message.error('Debe iniciar sesión para realizar la compra.');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (productId) => {
            const response = await axios.get(`/api/getproduct/${productId}`);
            return { ...response.data, quantity: cart[productId].quantity };
          })
        );
        setCartDetails(productDetails);
      } catch (error) {
        message.error('Error al cargar los detalles del carrito.');
        console.error(error);
      }
    };

    fetchCartDetails();
  }, [cart, setCartDetails]);

  const calculateSubtotal = () => {
    return (cartDetails || []).reduce((total, product) => total + (product.price || 0) * product.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateUser = async () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    if (loginData && loginData.user) {
      try {
        await axios.put(`/api/updateusers/${loginData.user.id}`, userData);
        message.success('Datos actualizados exitosamente.');
        navigate('/confirmation');
      } catch (error) {
        message.error('Error al actualizar los datos del usuario.');
        console.error(error);
      }
    }
  };

  const total = calculateSubtotal() + shippingCost;

  return (
    <div>
      <Navbar />
      <div className="checkout-container">
        <h2>Finalizar Compra</h2>
        <div className="checkout-content">
          {userData ? (
            <Form layout="vertical" className="checkout-form">
              <Form.Item label="Nombre">
                <Input name="user_name" value={userData.user_name} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Apellido">
                <Input name="lastname" value={userData.lastname} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Email">
                <Input name="email" value={userData.email} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Teléfono">
                <Input name="phone" value={userData.phone} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Ciudad">
                <Input name="city" value={userData.city} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Dirección">
                <Input name="address" value={userData.address} onChange={handleInputChange} />
              </Form.Item>
              <Form.Item label="Barrio">
                <Input name="neighborhood" value={userData.neighborhood} onChange={handleInputChange} />
              </Form.Item>
              <Button type="primary" className="confirm-order-button" onClick={handleUpdateUser}>
                Actualizar Datos y Confirmar Compra
              </Button>
            </Form>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <Divider />
            {cartDetails.map((product) => (
              <div key={product.id} className="order-summary-item">
                <span>{product.name} x {product.quantity}</span>
                <span>${(product.price * product.quantity).toLocaleString()}</span>
              </div>
            ))}
            <Divider />
            <p>Subtotal: <span>${calculateSubtotal().toLocaleString()}</span></p>
            <p>Envío: <span>${shippingCost.toLocaleString()}</span></p>
            <Divider />
            <h4>Total: <span>${total.toLocaleString()}</span></h4>
            <Checkbox>
              He leído y estoy de acuerdo con los términos y condiciones
            </Checkbox>
            <Button type="primary" className="place-order-button">REALIZAR EL PEDIDO</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
