import BusinessNavbar from './NavBar/Business';
import { Outlet } from 'react-router-dom';

const BusinessLayout = ({ children }) => {
    return (
      <div className="flex h-screen">
        <BusinessNavbar />
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
};

export default BusinessLayout;