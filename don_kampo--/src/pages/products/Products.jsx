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
        const response = await axios.get("/api/products", {
          withCredentials: true,
        });

        const processedProducts = response.data.map((product) => ({
          ...product,
          photo: product.photo
            ? `data:image/jpeg;base64,${btoa(
                new Uint8Array(product.photo.data).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              )}`
            : null,
        }));

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);

        const uniqueCategories = [
          "Todas",
          ...new Set(updatedProducts.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);

        const params = new URLSearchParams(location.search);
        const initialCategory = params.get("category");
        const initialSearch = params.get("search");

        if (initialSearch) {
          setSearchQuery(initialSearch);
          filterProducts("Todas", initialSearch, updatedProducts);
        } else if (initialCategory) {
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
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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

  const getSelectedVariationPrice = (product) => {
    const selectedVariationId = selectedVariations[product.product_id];
    if (!selectedVariationId) return null;

    const selectedVariation = product.variations.find(
      (v) => v.variation_id === selectedVariationId
    );
    return selectedVariation ? getPriceByUserType(selectedVariation) : null;
  };

  const handleVariationChange = (productId, variationId) => {
    console.log("Cambio de variación:", { productId, variationId });
    setSelectedVariations((prev) => ({
      ...prev,
      [productId]: variationId,
    }));
  };

  const handleAddToCart = (product) => {
    const selectedVariation = product.variations.find(
      (v) => v.variation_id === selectedVariations[product.product_id]
    );

    if (!selectedVariation) {
      message.error(
        "Por favor selecciona una variación antes de añadir al carrito."
      );
      return;
    }

    addToCart({ ...product, selectedVariation });
  };

  useEffect(() => {
    console.log("Estado del carrito:", cart);
  }, [cart]);

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
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

                <div className="product-variations">
                  <Select
                    placeholder="Selecciona calidad"
                    onChange={(value) =>
                      setSelectedVariation({
                        ...selectedVariation,
                        [product.product_id]: {
                          ...selectedVariation[product.product_id],
                          quality: value,
                        },
                      })
                    }
                    size="large"
                    style={{ width: "100%", marginBottom: 10 }}
                  >
                    {product.variations.map((variation) => (
                      <Option key={variation.variation_id} value={variation.quality}>
                        {variation.quality}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Selecciona cantidad"
                    onChange={(value) =>
                      setSelectedVariation({
                        ...selectedVariation,
                        [product.product_id]: {
                          ...selectedVariation[product.product_id],
                          quantity: value,
                        },
                      })
                    }
                    size="large"
                    style={{ width: "100%", marginBottom: 10 }}
                  >
                    {product.variations.map((variation) => (
                      <Option key={variation.variation_id} value={variation.quantity}>
                        {variation.quantity}
                      </Option>
                    ))}
                  </Select>
                </div>

                <p className="product-price">
                  {getSelectedVariationPrice(product) !== null
                    ? `$${parseFloat(
                        getSelectedVariationPrice(product)
                      ).toLocaleString()}`
                    : "Selecciona una variación para ver el precio."}
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
