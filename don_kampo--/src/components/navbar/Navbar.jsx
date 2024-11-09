import React, { useEffect, useState } from "react";
import { Layout, Menu, Drawer, Button, Badge } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../pages/products/CartContext"; // Importa el hook de contexto de carrito
import "./Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el loginData del localStorage
  const loginData = JSON.parse(localStorage.getItem("loginData"));
  const isLoggedIn = Boolean(loginData && loginData.user);

  // Estado para la ruta seleccionada y para el drawer en pantallas pequeñas
  const [selectedKey, setSelectedKey] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Obtener el cartCount desde el contexto del carrito
  const { cartCount } = useCart();

  // Efecto para actualizar la ruta seleccionada en el menú
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case "/home":
        setSelectedKey("home");
        break;
      case "/products":
        setSelectedKey("products");
        break;
      case "/profile":
        setSelectedKey("profile");
        break;
      case "/login":
        setSelectedKey("login");
        break;
      case "/register":
        setSelectedKey("register");
        break;
      default:
        setSelectedKey("home");
        break;
    }
  }, [location.pathname]);

  // Función para manejar el clic en el menú y cambiar la ruta
  const handleMenuClick = (key, route) => {
    setSelectedKey(key);
    navigate(route);
    setDrawerVisible(false); // Cierra el Drawer si se selecciona un elemento
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("loginData");
    handleMenuClick("login", "/login");
  };

  return (
    <Header className="navbar">
      <div className="logo" onClick={() => handleMenuClick("home", "/home")}>
        Don Kampo
      </div>

      {/* Menú para pantallas grandes */}
      <div className="menu-desktop">
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          className="menu"
        >
          <Menu.Item
            key="home"
            icon={<HomeOutlined />}
            onClick={() => handleMenuClick("home", "/home")}
          >
            Inicio
          </Menu.Item>
          <Menu.Item
            key="products"
            icon={<AppstoreOutlined />}
            onClick={() => handleMenuClick("products", "/products")}
          >
            Productos
          </Menu.Item>

          <Menu.Item
            key="cart"
            onClick={() => handleMenuClick("cart", "/cart")}
          >
            <Badge count={cartCount} offset={[10, 0]}>
              <ShoppingCartOutlined
                style={{ fontSize: "18px", color: "white" }}
              />
            </Badge>
          </Menu.Item>

          {isLoggedIn ? (
            <>
              <Menu.Item
                key="profile"
                icon={<UserOutlined />}
                onClick={() => handleMenuClick("profile", "/profile")}
              >
                {loginData.user.user_name}
              </Menu.Item>
              <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                key="login"
                onClick={() => handleMenuClick("login", "/login")}
              >
                Iniciar Sesión
              </Menu.Item>
              <Menu.Item
                key="register"
                onClick={() => handleMenuClick("register", "/register")}
              >
                Registrarse
              </Menu.Item>
            </>
          )}
        </Menu>
      </div>

      {/* Ícono de menú para pantallas pequeñas */}
      <Button
        className="menu-mobile-button"
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setDrawerVisible(true)}
      />

      {/* Drawer para el menú colapsable en pantallas pequeñas */}
      <Drawer
        title="Menú"
        placement="right"
        closable
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <Menu theme="light" mode="vertical" selectedKeys={[selectedKey]}>
          <Menu.Item
            key="home"
            icon={<HomeOutlined />}
            onClick={() => handleMenuClick("home", "/home")}
          >
            Inicio
          </Menu.Item>
          <Menu.Item
            key="products"
            icon={<AppstoreOutlined />}
            onClick={() => handleMenuClick("products", "/products")}
          >
            Productos
          </Menu.Item>

          <Menu.Item key="cart" onClick={() => navigate("/cart")}>
            <Badge count={cartCount} offset={[10, 0]}>
              <ShoppingCartOutlined
                style={{ fontSize: "18px", color: "#00983A" }}
              />
            </Badge>
          </Menu.Item>

          {isLoggedIn ? (
            <>
              <Menu.Item
                key="profile"
                icon={<UserOutlined />}
                onClick={() => handleMenuClick("profile", "/profile")}
              >
                {loginData.user.user_name}
              </Menu.Item>
              <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                key="login"
                onClick={() => handleMenuClick("login", "/login")}
              >
                Iniciar Sesión
              </Menu.Item>
              <Menu.Item
                key="register"
                onClick={() => handleMenuClick("register", "/register")}
              >
                Registrarse
              </Menu.Item>
            </>
          )}
        </Menu>
      </Drawer>
    </Header>
  );
};

export default Navbar;
