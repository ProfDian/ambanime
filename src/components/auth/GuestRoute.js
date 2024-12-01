// src/components/auth/GuestRoute.js
export const GuestRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const location = useLocation();
  
    if (currentUser) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  
    return children;
  };