import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Products from './pages/products/Products';
import Cart from './pages/cart/Cart.jsx';
import Checkout from './pages/chekOut/Checkout.jsx';
import CreateProduct from './pages/createProduct/CreateProduct.jsx';
import Profile from './pages/proflile/Profile.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import { CartProvider } from './pages/products/CartContext.jsx';
import './App.css';

const App = () => {
  const userType = JSON.parse(localStorage.getItem("loginData"))?.user?.user_type;

  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/createproduct" element={<CreateProduct />} />
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
      </CartProvider>
    </Router>
  );
};

export default App;
