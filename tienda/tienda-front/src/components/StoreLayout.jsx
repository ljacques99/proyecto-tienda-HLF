import { Outlet } from 'react-router-dom'
import ClientNavbar from './NavBar/Client'

const StoreLayout = () => {
  return (
    <>
      <ClientNavbar />
      <Outlet />
    </>
  );
};

export default StoreLayout