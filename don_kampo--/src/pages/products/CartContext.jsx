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

  const addToCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.product_id]) {
        // Usa product.product_id en lugar de product.id
        newCart[product.product_id].quantity += 1;
      } else {
        newCart[product.product_id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
  };

  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (
        newCart[product.product_id] &&
        newCart[product.product_id].quantity > 1
      ) {
        // Usa product.product_id
        newCart[product.product_id].quantity -= 1;
      } else {
        delete newCart[product.product_id];
      }
      return newCart;
    });
  };

  const cartCount = Object.values(cart).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
