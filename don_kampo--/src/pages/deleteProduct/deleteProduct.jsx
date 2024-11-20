import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import CustomFooter from "../../components/footer/Footer";
import { Table, Input, Button, message, Popconfirm, Modal, Form, Row, Col, InputNumber } from "antd";
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

  // Función para obtener los productos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
      message.success("Productos cargados correctamente.");
    } catch (error) {
      message.error("Error al cargar los productos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un producto
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`/api/deleteproduct/${productId}`);
      message.success("Producto eliminado correctamente.");
      fetchProducts(); // Actualizar lista después de eliminar
    } catch (error) {
      message.error("Error al eliminar el producto.");
      console.error(error);
    }
  };

  // Mostrar modal para editar un producto
  const showEditModal = (product) => {
    setSelectedProduct(product);
    const { name, description, category, stock, variations } = product;
    form.setFieldsValue({
      name,
      description,
      category,
      stock,
      quality: variations[0]?.quality || "",
      quantity: variations[0]?.quantity || "",
      price_home: variations[0]?.price_home || "",
      price_supermarket: variations[0]?.price_supermarket || "",
      price_restaurant: variations[0]?.price_restaurant || "",
      price_fruver: variations[0]?.price_fruver || "",
    });
    setIsModalVisible(true);
  };

  // Función para manejar la actualización de productos
  const handleUpdateProduct = async (values) => {
    try {
      const updatedProduct = {
        ...values,
        variations: [
          {
            quality: values.quality || "",
            quantity: values.quantity || 0,
            price_home: values.price_home,
            price_supermarket: values.price_supermarket,
            price_restaurant: values.price_restaurant,
            price_fruver: values.price_fruver,
          },
        ],
      };

      await axios.put(`/api/updateproduct/${selectedProduct.product_id}`, updatedProduct);
      message.success("Producto actualizado correctamente.");
      setIsModalVisible(false);
      fetchProducts(); // Refrescar lista después de actualizar
    } catch (error) {
      message.error("Error al actualizar el producto.");
      console.error(error);
    }
  };

  // Filtrar productos por texto
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columnas para la tabla
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
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Calidad" name="quality">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cantidad" name="quantity">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Precio Hogar" name="price_home">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Precio Supermercado" name="price_supermarket">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Precio Restaurante" name="price_restaurant">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Precio Fruver" name="price_fruver">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
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
