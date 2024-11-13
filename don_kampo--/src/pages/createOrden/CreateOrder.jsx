import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import "./CreateOrder.css";

const { Option } = Select;

const CreateOrder = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [products, setProducts] = useState([]); // Lista de productos
  const [selectedProducts, setSelectedProducts] = useState([]); // Productos seleccionados para la orden
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch usuarios
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users", { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        message.error("Error al cargar los usuarios.");
        console.error(error);
      }
    };

    // Fetch productos
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products", { withCredentials: true });
        setProducts(response.data);
      } catch (error) {
        message.error("Error al cargar los productos.");
        console.error(error);
      }
    };

    fetchUsers();
    fetchProducts();
  }, []);

  const handleAddProduct = (productId, quantity) => {
    const product = products.find((p) => p.product_id === productId);
    if (product) {
      setSelectedProducts((prev) => {
        const existingProduct = prev.find((p) => p.product_id === productId);
        if (existingProduct) {
          return prev.map((p) =>
            p.product_id === productId ? { ...p, quantity: p.quantity + quantity } : p
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
  };

  const incrementQuantity = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0) // Elimina el producto si la cantidad llega a 0
    );
  };

  const handleSubmit = async (values) => {
    const { userId, shippingMethod } = values;

    if (selectedProducts.length === 0) {
      message.error("Debe seleccionar al menos un producto para la orden.");
      return;
    }

    const orderData = {
      userId,
      products: selectedProducts.map(({ product_id, quantity, price_home }) => ({
        productId: product_id,
        quantity,
        price: price_home,
      })),
      shippingMethod,
    };

    setLoading(true);
    try {
      const response = await axios.post("/api/orders/placeOrder", orderData);
      if (response.status === 201) {
        message.success("Orden creada exitosamente.");
        setSelectedProducts([]); // Limpiar productos seleccionados
      }
    } catch (error) {
      message.error("Error al crear la orden.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-order-container">
        <h2>Crear Orden Manual</h2>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Usuario"
            name="userId"
            rules={[{ required: true, message: "Por favor seleccione un usuario" }]}
          >
            <Select placeholder="Seleccione un usuario">
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.user_name} {user.lastname} - {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Método de Envío"
            name="shippingMethod"
            rules={[{ required: true, message: "Por favor seleccione un método de envío" }]}
          >
            <Select placeholder="Seleccione un método de envío">
              <Option value="standard">Estándar</Option>
              <Option value="express">Exprés</Option>
            </Select>
          </Form.Item>

          <div className="product-selection">
            <h3>Seleccionar Productos</h3>
            <div className="products-list">
              {products.map((product) => (
                <div key={product.product_id} className="product-item">
                  <p>{product.name}</p>
                  <p>${product.price_home.toLocaleString()}</p>
                  {selectedProducts.find((p) => p.product_id === product.product_id) ? (
                    <div className="quantity-controls">
                      <Button onClick={() => decrementQuantity(product.product_id)}>-</Button>
                      <span className="quantity-text">
                        {
                          selectedProducts.find((p) => p.product_id === product.product_id)
                            .quantity
                        }
                      </span>
                      <Button onClick={() => incrementQuantity(product.product_id)}>+</Button>
                    </div>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => handleAddProduct(product.product_id, 1)}
                    >
                      Añadir
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="selected-products">
            <h3>Productos Seleccionados</h3>
            {selectedProducts.length > 0 ? (
              selectedProducts.map((product) => (
                <div key={product.product_id} className="selected-product-item">
                  <p>{product.name} x {product.quantity}</p>
                  <p>Total: ${(product.quantity * product.price_home).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No hay productos seleccionados.</p>
            )}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Orden
            </Button>
          </Form.Item>
        </Form>
      </div>
      <CustomFooter />
    </div>
  );
};

export default CreateOrder;
