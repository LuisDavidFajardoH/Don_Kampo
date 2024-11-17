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
  const getPriceByUserType = (product) => {
    const userType = JSON.parse(localStorage.getItem("loginData"))?.user?.user_type;
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

  // Calcula el valor total del carrito en pesos colombianos
  const cartValue = Object.values(cart).reduce(
    (total, item) =>
      total + (item.quantity * parseFloat(getPriceByUserType(item)) || 0),
    0
  );

  // Función para añadir productos al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.product_id]) {
        newCart[product.product_id].quantity += 1;
      } else {
        newCart[product.product_id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
  };

  // Función para limpiar el carrito
  const clearCart = () => {
    setCart({});
  };

  // Función para eliminar productos del carrito
  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.product_id] && newCart[product.product_id].quantity > 1) {
        newCart[product.product_id].quantity -= 1;
      } else {
        delete newCart[product.product_id];
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