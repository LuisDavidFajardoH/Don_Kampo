import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import CustomFooter from "../../components/footer/Footer";
import { Table, Input, Button, message, Popconfirm, Modal, Form } from "antd";
import { SearchOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://don-kampo-api.onrender.com/api/products");
      setProducts(response.data);
      message.success("Productos cargados correctamente.");
    } catch (error) {
      message.error("Error al cargar los productos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`https://don-kampo-api.onrender.com/api/deleteproduct/${productId}`);
      message.success("Producto eliminado correctamente.");
      fetchProducts(); // Actualiza la lista después de eliminar
    } catch (error) {
      message.error("Error al eliminar el producto.");
      console.error(error);
    }
  };

  const showEditModal = (product) => {
    setSelectedProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleUpdateProduct = async (values) => {
    try {
      await axios.put(`https://don-kampo-api.onrender.com/api/updateproduct/${selectedProduct.product_id}`, values);
      message.success("Producto actualizado correctamente.");
      setIsModalVisible(false);
      fetchProducts(); // Refresca la lista después de la actualización
    } catch (error) {
      message.error("Error al actualizar el producto.");
      console.error(error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "product_id",
      key: "product_id",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Precio Hogar",
      dataIndex: "price_home",
      key: "price_home",
      render: (price) => `$${parseFloat(price).toLocaleString()}`,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title={`¿Eliminar el producto "${record.name}"?`}
            onConfirm={() => deleteProduct(record.product_id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>Gestión de Productos</h2>
        <Input
          placeholder="Buscar producto por nombre"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ marginBottom: "16px", width: "300px" }}
        />
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="product_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title="Editar Producto"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleUpdateProduct} layout="vertical">
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: "Por favor ingresa el nombre del producto" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Descripción"
              name="description"
              rules={[{ required: true, message: "Por favor ingresa una descripción" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Categoría"
              name="category"
              rules={[{ required: true, message: "Por favor ingresa una categoría" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Stock"
              name="stock"
              rules={[{ required: true, message: "Por favor ingresa el stock" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Precio Hogar"
              name="price_home"
              rules={[{ required: true, message: "Por favor ingresa el precio para Hogar" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Precio Supermercado"
              name="price_supermarket"
              rules={[{ required: true, message: "Por favor ingresa el precio para Supermercado" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Precio Restaurante"
              name="price_restaurant"
              rules={[{ required: true, message: "Por favor ingresa el precio para Restaurante" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Precio Fruver"
              name="price_fruver"
              rules={[{ required: true, message: "Por favor ingresa el precio para Fruver" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Guardar Cambios
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default ManageProducts;
