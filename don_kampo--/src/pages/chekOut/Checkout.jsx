import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Divider, Modal, Row, Col } from "antd";
import Confetti from "react-confetti";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { useCart } from "../products/CartContext";
import "./Checkout.css";

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { cart } = useCart();
  const navigate = useNavigate();
  const shippingCost = 5000;

  useEffect(() => {
    const fetchUserData = async () => {
      const loginData = JSON.parse(localStorage.getItem("loginData"));
      if (loginData && loginData.user) {
        try {
          const response = await axios.get(`/api/users/${loginData.user.id}`);
          setUserData(response.data);
        } catch (error) {
          message.error("Error al cargar los datos del usuario.");
          console.error(error);
        }
      } else {
        message.error("Debe iniciar sesión para realizar la compra.");
        navigate("/login");
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
        message.error("Error al cargar los detalles del carrito.");
        console.error(error);
      }
    };

    fetchCartDetails();
  }, [cart, setCartDetails]);

  const calculateSubtotal = () => {
    return (cartDetails || []).reduce(
      (total, product) => total + (product.price || 0) * product.quantity,
      0
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateUser = async () => {
    const loginData = JSON.parse(localStorage.getItem("loginData"));
    if (loginData && loginData.user) {
      try {
        const updatedData = {
          user_name: userData.user_name,
          lastname: userData.lastname,
          email: userData.email,
          phone: userData.phone,
          city: userData.city,
          address: userData.address,
          neighborhood: userData.neighborhood,
        };

        await axios.put(`/api/updateusers/${loginData.user.id}`, updatedData);
        message.success("Datos actualizados exitosamente.");
      } catch (error) {
        message.error("Error al actualizar los datos del usuario.");
        console.error(error);
      }
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "user_name",
      "lastname",
      "email",
      "phone",
      "city",
      "address",
      "neighborhood",
    ];
    return requiredFields.every((field) => userData?.[field]?.trim());
  };

  const handlePlaceOrder = async () => {
    if (validateForm()) {
      const loginData = JSON.parse(localStorage.getItem("loginData"));

      // Calcular la fecha de entrega estimada sumando 4 días a la fecha actual
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      const estimatedDelivery = currentDate.toISOString(); // Formato de fecha en ISO

      const orderData = {
        userId: loginData?.user?.id,
        cartDetails: cartDetails.map((product) => ({
          productId: product.product_id, // Asegúrate de usar el campo correcto para el ID del producto
          quantity: product.quantity,
          price: 2000,
        })),
        total: calculateSubtotal() + shippingCost,
        shippingCost: shippingCost,
        shippingMethod: "Overnight",
        estimatedDelivery: estimatedDelivery, // Fecha calculada
        userData: {
          user_name: userData.user_name,
          lastname: userData.lastname,
          email: userData.email,
          phone: userData.phone,
          city: userData.city,
          address: userData.address,
          neighborhood: userData.neighborhood,
        },
      };

      try {
        await axios.post("/api/orders/placeOrder", orderData);
        message.success("Pedido realizado exitosamente.");
      } catch (error) {
        message.error("Error al realizar el pedido.");
        console.error(error);
      }
    } else {
      message.error(
        "Por favor, complete todos los campos antes de realizar el pedido."
      );
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
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Nombre">
                    <Input
                      name="user_name"
                      value={userData.user_name}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Apellido">
                    <Input
                      name="lastname"
                      value={userData.lastname}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Email">
                    <Input
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Teléfono">
                    <Input
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Ciudad">
                    <Input
                      name="city"
                      value={userData.city}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Dirección">
                    <Input
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Barrio">
                    <Input
                      name="neighborhood"
                      value={userData.neighborhood}
                      onChange={handleInputChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    className="confirm-data-button"
                    onClick={handleUpdateUser}
                  >
                    Confirmar Datos
                  </Button>
                </Col>
              </Row>
            </Form>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <Divider />
            {cartDetails.map((product) => (
              <div key={product.product_id} className="order-summary-item">
                <span>
                  {product.name} x {product.quantity}
                </span>
                <span>
                  ${(product.price * product.quantity).toLocaleString()}
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
            <Divider />
            <h4>
              Total: <span>${total.toLocaleString()}</span>
            </h4>

            <Button
              type="primary"
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={!validateForm()}
            >
              REALIZAR EL PEDIDO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
