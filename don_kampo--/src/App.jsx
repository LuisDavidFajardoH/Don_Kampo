import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Products from './pages/products/Products';
import { CartProvider } from './pages/products/CartContext.jsx';


const App = () => {
  return (
    
    <Router>
      <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
      </Routes>
      </CartProvider>
    </Router>

  );
};

export default App;
