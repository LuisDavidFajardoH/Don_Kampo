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

  const getPriceByUserType = (product, selectedVariation) => {
    if (!selectedVariation) return 0;
    const { quality, quantity } = selectedVariation;
  
    if (!quality || !quantity) return 0; // Si no hay variación seleccionada, retorna 0
  
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
          return selectedProductVariation.price_home; // Valor por defecto
      }
    }
  
    return 0; // Si no se encuentra la variación, retornar 0
  };
  

  // Calcula el valor total del carrito considerando las variaciones
  const cartValue = Object.values(cart).reduce(
    (total, item) =>
      total +
      (item.quantity * getPriceByUserType(item.product, item.selectedVariation) || 0),
    0
  );

  // Función para añadir productos al carrito
  const addToCart = (product, selectedVariation) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const productId = product.product_id;
  
      // Si el producto ya existe en el carrito, actualizamos la cantidad
      if (newCart[productId]) {
        newCart[productId].quantity += 1;
      } else {
        // Si no está en el carrito, lo agrega con la variación seleccionada
        newCart[productId] = { product, quantity: 1, selectedVariation };
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
      const productId = product.product_id;

      if (newCart[productId] && newCart[productId].quantity > 1) {
        newCart[productId].quantity -= 1;
      } else {
        delete newCart[productId];
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
