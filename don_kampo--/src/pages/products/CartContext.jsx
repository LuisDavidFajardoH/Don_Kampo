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
    if (!selectedVariation || !product.variations) return 0;

    const { quality, quantity } = selectedVariation;
    const selectedProductVariation = product.variations.find(
      (variation) => variation.quality === quality && variation.quantity === quantity
    );

    if (selectedProductVariation) {
      const userType =
        JSON.parse(localStorage.getItem("loginData"))?.user?.user_type || "hogar";
      switch (userType) {
        case "hogar":
          return parseFloat(selectedProductVariation.price_home) || 0;
        case "supermercado":
          return parseFloat(selectedProductVariation.price_supermarket) || 0;
        case "restaurante":
          return parseFloat(selectedProductVariation.price_restaurant) || 0;
        case "fruver":
          return parseFloat(selectedProductVariation.price_fruver) || 0;
        default:
          return parseFloat(selectedProductVariation.price_home) || 0;
      }
    }

    return 0;
  };

  const addToCart = (product, selectedVariation) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const productId = product.product_id;

      if (newCart[productId]) {
        newCart[productId].quantity += 1;
      } else {
        newCart[productId] = { product, quantity: 1, selectedVariation };
      }

      return newCart;
    });
  };

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

  const clearCart = () => {
    setCart({});
  };

  const cartCount = Object.values(cart).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const cartValue = Object.values(cart).reduce(
    (total, item) =>
      total +
      (item.quantity * getPriceByUserType(item.product, item.selectedVariation) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getPriceByUserType,
        cartCount,
        cartValue,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
