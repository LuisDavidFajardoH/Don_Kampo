import React, { useRef } from "react";
import { Carousel, Button, Card, Typography, Row, Col } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Navbar from "../../components/navbar/Navbar";
import "./Home.css";

const { Title, Paragraph } = Typography;

const carouselItems = [
  {
    img: "/images/frutas.webp",
    title: "Frutas frescas",
    description: "Compra frutas frescas y de calidad directamente del campo",
  },
  {
    img: "/images/organicas.webp",
    title: "Verduras orgánicas",
    description: "Verduras cultivadas orgánicamente, perfectas para tu dieta",
  },
  {
    img: "/images/leche.webp",
    title: "Lácteos de granja",
    description: "Lácteos frescos y saludables para toda tu familia",
  },
  {
    img: "/images/slider.jpg",
    title: "Promociones exclusivas",
    description: "Aprovecha las ofertas semanales en nuestros productos",
  },
];

const categories = [
  { title: "Frutas", img: "/images/frutasProducto.jpg" },
  { title: "Verduras", img: "/images/verdurasProducto.jpg" },
  { title: "Lácteos", img: "/images/lecheProducto.jpg" },
  { title: "Bebidas", img: "/images/slider.jpg" },
];

const Home = () => {
  const carouselRef = useRef(null);

  const handleNext = () => {
    carouselRef.current.next();
  };

  const handlePrev = () => {
    carouselRef.current.prev();
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
                <img src={item.img} alt={item.title} className="carousel-image" />
                <div className="carousel-overlay">
                  <Title level={2} className="carousel-title">{item.title}</Title>
                  <Paragraph className="carousel-description">{item.description}</Paragraph>
                  <Button type="primary" size="large" className="carousel-button">
                    Ver más
                  </Button>
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
                En Don Kampo nos enorgullece ofrecer productos frescos y de excelente calidad. Nuestro compromiso es llevar lo mejor del campo a tu mesa, promoviendo un consumo responsable y sostenible.
              </Paragraph>
              <Button type="primary" size="large">
                Conoce más sobre nosotros
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <img src="/images/calidad.webp" alt="Calidad Don Kampo" className="info-image" />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Home;
