import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Carousel, Button, Card, Typography, Modal } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import InstallPrompt from "../install/InstallPrompt";
import "./Home.css";

const { Title, Paragraph } = Typography;

const defaultCarouselItems = [
  {
    img: "/images/default1.webp",
    title: "Bienvenidos",
    description: "Explora nuestros productos de calidad",
    link: "/products",
  },
];

const userTypeCarouselItems = {
  Fruver: [
    {
      img: "/images/frutasImportadas.jpg",
      title: "Frutas Frescas",
      description: "Lo mejor para tu fruver",
      link: "/products?category=Frutas",
    },
    {
      img: "/images/organicas.webp",
      title: "Verduras Orgánicas",
      description: "Cultivadas con amor",
      link: "/products?category=Verduras",
    },
  ],
  Hogar: [
    {
      img: "/images/leche.webp",
      title: "Calidad para tu hogar",
      description: "Frutas y verduras seleccionadas",
      link: "/products?category=Frutas",
    },
    {
      img: "/images/slider.jpg",
      title: "Todo lo que necesitas",
      description: "Directamente a tu mesa",
      link: "/products",
    },
  ],
  Restaurante: [
    {
      img: "/images/leche.webp",
      title: "Provisión para restaurantes",
      description: "Suministros frescos y en cantidad",
      link: "/products",
    },
    {
      img: "/images/slider.jpg",
      title: "Calidad Garantizada",
      description: "Los mejores productos para tus clientes",
      link: "/products",
    },
  ],
  Supermercado: [
    {
      img: "/images/verdurasProducto.jpg",
      title: "Abastecimiento total",
      description: "Productos frescos y de calidad",
      link: "/products",
    },
    {
      img: "/images/calidad.webp",
      title: "Ofertas exclusivas",
      description: "Suministros para supermercados",
      link: "/products",
    },
  ],
};

const Home = () => {
  const carouselRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userType, setUserType] = useState(null); // Estado para rastrear el tipo de usuario seleccionado
  const [carouselItems, setCarouselItems] = useState(defaultCarouselItems); // Items del carrusel dinámico
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  useEffect(() => {
    setIsModalVisible(true); // Muestra el modal al cargar la página
  }, []);

  const handleOk = () => {
    if (userType) {
      setIsModalVisible(false); // Cierra el modal si hay una selección
      setCarouselItems(userTypeCarouselItems[userType]); // Actualiza los items del carrusel según el usuario
      console.log(`Tipo de usuario seleccionado: ${userType}`);
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type); // Actualiza el estado con el tipo seleccionado
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
                    <Title
                      level={2}
                      className="carousel-title"
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

        {/* Modal con selección de tipo de usuario */}
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
              disabled={!userType} // Deshabilita si no se selecciona un tipo
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
          <div className="user-type-selection">
            <Title level={5}>Selecciona tu tipo de usuario:</Title>
            <div className="user-type-options">
              {Object.keys(userTypeCarouselItems).map((type) => (
                <Button
                  key={type}
                  type={userType === type ? "primary" : "default"} // Resalta el seleccionado
                  onClick={() => handleUserTypeChange(type)}
                  className="user-type-button"
                  style={{ gap: 40 }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </Modal>
      </div>
      <BotonWhatsapp />
      <CustomFooter />
      <InstallPrompt />
    </>
  );
};

export default Home;
