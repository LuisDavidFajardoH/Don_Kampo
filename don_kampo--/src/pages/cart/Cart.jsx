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
  const [shippingCost, setShippingCost] = useState(5000);

  const navigate = useNavigate();

  const userType = JSON.parse(localStorage.getItem("loginData"))?.user?.user_type;

  useEffect(() => {
    const fetchCartDetails = async () => {
      setLoading(true);

      try {
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (product_id) => {
            try {
              const response = await axios.get(`http://localhost:8080/api/getproduct/${product_id}`);
              return {
                ...response.data,
                quantity: cart[product_id].quantity,
                selectedVariation: cart[product_id].selectedVariation // Get selected variation
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

        const loginData = JSON.parse(localStorage.getItem("loginData"));
        if (loginData && loginData.user) {
          const userResponse = await axios.get(
            `http://localhost:8080/api/users/${loginData.user.id}`
          );
          const hasOrders = userResponse.data.orders && userResponse.data.orders.length > 0;
          setIsFirstOrder(!hasOrders);

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

  const getPriceByUserType = (product, selectedVariation) => {
    const { quality, quantity } = selectedVariation;
    if (!quality || !quantity) return 0;

    const selectedProductVariation = product.variations.find(
      (variation) => variation.quality === quality && variation.quantity === quantity
    );

    if (selectedProductVariation) {
      switch (userType) {
        case "hogar":
          return parseFloat(selectedProductVariation.price_home);
        case "supermercado":
          return parseFloat(selectedProductVariation.price_supermarket);
        case "restaurante":
          return parseFloat(selectedProductVariation.price_restaurant);
        case "fruver":
          return parseFloat(selectedProductVariation.price_fruver);
        default:
          return parseFloat(selectedProductVariation.price_home);
      }
    }

    return 0;
  };

  const getBase64Image = (photo) => {
    if (photo && photo.data) {
      const base64String = btoa(String.fromCharCode(...new Uint8Array(photo.data)));
      return `data:image/jpeg;base64,${base64String}`;
    }
    return "path_to_placeholder_image"; 
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
  };

  const handleAddToCart = (product, selectedVariation) => {
    addToCart(product, selectedVariation);
  };

  const calculateSubtotal = () => {
    return cartDetails.reduce(
      (total, product) =>
        total + getPriceByUserType(product, product.selectedVariation) * product.quantity,
      0
    );
  };

  const total = calculateSubtotal() + shippingCost;

  const handleCheckout = () => {
    const loginData = JSON.parse(localStorage.getItem("loginData"));
    if (loginData && loginData.user) {
      navigate("/checkout");
    } else {
      localStorage.setItem("redirectTo", "/cart");
      setIsModalVisible(true);
    }
  };

  const handleLogin = () => {
    localStorage.setItem("redirectTo", "/cart");
    navigate("/login");
  };

  const handleRegister = () => {
    localStorage.setItem("redirectTo", "/cart");
    navigate("/register");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleContinueShopping = () => {
    navigate("/products");
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
                        Precio: ${getPriceByUserType(product, product.selectedVariation).toLocaleString()}
                      </p>
                    </div>

                    <div className="cart-item-quantity">
                      <Button onClick={() => handleRemoveFromCart(product)}>-</Button>
                      <span>{product.quantity}</span>
                      <Button onClick={() => handleAddToCart(product, product.selectedVariation)}>+</Button>
                    </div>

                    <div className="cart-item-subtotal">
                      <p>
                        Subtotal: $
                        {(
                          getPriceByUserType(product, product.selectedVariation) * product.quantity
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
