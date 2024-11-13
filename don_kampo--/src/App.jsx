import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Products from "./pages/products/Products";
import Cart from "./pages/cart/Cart.jsx";
import Checkout from "./pages/chekOut/Checkout.jsx";
import CreateProduct from "./pages/createProduct/CreateProduct.jsx";
import Profile from "./pages/proflile/Profile.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import CreateOrder from "./pages/createOrden/CreateOrder.jsx";
import ManageProducts from "./pages/deleteProduct/deleteProduct.jsx";
import Home from "./pages/home/Home.jsx";

import { CartProvider } from "./pages/products/CartContext.jsx";
import "./App.css";

const App = () => {
  const [userType, setUserType] = useState(null);

  // Recuperar datos del usuario al cargar la aplicación
  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("loginData"));
    setUserType(loginData?.user?.user_type || null);
  }, []);

  // Registrar el Service Worker al cargar la aplicación
  useEffect(() => {
    if (
      window.location.protocol === "http:" &&
      window.location.hostname !== "localhost"
    ) {
      console.warn("Service Workers solo funcionan en HTTPS o localhost.");
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado con éxito:", registration);
        })
        .catch((error) => {
          console.error("Error registrando el Service Worker:", error);
        });
    } else {
      console.error("El navegador no soporta Service Workers.");
    }
  }, []);

  return (
    <Router>
      <div id="root">
        <CartProvider>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/createproduct" element={<CreateProduct />} />
              <Route path="/createorder" element={<CreateOrder />} />
              <Route path="/manageproducts" element={<ManageProducts />} />
              {/* Ruta condicional para el perfil */}
              <Route
                path="/profile"
                element={
                  userType === "admin" ? (
                    <AdminProfile />
                  ) : userType ? (
                    <Profile />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </div>
    </Router>
  );
};

export default App;
