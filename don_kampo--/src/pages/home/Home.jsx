import React, { useRef, useEffect, useState } from "react";
import {
  Carousel,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Modal,
  Input,
} from "antd";
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
    link: "/products?category=Frutas",
  },
  {
    img: "/images/organicas.webp",
    title: "Verduras orgánicas",
    description: "Verduras cultivadas orgánicamente, perfectas para tu dieta",
    link: "/products?category=Verduras",
  },
  {
    img: "/images/frutasImportadas.jpg",
    title: "Frutas importadas",
    description: "Frutas importadas de la mejor calidad para tu hogar",
    link: "/products?category=Frutas",
  },
  {
    img: "/images/slider.jpg",
    title: "Promociones exclusivas",
    description: "Aprovecha las ofertas semanales en nuestros productos",
    link: "/products",
  },
];

const categories = [
  { title: "Frutas nacionales", img: "/images/frutasProducto.jpg" },
  { title: "Verduras", img: "/images/verdurasProducto.jpg" },
  { title: "Frutas importadas", img: "/images/frutasImportadas.jpg" },
  { title: "Hortalizas", img: "/images/slider.jpg" },
];

const userTypeCarouselItems = {
  Fruver: ["Frutas", "Verduras"],
  Hogar: ["Frutas", "Hortalizas"],
  Restaurante: ["Verduras", "Frutas importadas"],
  Supermercado: ["Promociones exclusivas", "Frutas nacionales"],
};

const Home = () => {
  const carouselRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userType, setUserType] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  // Función para manejar la búsqueda
  const handleSearch = (value) => {
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  useEffect(() => {
    const modalShown = localStorage.getItem("modalShown");
    if (!modalShown) {
      setIsModalVisible(true);
    }
  }, []);

  useEffect(() => {
    if (userType) {
      localStorage.setItem("modalShown", "true");
      localStorage.setItem("userType", userType);
      setIsModalVisible(false);
    }
  }, [userType]);

  const handleNext = () => {
    carouselRef.current.next();
  };

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNavigate = (link) => {
    navigate(link);
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* Carrusel principal */}
        {/* Barra de búsqueda */}
        {/* Barra de búsqueda */}
        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar productos, categorías, etc."
            className="search-input"
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(e.target.value);
              }
            }}
          />
          <Button
            type="primary"
            className="search-button"
            onClick={() => handleSearch(searchValue)}
          >
            Buscar
          </Button>
        </div>

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
                    <Title
                      level={2}
                      className=" carousel-title"
                      style={{ color: "white" }}
                    >
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
          <Title style={{ color: "#00983a" }} level={3}>
            Explora nuestras categorías
          </Title>
          <Row gutter={16}>
            {categories.map((category, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  cover={<img alt={category.title} src={category.img} />}
                  className="category-card"
                  onClick={() => handleCategoryClick(category.title)}
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
                apoya a nuestros agricultores y cuida del medio ambiente.
              </Paragraph>
              <Button type="primary" size="large" className="Boton_mas">
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
        </div>

        {/* Modal de selección de usuario */}
        <Modal
          title={<img src="/images/1.png" alt="Logo" className="modal-logo" />}
          visible={isModalVisible}
          closable={false}
          footer={null}
        >
          <div className="modal-text">
            Por el momento, nuestros servicios están disponibles únicamente en
            <span className="modal-body-highlight"> Chía</span> y
            <span className="modal-body-highlight"> Cajicá</span>. ¡Gracias por
            tu comprensión!
          </div>
          <div className="user-type-selection">
            <Title level={5}>Selecciona tu tipo de usuario:</Title>
            <Row gutter={[16, 16]} justify="center">
              {Object.keys(userTypeCarouselItems).map((type, index) => (
                <Col xs={24} sm={12} md={12} key={index}>
                  <Button
                    type={userType === type ? "primary" : "default"}
                    onClick={() => handleUserTypeChange(type)}
                    className="user-type-button"
                  >
                    {type}
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        </Modal>

        <InstallPrompt />
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Home;
