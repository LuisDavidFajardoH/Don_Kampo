import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import { useCart } from "../products/CartContext";
import { Card, Button, message, Divider, Modal } from "antd";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cart, removeFromCart, addToCart } = useCart();
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  const navigate = useNavigate();
  const [shippingCost, setShippingCost] = useState(5000);

  // Obtener el tipo de usuario desde localStorage
  const userType = JSON.parse(localStorage.getItem("loginData"))?.user
    ?.user_type;

  useEffect(() => {
    const fetchCartDetails = async () => {
      setLoading(true);

      try {
        // Cargar detalles de productos en el carrito
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (product_id) => {
            try {
              const response = await axios.get(`https://don-kampo-api.onrender.com/api/getproduct/${product_id}`);
              return {
                ...response.data,
                quantity: cart[product_id].quantity,
              };
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.warn(`Producto con ID ${product_id} no encontrado.`);
                return null;
              } else {
                throw error;
              }
            }
          })
        );
        setCartDetails(productDetails.filter((item) => item !== null));

        // Verificar si el usuario está autenticado para aplicar descuento
        const loginData = JSON.parse(localStorage.getItem("loginData"));
        if (loginData && loginData.user) {
          const userResponse = await axios.get(
            `https://don-kampo-api.onrender.com/api/users/${loginData.user.id}`
          );
          const hasOrders =
            userResponse.data.orders && userResponse.data.orders.length > 0;
          setIsFirstOrder(!hasOrders);

          // Aplica el descuento de envío si es la primera orden
          if (!hasOrders) {
            if (userType === "hogar") {
              setShippingCost(2500); // 50% de descuento en el envío para "hogar"
            } else {
              setShippingCost(0); // Envío gratis para otros tipos de usuario en la primera orden
            }
          }
        }
      } catch (error) {
        message.error("Error al cargar los detalles del carrito.");
        console.error("Error al obtener detalles del carrito:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cart]);

  // Función para obtener el precio según el tipo de usuario
  const getPriceByUserType = (product) => {
    switch (userType) {
      case "hogar":
        return parseFloat(product.price_home) || 0;
      case "supermercado":
        return parseFloat(product.price_supermarket) || 0;
      case "restaurante":
        return parseFloat(product.price_restaurant) || 0;
      case "fruver":
        return parseFloat(product.price_fruver) || 0;
      default:
        return parseFloat(product.price_home) || 0; // Valor por defecto
    }
  };

  // Función para convertir el buffer de imagen en una URL base64
  const getBase64Image = (photo) => {
    if (photo && photo.data) {
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(photo.data))
      );
      return `data:image/jpeg;base64,${base64String}`;
    }
    return "path_to_placeholder_image"; // Cambia este valor si tienes una imagen de placeholder
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const calculateSubtotal = () => {
    return cartDetails.reduce(
      (total, product) =>
        total + getPriceByUserType(product) * product.quantity,
      0
    );
  };

  const total = calculateSubtotal() + shippingCost;

  const handleCheckout = () => {
    const loginData = JSON.parse(localStorage.getItem("loginData"));
    if (loginData && loginData.user) {
      navigate("/checkout"); // Navega al componente Checkout si el usuario está autenticado
    } else {
      // Almacena la ruta actual antes de mostrar el modal
      localStorage.setItem("redirectTo", "/cart");
      setIsModalVisible(true); // Muestra el modal para iniciar sesión o registrarse
    }
  };
  
  const handleLogin = () => {
    // Guarda la ruta actual antes de redirigir
    localStorage.setItem("redirectTo", "/cart");
    navigate("/login");
  };
  
  const handleRegister = () => {
    // Guarda la ruta actual antes de redirigir
    localStorage.setItem("redirectTo", "/cart");
    navigate("/register");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false); // Cierra el modal al establecer el estado como falso
  };
  
  const handleContinueShopping = () => {
    navigate("/products"); // Redirige al usuario a la página de productos
  };
  
  

 

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
                <Card key={product.product_id} className="cart-item">
                  <div className="cart-item-layout">
                    <img
                      src={getBase64Image(product.photo)}
                      alt={product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">
                        Precio: ${getPriceByUserType(product).toLocaleString()}
                      </p>
                    </div>

                    <div className="cart-item-quantity">
                      <Button onClick={() => handleRemoveFromCart(product)}>
                        -
                      </Button>
                      <span>{product.quantity}</span>
                      <Button onClick={() => handleAddToCart(product)}>
                        +
                      </Button>
                    </div>

                    <div className="cart-item-subtotal">
                      <p>
                        Subtotal: $
                        {(
                          getPriceByUserType(product) * product.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                className="continue-shopping-button"
                onClick={handleContinueShopping}
              >
                ← Seguir Comprando
              </Button>
            </div>
            <div className="cart-summary">
              <h3>Total del Carrito</h3>
              <Divider />
              <p>
                Subtotal: <span>${calculateSubtotal().toLocaleString()}</span>
              </p>
              <p>
                Envío: <span>${shippingCost.toLocaleString()}</span>
              </p>
              {isFirstOrder && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#FF914D",
                    marginTop: "5px",
                  }}
                >
                  ¡Descuento aplicado al costo de envío por ser tu primer
                  pedido!
                </p>
              )}
              <Divider />
              <p>
                <strong>
                  Total: <span>${total.toLocaleString()}</span>
                </strong>
              </p>
              <Button className="checkout-button" onClick={handleCheckout}>
                Finalizar Compra
              </Button>
            </div>
          </div>
        )}
        <Modal
          title="Inicia Sesión o Regístrate"
          visible={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
        >
          <p>
            Para finalizar tu compra, necesitas iniciar sesión o registrarte.
          </p>
          <div className="modal-buttons">
            <Button type="primary" onClick={handleLogin}>
              Iniciar Sesión
            </Button>
            <Button onClick={handleRegister} className="registro_modal">
              Registrarse
            </Button>
          </div>
        </Modal>
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Cart;
