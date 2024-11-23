import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    return storedCart || {}; // Inicializa como objeto vacío si el carrito no existe
  });

  // Actualizar el localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Función para obtener el precio según el tipo de usuario
  const getPriceByUserType = (item) => {
    const userType = JSON.parse(localStorage.getItem("loginData"))?.user
      ?.user_type;
    if (!item) return 0; // Si el elemento es indefinido, retornar 0
    switch (userType) {
      case "hogar":
        return parseFloat(item.price_home);
      case "supermercado":
        return parseFloat(item.price_supermarket);
      case "restaurante":
        return parseFloat(item.price_restaurant);
      case "fruver":
        return parseFloat(item.price_fruver);
      default:
        return parseFloat(item.price_home);
    }
  };

  // Calcula el valor total del carrito en pesos colombianos
  const cartValue = Object.values(cart).reduce(
    (total, item) => total + item.quantity * (item.price || 0),
    0
  );

  // Función para añadir productos al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };

      if (!product?.selectedVariation) {
        console.error('Error: No hay variación seleccionada');
        return prevCart;
      }

      const cartKey = `${product.product_id}-${product.selectedVariation.variation_id}`;

      if (newCart[cartKey]) {
        newCart[cartKey] = {
          ...newCart[cartKey],
          quantity: newCart[cartKey].quantity + 1
        };
      } else {
        newCart[cartKey] = {
          product_id: product.product_id,
          selectedVariation: product.selectedVariation,
          quantity: 1,
          price: getPriceByUserType(product.selectedVariation)
        };
      }

      return newCart;
    });
  };

  useEffect(() => {
    const cartValue = Object.values(cart).reduce(
      (total, item) => total + item.quantity * (item.price || 0),
      0
    );
    console.log("Valor total del carrito:", cartValue);
  }, [cart]);

  // Función para limpiar el carrito
  const clearCart = () => {
    setCart({});
  };

  // Función para eliminar productos del carrito
  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const cartKey = `${product.product_id}-${product.selectedVariation.variation_id}`;

      if (newCart[cartKey]) {
        if (newCart[cartKey].quantity > 1) {
          newCart[cartKey] = {
            ...newCart[cartKey],
            quantity: newCart[cartKey].quantity - 1
          };
        } else {
          delete newCart[cartKey];
        }
      }

      return newCart;
    });
  };

  // Calcula la cantidad total de artículos en el carrito
  const cartCount = Object.values(cart).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartValue, // Valor total en pesos colombianos
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;