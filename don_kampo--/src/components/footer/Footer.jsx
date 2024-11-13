import React from "react";
import { Layout, Row, Col } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./Footer.css";

const { Footer } = Layout;

const CustomFooter = () => {
  return (
    <Footer className="footer">
      <div className="footer-content">
        <Row gutter={[16, 16]}>
          {/* Columna 1: Información de contacto */}
          <Col xs={24} sm={12} lg={8}>
            <h3 className="footer-title">Contacto</h3>
            <p><PhoneOutlined /> Tel: +57 123 456 7890</p>
            <p><MailOutlined /> Correo: info@donkampo.com</p>
            <p><EnvironmentOutlined /> Dirección: Calle Ficticia 123, Bogotá</p>
          </Col>

          {/* Columna 2: Redes sociales */}
          <Col xs={24} sm={12} lg={8}>
            <h3 className="footer-title">Síguenos</h3>
            <div className="social-icons">
              <FacebookOutlined className="icon" />
              <InstagramOutlined className="icon" />
              <TwitterOutlined className="icon" />
            </div>
          </Col>

          {/* Columna 3: Misión/Enlace adicional */}
          <Col xs={24} sm={24} lg={8}>
            <h3 className="footer-title">Nuestra misión</h3>
            <p>
              Conectar lo mejor del campo con el consumidor moderno, ofreciendo
              productos frescos y de excelente calidad.
            </p>
          </Col>
        </Row>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Don Kampo. Todos los derechos reservados.</p>
      </div>
    </Footer>
  );
};

export default CustomFooter;
