import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import { Card, Button, message, Select, Input, Pagination } from "antd";
import axios from "axios";
import { useCart } from "../../pages/products/CartContext";
import "./Products.css";

const { Option } = Select;

const Products = () => {
  // Estados para manejar productos y filtros
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVariations, setSelectedVariations] = useState({});

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Número de productos por página

  // Cálculo de los índices para paginar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const { cart, addToCart, removeFromCart } = useCart();

  const userType = JSON.parse(localStorage.getItem("loginData"))?.user
    ?.user_type;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://3.22.98.109:8080/api/products",
          {
            withCredentials: true,
          }
        );

        // Generar `variation_id` único si no existe
        const updatedProducts = response.data.map((product) => ({
          ...product,
          variations: product.variations.map((variation, index) => ({
            ...variation,
            variation_id: `${product.product_id}-${index}`, // ID único
          })),
        }));

        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);

        const uniqueCategories = [
          "Todas",
          ...new Set(updatedProducts.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);

        const params = new URLSearchParams(window.location.search);
        const initialCategory = params.get("category");
        const initialSearch = params.get("search");

        if (initialSearch) {
          setSearchQuery(initialSearch);
          filterProducts("Todas", initialSearch, updatedProducts);
        } else if (initialCategory) {
          setSelectedCategory(initialCategory);
          filterProducts(initialCategory, "", updatedProducts);
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
    setCurrentPage(1); // Reiniciar a la página 1 cuando se filtra
  };

  useEffect(() => {
    filterProducts(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const getBase64Image = (photoUrl) => {
    // Si no hay URL, usar una imagen predeterminada desde public/images
    return photoUrl || `${process.env.PUBLIC_URL}/images/icon.png`;
  };

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
        return product.price_home;
    }
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
    const selectedVariationId = selectedVariations[product.product_id];
    const selectedVariation = product.variations.find(
      (v) => v.variation_id === selectedVariationId
    );
  
    if (!selectedVariation) {
      message.error("Por favor selecciona una variación antes de añadir al carrito.");
      return;
    }
  
    addToCart({
      ...product,
      selectedVariation,
    });
  };
  

  useEffect(() => {
    console.log("Estado del carrito:", cart);
  }, [cart]);

  const handleRemoveFromCart = (product) => {
    console.log("Producto enviado a removeFromCart:", product);
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
          <>
            {/* Mapeo de productos paginados */}
            {currentProducts.map((product) => (
              <Card
                key={product.product_id}
                className="product-card"
                hoverable
                cover={
                  <img
                    alt={product.name}
                    src={getBase64Image(product.photo_url)}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "200px",
                    }}
                  />
                }
              >
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h3 className="product-name">{product.name}</h3>

                  <Select
                    placeholder="Selecciona una variación"
                    style={{ width: "100%", marginBottom: 8 }}
                    onChange={(value) =>
                      handleVariationChange(product.product_id, value)
                    }
                    value={selectedVariations[product.product_id] || undefined}
                  >
                    {product.variations.map((variation) => (
                      <Option
                        key={variation.variation_id}
                        value={variation.variation_id}
                      >
                        {`${variation.quality} - ${variation.quantity}`}
                      </Option>
                    ))}
                  </Select>

                  <p className="product-price">
                    {getSelectedVariationPrice(product) !== null
                      ? `$${parseFloat(
                          getSelectedVariationPrice(product)
                        ).toLocaleString()}`
                      : "Selecciona una variación para ver el precio."}
                  </p>

                  {cart[
                    `${product.product_id}-${
                      selectedVariations[product.product_id]
                    }`
                  ] ? (
                    <div className="quantity-controls">
                      <Button
                        onClick={() =>
                          handleRemoveFromCart({
                            ...product,
                            selectedVariation: product.variations.find(
                              (v) =>
                                v.variation_id ===
                                selectedVariations[product.product_id]
                            ),
                          })
                        }
                      >
                        -
                      </Button>

                      <span className="quantity-text">
                        {
                          cart[
                            `${product.product_id}-${
                              selectedVariations[product.product_id]
                            }`
                          ].quantity
                        }
                      </span>
                      <Button
                        onClick={() =>
                          handleAddToCart({
                            ...product,
                            selectedVariation: product.variations.find(
                              (v) =>
                                v.variation_id ===
                                selectedVariations[product.product_id]
                            ),
                          })
                        }
                        className="quantity-button"
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => handleAddToCart(product)}
                      className="add-to-cart-button"
                    >
                      Añadir al carrito
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Componente de paginación */}
      {!loading && (
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredProducts.length}
          onChange={(page) => setCurrentPage(page)}
          className="pagination"
        />
      )}

      <BotonWhatsapp />
      <CustomFooter />
    </>
  );
};

export default Products;
