import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import CustomerList from './components/Customers/CustomerList';
import CustomerForm from './components/Customers/CustomerForm';
import CustomerDetail from './components/Customers/CustomerDetail';
import AppLayout from './components/Layout/AppLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div className="page-state">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            )}
          />
          <Route
            path="/customers"
            element={(
              <PrivateRoute>
                <AppLayout>
                  <CustomerList />
                </AppLayout>
              </PrivateRoute>
            )}
          />
          <Route
            path="/customers/new"
            element={(
              <PrivateRoute>
                <AppLayout>
                  <CustomerForm />
                </AppLayout>
              </PrivateRoute>
            )}
          />
          <Route
            path="/customers/:id"
            element={(
              <PrivateRoute>
                <AppLayout>
                  <CustomerDetail />
                </AppLayout>
              </PrivateRoute>
            )}
          />
          <Route
            path="/customers/:id/edit"
            element={(
              <PrivateRoute>
                <AppLayout>
                  <CustomerForm />
                </AppLayout>
              </PrivateRoute>
            )}
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
