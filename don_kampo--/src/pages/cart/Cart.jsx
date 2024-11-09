import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import { useCart } from '../products/CartContext';
import { Card, Button, message, Divider, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, addToCart } = useCart();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const shippingCost = 5000; // Envío fijo

  useEffect(() => {
    const fetchCartDetails = async () => {
      setLoading(true);
      try {
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (productId) => {
            try {
              const response = await axios.get(`/api/getproduct/${productId}`);
              return { ...response.data, quantity: cart[productId].quantity };
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.warn(`Producto con ID ${productId} no encontrado.`);
                return null;
              } else {
                throw error;
              }
            }
          })
        );
        setCartDetails(productDetails.filter((item) => item !== null));
      } catch (error) {
        message.error('Error al cargar los detalles del carrito.');
        console.error('Error al obtener detalles del carrito:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cart]);

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const calculateSubtotal = () => {
    return cartDetails.reduce((total, product) => total + (product.price || 0) * product.quantity, 0);
  };

  const total = calculateSubtotal() + shippingCost;

  const handleCheckout = () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    if (loginData && loginData.user) {
      // Si el usuario está autenticado, redirige a la página de confirmación de compra
      navigate('/confirmacion-compra');
    } else {
      // Si no está autenticado, muestra el modal
      setIsModalVisible(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleContinueHopping = () => {
    navigate('/products');
  }


  return (
    <>
      <Navbar />
      <div className="cart-container">
        <h2 className="cart-title">Resumen del Carrito</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : cartDetails.length === 0 ? (
          <p className="empty-cart-message">El carrito está vacío.</p>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartDetails.map((product) => (
                <Card key={product.id} className="cart-item">
                  <div className="cart-item-layout">
                    <img src={'path_to_image_placeholder'} alt={product.name} className="cart-item-image" />
                    
                    <div className="cart-item-details">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">Precio: ${product.price}</p>
                    </div>

                    <div className="cart-item-quantity">
                      <Button onClick={() => handleRemoveFromCart(product)}>-</Button>
                      <span>{product.quantity}</span>
                      <Button onClick={() => handleAddToCart(product)}>+</Button>
                    </div>

                    <div className="cart-item-subtotal">
                      <p>Subtotal: ${product.price * product.quantity}</p>
                    </div>
                  </div>
                </Card>
              ))}
              <Button   className="continue-shopping-button" onClick={handleContinueHopping}>← Seguir Comprando</Button>
            </div>
            <div className="cart-summary">
              <h3>Total del Carrito</h3>
              <Divider />
              <p>Subtotal: <span>${calculateSubtotal().toLocaleString()}</span></p>
              <p>Envío: <span>${shippingCost.toLocaleString()}</span></p>
              <Divider />
              <p><strong>Total: <span>${total.toLocaleString()}</span></strong></p>
              <Button className="checkout-button" onClick={handleCheckout}>Finalizar Compra</Button>
            </div>
          </div>
        )}
        <Modal
          title="Inicia Sesión o Regístrate"
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
        >
          <p>Para finalizar tu compra, necesitas iniciar sesión o registrarte.</p>
          <div className="modal-buttons">
            <Button type="primary" onClick={handleLogin}>Iniciar Sesión</Button>
            <Button onClick={handleRegister} className='registro_modal'>Registrarse</Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Cart;
