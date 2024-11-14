import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Carousel, Button, Card, Typography, Row, Col, Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import InstallPrompt from "../install/InstallPrompt";
import "./Home.css";

const { Title, Paragraph } = Typography;

const carouselItems = [
  {
    img: "/images/frutas.webp",
    title: "Frutas frescas",
    description: "Compra frutas frescas y de calidad directamente del campo",
    link: "/products?category=Frutas", // Ruta para este slide
  },
  {
    img: "/images/organicas.webp",
    title: "Verduras orgánicas",
    description: "Verduras cultivadas orgánicamente, perfectas para tu dieta",
    link: "/products?category=Verduras", // Ruta para este slide
  },
  {
    img: "/images/frutasImportadas.jpg",
    title: "Frutas importadas",
    description: "Frutas importadas de la mejor calidad para tu hogar",
    link: "/products?category=Frutas", // Ruta para este slide
  },
  {
    img: "/images/slider.jpg",
    title: "Promociones exclusivas",
    description: "Aprovecha las ofertas semanales en nuestros productos",
    link: "/products", // Ruta para este slide
  },
];


const categories = [
  { title: "Frutas nacionales", img: "/images/frutasProducto.jpg" },
  { title: "Verduras", img: "/images/verdurasProducto.jpg" },
  { title: "Frutas importadas", img: "/images/frutasImportadas.jpg" },
  { title: "Hortalizas", img: "/images/slider.jpg" },
];

const Home = () => {
  const carouselRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  useEffect(() => {
    setIsModalVisible(true); // Muestra el modal al cargar la página
  }, []);

  const handleOk = () => {
    setIsModalVisible(false); // Cierra el modal al hacer clic en "Ok"
  };

  const handleNext = () => {
    carouselRef.current.next();
  };

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNavigate = (link) => {
    navigate(link); // Redirige a la ruta especificada
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* Carrusel principal */}
        <div className="carousel-wrapper">
          <Carousel autoplay className="home-carousel" ref={carouselRef}>
            {carouselItems.map((item, index) => (
              <div key={index} className="carousel-item">
                <img
                  src={item.img}
                  alt={item.title}
                  className="carousel-image"
                />
                <div className="carousel-overlay">
                  <div className="carousel-left">
                    <Title level={2} className="carousel-title">
                      {item.title}
                    </Title>
                    <Paragraph className="carousel-description">
                      {item.description}
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      className="carousel-button"
                      onClick={() => handleNavigate(item.link)}
                    >
                      Ver más
                    </Button>
                  </div>
                  <div className="carousel-right">
                    <img
                      src="/images/1.png"
                      alt="Logo"
                      className="carousel-logo"
                    />
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          <Button
            className="carousel-control left"
            icon={<LeftOutlined />}
            onClick={handlePrev}
          />
          <Button
            className="carousel-control right"
            icon={<RightOutlined />}
            onClick={handleNext}
          />
        </div>

        {/* Categorías destacadas */}
        <div className="categories-section">
          <Title level={3}>Explora nuestras categorías</Title>
          <Row gutter={16}>
            {categories.map((category, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  cover={<img alt={category.title} src={category.img} />}
                  className="category-card"
                  onClick={() => handleCategoryClick(category.title)} // Redirigir al hacer clic
                >
                  <Card.Meta title={category.title} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Testimonios o sección de información */}
        <div className="info-section">
          <Row gutter={32} align="middle">
            <Col xs={24} md={12}>
              <Title level={3}>Calidad garantizada</Title>
              <Paragraph>
                En Don Kampo, nuestra pasión es brindar productos frescos y de
                calidad excepcional, cultivados con dedicación y respeto por la
                tierra. Nos enorgullece llevar lo mejor del campo directamente a
                tu mesa, promoviendo un consumo responsable y sostenible que
                apoya a nuestros agricultores y cuida del medio ambiente. Con un
                compromiso firme hacia la excelencia, entregamos nuestros
                productos con esmero a hogares, fruver, supermercados y
                restaurantes, asegurándonos de que la frescura y el sabor
                auténtico del campo estén siempre al alcance de quienes valoran
                una alimentación natural y consciente.
              </Paragraph>
              <Button type="primary" size="large">
                Conoce más sobre nosotros
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <img
                src="/images/calidad.webp"
                alt="Calidad Don Kampo"
                className="info-image"
              />
            </Col>
          </Row>
          <Modal
            title={
              <img src="/images/1.png" alt="Logo" className="modal-logo" />
            }
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleOk}
            okText="Entendido"
            cancelButtonProps={{ style: { display: "none" } }}
            footer={
              <Button
                style={{ marginRight: "35%" }}
                className="modal-ok-button"
                onClick={handleOk}
              >
                Entendido
              </Button>
            }
          >
            <div className="modal-text">
              Por el momento, nuestros servicios están disponibles únicamente en{" "}
              <span className="modal-body-highlight">Chía</span> y{" "}
              <span className="modal-body-highlight">Cajicá</span>. ¡Gracias por
              tu comprensión!
            </div>
          </Modal>
          ;
        </div>
        <InstallPrompt />
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Home;
