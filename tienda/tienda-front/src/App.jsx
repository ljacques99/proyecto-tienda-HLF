import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from './routes/Home';
import ProtectedRoute from './components/ProtectedRoute'

import SignUp from "./routes/SignUp";
import Login from './routes/Login';

import Products from "./routes/Clients/Products";
import ClientInvoices from "./routes/Clients/Invoices";

import Basket from "./routes/Clients/Basket";
import { BasketProvider } from "./context/BasketContext";

import Store from "./routes/Store"
import StoreLayout from "./components/StoreLayout";

import Business from "./routes/Business"
import Dashboard from "./routes/Merchants/Dashboard";
import BusinessLayout from "./components/BusinessLayout";
import BusinessProducts from "./routes/Merchants/Products"
import BusinessInvoices from "./routes/Merchants/Invoices"

// Crear un enrutador
const router = createBrowserRouter([
  {
    path: '*',
    element: <ProtectedRoute redirectIfAuthenticated={true} ><Home /></ProtectedRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute redirectIfAuthenticated={true} ><Home /></ProtectedRoute>,
  },
  {
    path: '/business',
    children: [
      {
        path: '',
        element: <ProtectedRoute redirectIfAuthenticated={true}><Business /></ProtectedRoute>
      },
      {
        path: 'login',
        element: <ProtectedRoute redirectIfAuthenticated={true}><Login userType="business"/></ProtectedRoute>,
      },
      {
        path: 'signup',
        element: <ProtectedRoute redirectIfAuthenticated={true}><SignUp userType="business"/></ProtectedRoute>,
      },
      {
        path: 'dashboard',
        element: <BusinessLayout />,
        children: [
          {
            path: '',
            element: <ProtectedRoute userTypeRequired="business"><Dashboard /></ProtectedRoute>
          },
          {
            path: 'products',
            element: <ProtectedRoute userTypeRequired="business"><BusinessProducts /></ProtectedRoute>
          },
          {
            path: 'invoices',
            element: <ProtectedRoute userTypeRequired="business"><BusinessInvoices /></ProtectedRoute>
          }
        ]
      }
     
    ]
  },
  {
    path: '/store',
    element: <StoreLayout />,
    children: [
      {
        path: '',
        element: <ProtectedRoute redirectIfAuthenticated={true}><Store /></ProtectedRoute>
      },
      {
        path: 'login',
        element: <ProtectedRoute redirectIfAuthenticated={true}><Login userType="client"/></ ProtectedRoute>
      },
      {
        path: 'signup',
        element: <ProtectedRoute redirectIfAuthenticated={true}><SignUp userType="client"/></ProtectedRoute>,
      },
      {
        path: 'basket',
        element: <ProtectedRoute userTypeRequired="client"><Basket /></ProtectedRoute>
      },
      {
        path: 'products',
        element: <ProtectedRoute userTypeRequired="client"><Products /></ProtectedRoute>
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute userTypeRequired="client"><ClientInvoices /></ProtectedRoute>
      }
    ]
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