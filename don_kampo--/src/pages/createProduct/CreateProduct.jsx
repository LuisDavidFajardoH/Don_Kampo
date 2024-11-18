import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import { Form, Input, Button, Upload, InputNumber, Select, Row, Col, message } from "antd";
import axios from "axios";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import * as XLSX from "xlsx";
import { UploadOutlined } from "@ant-design/icons";
import "./CreateProduct.css";

const { Option } = Select;

const CreateProduct = () => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);  // Imagen del producto
  const [variations, setVariations] = useState([  // Variaciones del producto
    {
      quality: "",
      quantity: "",
      price_home: "",
      price_supermarket: "",
      price_restaurant: "",
      price_fruver: "",
    },
  ]);

  const handleImageUpload = ({ file }) => {
    setImageFile(file);  // Guardar el archivo de imagen
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setVariations(updatedVariations);
  };

  const addVariation = () => {
    setVariations([
      ...variations,
      {
        quality: "",
        quantity: "",
        price_home: "",
        price_supermarket: "",
        price_restaurant: "",
        price_fruver: "",
      },
    ]);
  };

  const removeVariation = (index) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("description", values.description || "");
    formData.append("category", values.category || "");
    formData.append("stock", values.stock !== undefined ? parseInt(values.stock, 10) : 0);
    formData.append("photo", imageFile);
    formData.append("price_home", values.price_home !== undefined ? parseFloat(values.price_home) : 0);
    formData.append("price_supermarket", values.price_supermarket !== undefined ? parseFloat(values.price_supermarket) : 0);
    formData.append("price_restaurant", values.price_restaurant !== undefined ? parseFloat(values.price_restaurant) : 0);
    formData.append("price_fruver", values.price_fruver !== undefined ? parseFloat(values.price_fruver) : 0);

    try {
      const response = await axios.post("/api/createproduct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      message.success(`Producto creado exitosamente con ID: ${response.data.product_id}`);
      form.resetFields();
      setImageFile(null);
      setVariations([]); // Reset variations
    } catch (error) {
      message.error("Error al crear el producto.");
      console.error(error);
    }
  };

 

  const handleExcelUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setProducts(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProductImageUpload = (file, productName) => {
    setImageFiles((prevImages) => ({
      ...prevImages,
      [productName]: file,
    }));
    return false;
  };

  const handleConfirmUpload = async () => {
    products.forEach(async (product) => {
      const formData = new FormData();
      formData.append("name", product.name || "");
      formData.append("description", product.description || "");
      formData.append("category", product.category || "");
      formData.append("stock", product.stock !== undefined ? parseInt(product.stock, 10) : 0);
      formData.append("price_home", product.price_home !== undefined ? parseFloat(product.price_home) : 0);
      formData.append("price_supermarket", product.price_supermarket !== undefined ? parseFloat(product.price_supermarket) : 0);
      formData.append("price_restaurant", product.price_restaurant !== undefined ? parseFloat(product.price_restaurant) : 0);
      formData.append("price_fruver", product.price_fruver !== undefined ? parseFloat(product.price_fruver) : 0);

      if (imageFiles[product.name]) {
        formData.append("photo", imageFiles[product.name]);
      }

      try {
        await axios.post("/api/createproduct", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success(`Producto ${product.name} creado exitosamente`);
      } catch (error) {
        message.error(`Error al crear el producto ${product.name}`);
        console.error(error);
      }
    });
  };

  // Genera un archivo Excel de prueba para descargar
  const downloadSampleExcel = () => {
    const sampleData = [
      { name: "Manzana", description: "Fruta roja y dulce", category: "Fruta", stock: 100, price_home: 1.2, price_supermarket: 1.1, price_restaurant: 1.5, price_fruver: 1.3 },
      { name: "Lechuga", description: "Verdura verde y fresca", category: "Verdura", stock: 200, price_home: 0.8, price_supermarket: 0.75, price_restaurant: 1.0, price_fruver: 0.9 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    // Generar archivo y descargar
    XLSX.writeFile(workbook, "productos_ejemplo.xlsx");
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Descripción", dataIndex: "description", key: "description" },
    { title: "Categoría", dataIndex: "category", key: "category" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    { title: "Precio Hogar", dataIndex: "price_home", key: "price_home" },
    { title: "Precio Supermercado", dataIndex: "price_supermarket", key: "price_supermarket" },
    { title: "Precio Restaurante", dataIndex: "price_restaurant", key: "price_restaurant" },
    { title: "Precio Fruver", dataIndex: "price_fruver", key: "price_fruver" },
    {
      title: "Imagen",
      key: "image",
      render: (text, record) => (
        <Upload
          beforeUpload={(file) => handleProductImageUpload(file, record.name)}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      ),
    },
  ];

  return (

    <>
      <Navbar />
    <div className="create-product-container">
      <h2>Crear Producto</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nombre del Producto"
              rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
            >
              <Input placeholder="Nombre del producto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Categoría"
              rules={[{ required: true, message: "Por favor selecciona una categoría" }]}
            >
              <Select placeholder="Selecciona una categoría">
                <Option value="Frutas importadas">Frutas importadas</Option>
                <Option value="Verdura">Verdura</Option>
                <Option value="Frutas nacionales">Frutas nacionales</Option>
                <Option value="Cosecha">Cosecha</Option>
                <Option value="Hortalizas">Hortalizas</Option>
                <Option value="Otros">Otros</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="description"
              label="Descripción"
              rules={[{ required: true, message: "Por favor ingresa una descripción" }]}
            >
              <Input.TextArea placeholder="Descripción del producto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="stock"
              label="Cantidad en stock"
              rules={[{ required: true, message: "Por favor ingresa el stock" }]}
            >
              <InputNumber min={1} placeholder="Cantidad en stock" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Foto del Producto">
          <Upload
            beforeUpload={() => false}  // No cargar automáticamente
            onChange={handleImageUpload}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Subir Imagen</Button>
          </Upload>
          {imageFile && (
            <div style={{ marginTop: 10 }}>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Vista previa"
                style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px" }}
              />
            </div>
          )}
        </Form.Item>

        <h3>Variaciones del Producto</h3>
        {variations.map((variation, index) => (
          <div key={index} className="variation-fields">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Input
                  placeholder="Calidad (Ej: Primera, Segunda)"
                  value={variation.quality}
                  onChange={(e) => handleVariationChange(index, "quality", e.target.value)}
                />
              </Col>
              <Col span={12}>
                <Input
                  placeholder="Cantidad (Ej: 1kg, 2kg)"
                  value={variation.quantity}
                  onChange={(e) => handleVariationChange(index, "quantity", e.target.value)}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <InputNumber
                  min={0}
                  placeholder="Precio Hogar"
                  value={variation.price_home}
                  onChange={(value) => handleVariationChange(index, "price_home", value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  min={0}
                  placeholder="Precio Supermercado"
                  value={variation.price_supermarket}
                  onChange={(value) => handleVariationChange(index, "price_supermarket", value)}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <InputNumber
                  min={0}
                  placeholder="Precio Restaurante"
                  value={variation.price_restaurant}
                  onChange={(value) => handleVariationChange(index, "price_restaurant", value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <InputNumber
                  min={0}
                  placeholder="Precio Fruver"
                  value={variation.price_fruver}
                  onChange={(value) => handleVariationChange(index, "price_fruver", value)}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>
            <Button onClick={() => removeVariation(index)} type="danger" style={{ marginTop: 10 }}>
              Eliminar Variación
            </Button>
          </div>
        ))}

        <Button onClick={addVariation} type="dashed" style={{ marginTop: 20, width: "100%" }}>
          Añadir Variación
        </Button>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Crear Producto
          </Button>
        </Form.Item>
      </Form>
    </div>
    <BotonWhatsapp /> 
    <CustomFooter />
  </>
  );
};

export default CreateProduct;