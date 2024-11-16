import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Divider, Row, Col } from "antd";
import { useCart } from "../products/CartContext";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const [shippingCost, setShippingCost] = useState(5000);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  const { cart, clearCart, getPriceByUserType } = useCart();
  const navigate = useNavigate();

  const loginData = JSON.parse(localStorage.getItem("loginData"));
  const userType = loginData?.user?.user_type;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!loginData?.user) {
        message.error("Debe iniciar sesión para realizar la compra.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `https://don-kampo-api.onrender.com/api/users/${loginData.user.id}`
        );
        setUserData(response.data.user);

        const hasOrders = response.data.orders?.length > 0;
        if (!hasOrders) {
          setIsFirstOrder(true);
          setShippingCost(userType === "hogar" ? 2500 : 0);
        }
      } catch (error) {
        message.error("Error al cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const productDetails = await Promise.all(
          Object.keys(cart).map(async (productId) => {
            const response = await axios.get(
              `https://don-kampo-api.onrender.com/api/getproduct/${productId}`
            );
            return { ...response.data, quantity: cart[productId].quantity };
          })
        );
        setCartDetails(productDetails);
      } catch (error) {
        message.error("Error al cargar los detalles del carrito.");
        console.error(error);
      }
    };

    fetchCartDetails();
  }, [cart]);

  const calculateSubtotal = () => {
    return cartDetails.reduce(
      (total, product) =>
        total +
        getPriceByUserType(product, product.selectedVariation) *
          product.quantity,
      0
    );
  };

  const handlePlaceOrder = () => {
    message.success("Pedido realizado con éxito.");
    clearCart();
    navigate("/products");
  };

  const total = calculateSubtotal() + shippingCost;

  return (
    <div>
      <Navbar />
      <div className="checkout-container">
        <h2>Finalizar Compra</h2>
        <div className="checkout-content">
          {userData ? (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form layout="vertical">
                  <Form.Item label="Nombre">
                    <Input value={userData.user_name} disabled />
                  </Form.Item>
                  <Form.Item label="Apellido">
                    <Input value={userData.lastname} disabled />
                  </Form.Item>
                  <Form.Item label="Email">
                    <Input value={userData.email} disabled />
                  </Form.Item>
                  <Form.Item label="Teléfono">
                    <Input value={userData.phone} disabled />
                  </Form.Item>
                </Form>
              </Col>
              <Col xs={24} sm={12}>
                <div className="order-summary">
                  <h3>Resumen del Pedido</h3>
                  <Divider />
                  {cartDetails.map((product) => (
                    <div
                      key={product.product_id}
                      className="order-summary-item"
                    >
                      <span>
                        {product.name} x {product.quantity}
                      </span>
                      <span>
                        $
                        {(
                          getPriceByUserType(product, product.selectedVariation) *
                          product.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Divider />
                  <p>
                    Subtotal: <span>${calculateSubtotal().toLocaleString()}</span>
                  </p>
                  <p>
                    Envío: <span>${shippingCost.toLocaleString()}</span>
                  </p>
                  {isFirstOrder && (
                    <p style={{ color: "#FF914D" }}>
                      ¡Descuento aplicado al costo de envío por ser tu primer
                      pedido!
                    </p>
                  )}
                  <Divider />
                  <h4>
                    Total: <span>${total.toLocaleString()}</span>
                  </h4>
                  <Button
                    type="primary"
                    onClick={handlePlaceOrder}
                    className="place-order-button"
                  >
                    REALIZAR EL PEDIDO
                  </Button>
                </div>
              </Col>
            </Row>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}
        </div>
      </div>
      <CustomFooter />
    </div>
  );
};

export default Checkout;
