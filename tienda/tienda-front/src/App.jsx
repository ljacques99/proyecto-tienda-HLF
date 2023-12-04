import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from './routes/Home'; // Asegúrate de tener un componente Home
import Login from './routes/Login';
import Navbar from "./components/NavBar";
import Products from "./routes/Products";
import Shop from "./routes/Shop";
import Basket from "./routes/Basket";
import { BasketProvider } from "./context/BasketContext";

// Crear un enrutador
const router = createBrowserRouter([
  {
    path: '/',
    element: <><Navbar /><Home /></>,
  },
  {
    path: '/login',
    element: <><Navbar /><Login /></>,
  },
  {
    path: '/products',
    element: <><Navbar /><Products /></>,
  },
  {
    path: '/shop',
    element: <><Navbar /><Shop /></>,
  },
  {
    path: '/basket',
    element: <><Navbar /><Basket /></>,
  }
]);

const App = () => {
  return (
    <>
    <AuthProvider>
      <BasketProvider>
        <RouterProvider router={router} />
      </BasketProvider>
    </AuthProvider>
    </>
  );
};

export default App;