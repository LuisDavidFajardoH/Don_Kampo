import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { Card, Button, message, Select, Input } from "antd";
import axios from "axios";
import { useCart } from "../../pages/products/CartContext"; // Usa el contexto del carrito
import "./Products.css";

const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Usa funciones de contexto del carrito
  const { cart, addToCart, removeFromCart } = useCart();

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
          ...new Set(response.data.map((product) => product.category)),
        ];
        
        setCategories(uniqueCategories);
      } catch (error) {
        message.error("Error al cargar los productos.");
        console.error("el error es: ", error);
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
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filterProducts = (category, query) => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        category === "Todas" || product.category === category;
      const matchesSearch = normalizeString(product.name).includes(
        normalizeString(query)
      );
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  };

  // Función para convertir el buffer en una URL base64 para la imagen
  const getBase64Image = (photo) => {
    if (photo && photo.data) {
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(photo.data))
      );
      console.log("base64String", base64String);
      return `data:image/jpeg;base64,${base64String}`;
    }
    return "path_to_placeholder_image";
  };
  
  

  return (
    <>
      <Navbar />
      <div className="filters-container">
        <Select
          placeholder="Filtrar por categoría"
          style={{ width: 200, marginRight: 16 }}
          onChange={handleCategoryChange}
          value={selectedCategory}
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
              cover={<img alt={product.name} src={getBase64Image(product.photo)} />}

            >
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-category">
                  <strong>Categoría:</strong> {product.category}
                </p>
                {cart[product.product_id] ? (
                  <div className="quantity-controls">
                    <Button
                      onClick={() => removeFromCart(product)}
                      className="remove-from-cart-button"
                    >
                      -
                    </Button>
                    <span>{cart[product.product_id].quantity}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      className="add-to-cart-button"
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
    </>
  );
};

export default Products;
