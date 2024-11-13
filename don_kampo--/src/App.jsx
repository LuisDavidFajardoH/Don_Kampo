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

  useEffect(() => {
    const loginData = JSON.parse(localStorage.getItem("loginData"));
    setUserType(loginData?.user?.user_type || null);
  }, []);

  useEffect(() => {
    if (
      window.location.protocol === "http:" &&
      window.location.hostname !== "localhost"
    ) {
      console.warn("Service Workers solo funcionan en HTTPS o localhost.");
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
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

  // Manejo del evento beforeinstallprompt
  useEffect(() => {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); // Evita que el navegador muestre el prompt automáticamente
      deferredPrompt = e; // Guarda el evento para usarlo más tarde
      const installButton = document.getElementById("install-button");
      if (installButton) {
        installButton.style.display = "block"; // Muestra el botón de instalación
        installButton.addEventListener("click", () => {
          deferredPrompt.prompt(); // Muestra el prompt de instalación
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              console.log("El usuario aceptó instalar la app");
            } else {
              console.log("El usuario rechazó instalar la app");
            }
            deferredPrompt = null;
          });
        });
      }
    });
  }, []);

  return (
    <Router>
      <div id="root">
        <CartProvider>
          <div className="main-content">
            {/* Botón de instalación */}
            <button id="install-button" style={{ display: "none" }}>
              Instalar App
            </button>

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
