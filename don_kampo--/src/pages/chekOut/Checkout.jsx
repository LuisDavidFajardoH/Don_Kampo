import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Divider, Modal, Row, Col } from "antd";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import { useCart } from "../products/CartContext";
import useWindowSize from "react-use/lib/useWindowSize";
import "./Checkout.css";

const Checkout = () => {
  const [userData, setUserData] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  // Obtener el tipo de usuario y órdenes desde localStorage
  const loginData = JSON.parse(localStorage.getItem("loginData"));
  const userType = loginData?.user?.user_type;

  const [shippingCost, setShippingCost] = useState(5000);

  // Verificar si el usuario tiene órdenes previas
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (loginData && loginData.user) {
        try {
          const response = await axios.get(`https://don-kampo-api.onrender.com/api/users/${loginData.user.id}`);
          const user = response.data.user;
          setUserData(user);

          // Aplicar descuento de envío si es la primera orden
          const hasOrders =
            response.data.orders && response.data.orders.length > 0;
          if (!hasOrders) {
            setIsFirstOrder(true);
            if (userType === "hogar") {
              setShippingCost(2500); // 50% de descuento en el envío para "hogar"
            } else {
              setShippingCost(1); // Envío gratis para otros tipos de usuario en la primera orden
            }
          }
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
            const response = await axios.get(`https://don-kampo-api.onrender.com/api/getproduct/${productId}`);
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
        return parseFloat(product.price_home) || 0;
    }
  };

  const calculateSubtotal = () => {
    return (cartDetails || []).reduce(
      (total, product) =>
        total + getPriceByUserType(product) * product.quantity,
      0
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateUser = async () => {
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

        await axios.put(`https://don-kampo-api.onrender.com/api/updateusers/${loginData.user.id}`, updatedData);
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
      // Calcular la fecha de entrega estimada sumando 4 días a la fecha actual
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      const estimatedDelivery = currentDate.toISOString();

      const orderData = {
        userId: loginData?.user?.id,
        cartDetails: cartDetails.map((product) => ({
          productId: product.product_id,
          quantity: product.quantity,
          price: getPriceByUserType(product),
        })),
        total: calculateSubtotal() + shippingCost,
        shippingCost: shippingCost,
        shippingMethod: "Overnight",
        estimatedDelivery: estimatedDelivery,
        actual_delivery: currentDate,
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
        const response = await axios.post("https://don-kampo-api.onrender.com/api/orders/placeOrder", orderData);
        if (response.status === 201) {
          setOrderId(response.data.orderId);
          
          setIsModalVisible(true);
        } else {
          message.error("Error al realizar el pedido. Inténtalo nuevamente.");
        }
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

  const generateOrderPDF = () => {
    const input = document.getElementById("order-summary-pdf"); // Elemento que será convertido a PDF
    if (!input) {
      message.error("No se pudo generar el PDF. Intenta nuevamente.");
      return;
    }
  
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
  
      // Agregar la imagen al PDF
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const position = 10; // Espaciado desde la parte superior
  
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      pdf.save(`Resumen_Pedido_${orderId}.pdf`); // Guardar el archivo con un nombre personalizado
  
      // Limpiar el carrito después de guardar el PDF
      clearCart();
      message.success("El carrito ha sido vaciado después de generar el PDF.");
      navigate("/products");
    });
  };
  

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
                  $
                  {(
                    getPriceByUserType(product) * product.quantity
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
              <p
                style={{ fontSize: "12px", color: "#FF914D", marginTop: "5px" }}
              >
                ¡Descuento aplicado al costo de envío por ser tu primer pedido!
              </p>
            )}

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

            <Modal
              title="Pedido Confirmado"
              visible={isModalVisible}
              onOk={() => {
                setIsModalVisible(false);
                navigate("/products");
              }}
              onCancel={() => setIsModalVisible(false)}
              footer={[
              
                <Button
                  key="pdf"
                  type="default"
                  onClick={generateOrderPDF}
                  style={{ backgroundColor: "#FF914D", color: "#fff" }}
                >
                  Descargar PDF
                </Button>,
              ]}
            >
              <div id="order-summary-pdf">
                <p>
                  ¡{userData?.user_name}, tu pedido ha sido realizado
                  exitosamente!
                </p>
                <p>
                  ID de la orden: <strong>{orderId}</strong>
                </p>
                <Divider />
                <h4>Resumen del Pedido</h4>
                {cartDetails.map((product) => (
                  <div key={product.product_id} className="order-summary-item">
                    <span>
                      {product.name} x {product.quantity}
                    </span>
                    <span>
                      $
                      {(
                        getPriceByUserType(product) * product.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
                <Divider />
                <p>Subtotal: ${calculateSubtotal().toLocaleString()}</p>
                <p>Envío: ${shippingCost.toLocaleString()}</p>
                <h4>Total: ${total.toLocaleString()}</h4>
              </div>
            </Modal>
          </div>
        </div>
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </div>
  );
};

export default Checkout;