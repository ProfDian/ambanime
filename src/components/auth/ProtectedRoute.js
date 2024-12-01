const ProtectedRoute = ({ children }) => {
    const { currentUser, isGuest, loading } = useAuth();
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (!currentUser && !isGuest) {
      return <Navigate to="/login" />;
    }
  
    return children;
  };