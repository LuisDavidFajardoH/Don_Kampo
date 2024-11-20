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
  const [shippingCost, setShippingCost] = useState(5000);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartDetails = async () => {
      setLoading(true);

      try {
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (product_id) => {
            try {
              const response = await axios.get(`/api/getproduct/${product_id}`);
              return {
                ...response.data,
                quantity: cart[product_id].quantity,
                selectedVariation: cart[product_id].selectedVariation || response.data.variations[0],
              };
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.warn(`Producto con ID ${product_id} no encontrado. Eliminándolo del carrito.`);
                removeFromCart({ product_id });
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
            `/api/users/${loginData.user.id}`
          );
          const hasOrders =
            userResponse.data.orders && userResponse.data.orders.length > 0;

          if (!hasOrders) {
            if (loginData.user.user_type === "hogar") {
              setShippingCost(2500);
            } else {
              setShippingCost(0);
            }
          }
        }
      } catch (error) {
        message.error("Error al cargar los detalles del carrito.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cart]);

  const getPriceByUserType = (product, selectedVariation) => {
    if (!selectedVariation || !product.variations) return 0;

    const { quality, quantity } = selectedVariation;
    const selectedProductVariation = product.variations.find(
      (variation) => variation.quality === quality && variation.quantity === quantity
    );

    if (selectedProductVariation) {
      switch (JSON.parse(localStorage.getItem("loginData"))?.user?.user_type) {
        case "hogar":
          return parseFloat(selectedProductVariation.price_home) || 0;
        case "supermercado":
          return parseFloat(selectedProductVariation.price_supermarket) || 0;
        case "restaurante":
          return parseFloat(selectedProductVariation.price_restaurant) || 0;
        case "fruver":
          return parseFloat(selectedProductVariation.price_fruver) || 0;
        default:
          return parseFloat(selectedProductVariation.price_home) || 0;
      }
    }

    return 0;
  };

  const calculateSubtotal = () => {
    return cartDetails.reduce(
      (total, product) =>
        total +
        getPriceByUserType(product, product.selectedVariation) * product.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (cartDetails.length > 0) {
      navigate("/checkout");
    } else {
      message.warning("No tienes productos en el carrito.");
    }
  };

  const handleAddToCart = (product, selectedVariation) => {
    addToCart(product, selectedVariation);
    setCartDetails((prevDetails) =>
      prevDetails.map((item) =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
    setCartDetails((prevDetails) =>
      prevDetails
        .map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = calculateSubtotal() + shippingCost;

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
                    <div className="cart-item-details">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-category">{product.category}</p>
                      <p className="product-variation">
                        Variación: {product.selectedVariation.quality} - {product.selectedVariation.quantity}
                      </p>
                      <p className="product-price">
                        Precio: $
                        {getPriceByUserType(product, product.selectedVariation).toLocaleString()}
                      </p>
                    </div>
                    <div className="cart-item-quantity">
                      <Button onClick={() => handleRemoveFromCart(product)}>-</Button>
                      <span>{product.quantity}</span>
                      <Button onClick={() => handleAddToCart(product, product.selectedVariation)}>+</Button>
                    </div>
                  </div>
                  <p>
                    Subtotal: $
                    {(
                      getPriceByUserType(product, product.selectedVariation) * product.quantity
                    ).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Total del Carrito</h3>
              <Divider />
              <p>Subtotal: ${calculateSubtotal().toLocaleString()}</p>
              <p>Envío: ${shippingCost.toLocaleString()}</p>
              <p>
                <strong>Total: ${total.toLocaleString()}</strong>
              </p>
              <Button
                type="primary"
                className="checkout-button"
                onClick={handleCheckout}
              >
                Finalizar Compra
              </Button>
            </div>
          </div>
        )}
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Cart;