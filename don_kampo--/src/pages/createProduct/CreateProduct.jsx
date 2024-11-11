import React, { useState } from "react";
import { Form, Input, Button, message, Upload, InputNumber, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const CreateProduct = () => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (values) => {
    const formData = new FormData();

    // Agregar campos de texto y numéricos
    formData.append("name", values.name || "");
    formData.append("description", values.description || "");
    formData.append("category", values.category || "");
    formData.append("stock", values.stock !== undefined ? parseInt(values.stock, 10) : 0);
    formData.append("photo", imageFile); // Enviamos la imagen como un archivo binario

    // Agregar campos de precios
    formData.append("price_home", values.price_home !== undefined ? parseFloat(values.price_home) : 0);
    formData.append("price_supermarket", values.price_supermarket !== undefined ? parseFloat(values.price_supermarket) : 0);
    formData.append("price_restaurant", values.price_restaurant !== undefined ? parseFloat(values.price_restaurant) : 0);
    formData.append("price_fruver", values.price_fruver !== undefined ? parseFloat(values.price_fruver) : 0);

    

    try {
      const response = await axios.post("http://localhost:8080/api/createproduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success(`Producto creado exitosamente con ID: ${response.data.product_id}`);
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      message.error("Error al crear el producto. Verifique los campos.");
      console.error(error);
    }
  };

  const handleImageUpload = ({ file }) => {
    setImageFile(file);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <Form.Item
        name="name"
        label="Nombre del producto"
        rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
      >
        <Input placeholder="Nombre del producto" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Descripción"
        rules={[{ required: true, message: "Por favor ingresa la descripción" }]}
      >
        <Input.TextArea placeholder="Descripción del producto" />
      </Form.Item>

      <Form.Item
        name="category"
        label="Categoría"
        rules={[{ required: true, message: "Por favor selecciona la categoría" }]}
      >
        <Select placeholder="Selecciona una categoría">
          <Option value="Fruta">Fruta</Option>
          <Option value="Verdura">Verdura</Option>
          <Option value="Lácteos">Lácteos</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="stock"
        label="Cantidad en stock"
        rules={[{ required: true, message: "Por favor ingresa el stock" }]}
      >
        <InputNumber min={1} placeholder="Cantidad en stock" style={{ width: "100%" }} />
      </Form.Item>

      {/* Campos de precios */}
      <Form.Item
        name="price_home"
        label="Precio a domicilio"
        rules={[{ required: true, message: "Por favor ingresa el precio a domicilio" }]}
      >
        <InputNumber min={0} placeholder="Precio a domicilio" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="price_supermarket"
        label="Precio en supermercado"
        rules={[{ required: true, message: "Por favor ingresa el precio en supermercado" }]}
      >
        <InputNumber min={0} placeholder="Precio en supermercado" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="price_restaurant"
        label="Precio en restaurante"
        rules={[{ required: true, message: "Por favor ingresa el precio en restaurante" }]}
      >
        <InputNumber min={0} placeholder="Precio en restaurante" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="price_fruver"
        label="Precio en fruver"
        rules={[{ required: true, message: "Por favor ingresa el precio en fruver" }]}
      >
        <InputNumber min={0} placeholder="Precio en fruver" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Foto del producto">
        <Upload
          beforeUpload={() => false}
          onChange={handleImageUpload}
          accept="image/*"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Crear Producto
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateProduct;
