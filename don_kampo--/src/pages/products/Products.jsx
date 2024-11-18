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
  const [selectedVariation, setSelectedVariation] = useState({});
  const [quantities, setQuantities] = useState({});
  const [totalPrices, setTotalPrices] = useState({});

  const { cart, addToCart } = useCart();
  const userType = JSON.parse(localStorage.getItem("loginData"))?.user?.user_type;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/products", {
          withCredentials: true,
        });

        const processedProducts = response.data.map((product) => ({
          ...product,
          photo: product.photo
            ? URL.createObjectURL(
                new Blob([new Uint8Array(product.photo.data)], {
                  type: "image/jpeg",
                })
              )
            : null,
        }));

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);

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

        if (initialCategory) {
          setSelectedCategory(initialCategory);
          filterProducts(initialCategory, searchQuery, processedProducts);
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

  const getPriceByUserType = (product, selectedVariation) => {
    if (!selectedVariation) return 0;
    const { quality, quantity } = selectedVariation;

    if (!quality || !quantity) return 0;

    const selectedProductVariation = product.variations.find(
      (variation) => variation.quality === quality && variation.quantity === quantity
    );

    if (selectedProductVariation) {
      switch (userType) {
        case "hogar":
          return selectedProductVariation.price_home;
        case "supermercado":
          return selectedProductVariation.price_supermarket;
        case "restaurante":
          return selectedProductVariation.price_restaurant;
        case "fruver":
          return selectedProductVariation.price_fruver;
        default:
          return selectedProductVariation.price_home;
      }
    }

    return 0;
  };

  const updateQuantity = (productId, increment) => {
    setQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      const currentQuantity = updatedQuantities[productId] || 0;
      updatedQuantities[productId] = Math.max(currentQuantity + increment, 0);
      return updatedQuantities;
    });

    setTotalPrices((prevTotalPrices) => {
      const updatedTotalPrices = { ...prevTotalPrices };
      const product = products.find((p) => p.product_id === productId);
      const selectedVariationForProduct = selectedVariation[productId];
      const unitPrice = getPriceByUserType(product, selectedVariationForProduct);
      const quantity = (quantities[productId] || 0) + increment;

      updatedTotalPrices[productId] = unitPrice * Math.max(quantity, 0);
      return updatedTotalPrices;
    });
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
                product.photo ? (
                  <img
                    alt={product.name}
                    src={product.photo}
                    style={{ height: "200px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="placeholder-image">Imagen no disponible</div>
                )
              }
            >
              <div className="product-info">
                <p className="product-category">{product.category}</p>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                <p className="product-price">
                  Precio total: $
                  {(totalPrices[product.product_id] || 0).toLocaleString()}
                </p>
                {/* Más lógica para variaciones */}
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
