import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import { Card, Button, message, Select, Input } from "antd";
import axios from "axios";
import { useCart } from "../../pages/products/CartContext";
import "./Products.css";

const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  const { cart, addToCart, removeFromCart } = useCart();

  // Obtener el tipo de usuario desde localStorage
  const userType = JSON.parse(localStorage.getItem("loginData"))?.user
    ?.user_type;

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get("/api/products", {
            withCredentials: true,
          });
          setProducts(response.data);
          setFilteredProducts(response.data);
    
          const uniqueCategories = [
            "Todas",
            "Frutas importadas",
            "Verdura",
            "Frutas nacionales",
            "Hortalizas",
            "Cosecha",
            "Otros",
          ];
          setCategories(uniqueCategories);
    
          const params = new URLSearchParams(location.search);
          const initialCategory = params.get("category");
    
          // Aplica el filtro inicial solo si la categoría es válida
          if (initialCategory) {
            setSelectedCategory(initialCategory);
            filterProducts(initialCategory, searchQuery, response.data); // Pasa los productos cargados directamente
          }
        } catch (error) {
          message.error("Error al cargar los productos.");
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchProducts();
    }, []);
    

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    filterProducts(value, searchQuery);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterProducts(selectedCategory, query);
  };

  const normalizeString = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filterProducts = (category, query, productsToFilter = products) => {
    const filtered = productsToFilter.filter((product) => {
      const matchesCategory =
        category === "Todas" || product.category === category;
      const matchesSearch = normalizeString(product.name).includes(
        normalizeString(query)
      );
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);
  

  

  const getBase64Image = (photo) => {
    if (photo && photo.data) {
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(photo.data))
      );
      return `data:image/jpeg;base64,${base64String}`;
    }
    return "path_to_placeholder_image"; // Cambia este valor si tienes una imagen de placeholder
  };

  // Función para obtener el precio según el tipo de usuario
  const getPriceByUserType = (product) => {
    switch (userType) {
      case "hogar":
        return product.price_home;
      case "supermercado":
        return product.price_supermarket;
      case "restaurante":
        return product.price_restaurant;
      case "fruver":
        return product.price_fruver;
      default:
        return product.price_home; // Valor por defecto
    }
  };

  return (
    <>
      <Navbar />
      <div className="filters-container">
        <Select
          placeholder="Filtrar por categoría"
          style={{ width: 200, marginRight: 16 }}
          onChange={handleCategoryChange}
          value={selectedCategory || "Todas"}
          allowClear
          size="large"
        >
          {categories.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>

        <Input
          placeholder="Buscar productos"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ width: 300 }}
          allowClear
          size="large"
        />
      </div>

      <div className="products-container">
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.product_id}
              className="product-card"
              hoverable
              cover={
                <img alt={product.name} src={getBase64Image(product.photo)} />
              }
            >
              <div className="product-info">
                <p className="product-category">{product.category}</p>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">
                  ${parseFloat(getPriceByUserType(product)).toLocaleString()}
                </p>
                {cart[product.product_id] ? (
                  <div className="quantity-controls">
                    <Button
                      onClick={() => removeFromCart(product)}
                      className="quantity-button"
                    >
                      -
                    </Button>
                    <span className="quantity-text">
                      {cart[product.product_id].quantity}
                    </span>
                    <Button
                      onClick={() => addToCart(product)}
                      className="quantity-button"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => addToCart(product)}
                    className="add-to-cart-button"
                  >
                    Añadir al carrito
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Products;
