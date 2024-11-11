import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Products from './pages/products/Products';
import Cart from './pages/cart/Cart.jsx';
import Checkout from './pages/chekOut/Checkout.jsx';
import CreateProduct from './pages/createProduct/CreateProduct.jsx';
import { CartProvider } from './pages/products/CartContext.jsx';
import './App.css';


const App = () => {
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
      </Routes>
      </CartProvider>
    </Router>

  );
};

export default App;
