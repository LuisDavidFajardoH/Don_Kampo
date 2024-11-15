import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import { Form, Input, Button, message, Upload, InputNumber, Select, Row, Col, Table, Divider } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import * as XLSX from "xlsx";
import "./CreateProduct.css";

const { Option } = Select;

const CreateProduct = () => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [imageFiles, setImageFiles] = useState({});

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
      const response = await axios.post("https://don-kampo-api.onrender.com/api/createproduct", formData, {
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
        await axios.post("https://don-kampo-api.onrender.com/api/createproduct", formData, {
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
        <h2 className="create-product-header">Crear Producto</h2>
        
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre del producto"
                rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
              >
                <Input placeholder="Nombre del producto" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Categoría"
                rules={[{ required: true, message: "Por favor selecciona la categoría" }]}
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
                rules={[{ required: true, message: "Por favor ingresa la descripción" }]}
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

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="price_home" label="Precio a hogar">
                <InputNumber min={0} placeholder="Precio a domicilio" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price_supermarket" label="Precio a supermercado">
                <InputNumber min={0} placeholder="Precio en supermercado" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="price_restaurant" label="Precio a restaurante">
                <InputNumber min={0} placeholder="Precio en restaurante" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price_fruver" label="Precio a fruver">
                <InputNumber min={0} placeholder="Precio en fruver" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Foto del producto">
            <Upload
              beforeUpload={() => false}
              onChange={handleImageUpload}
              accept="image/*"
              maxCount={1}
              className="upload-button"
            >
              <Button icon={<UploadOutlined />}>Subir imagen</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="submit-button">
              Crear Producto Individual
            </Button>
          </Form.Item>
        </Form>
        <Divider />
        <div className="table-container">
          <h3 className="table-title">Cargar Productos desde Excel</h3>
          <Button onClick={downloadSampleExcel} icon={<DownloadOutlined />} style={{ marginBottom: "16px" }}>
            Descargar Excel de Ejemplo
          </Button>
          <Upload beforeUpload={() => false} onChange={handleExcelUpload} accept=".xlsx, .xls" maxCount={1}>
            <Button className="ExcelCarga" icon={<UploadOutlined />}>Subir archivo Excel</Button>
          </Upload>
          
          {products.length > 0 && (
            <>
              <Table columns={columns} dataSource={products} rowKey="name" pagination={false} />
              <Row justify="center" style={{ marginTop: "20px" }}>
                <Col span={8}>
                  <Button type="primary" onClick={handleConfirmUpload} block>
                    Confirmar y Enviar Productos
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
      <BotonWhatsapp /> 
      <CustomFooter />
    </>
  );
};

export default CreateProduct;
