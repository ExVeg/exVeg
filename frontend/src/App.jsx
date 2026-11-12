import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import MainLayout from './layouts/MainLayout';
import ProductDetails from './pages/ProductDetails';
import Nursery from './pages/Nursery';
import Tools from './pages/Tools';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
import AdminDashboardAgriMarketConnect from './pages/AdminDashboardAgriMarketConnect';
import BuyerRegistrationPersonalInfo from './pages/BuyerRegistrationPersonalInfo';
import CreateYourAccountAgriMarketConnect from './pages/CreateYourAccountAgriMarketConnect';
import ProductApprovalAdminPanel from './pages/ProductApprovalAdminPanel';
import SellerDashboardVendorPortal from './pages/SellerDashboardVendorPortal';
import SellerRegistrationBankDetails from './pages/SellerRegistrationBankDetails';
import SellerRegistrationBusinessDetails from './pages/SellerRegistrationBusinessDetails';
import SellerRegistrationDocumentUpload from './pages/SellerRegistrationDocumentUpload';
import SellerVerificationAdminPanel from './pages/SellerVerificationAdminPanel';
import UserOrderManagementAdminPanel from './pages/UserOrderManagementAdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<CreateYourAccountAgriMarketConnect />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="nursery" element={<Nursery />} />
          <Route path="tools" element={<Tools />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="buyer-dashboard" element={
            <ProtectedRoute roles={['Buyer', 'Seller', 'Admin']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cart" element={<Cart />} />
        </Route>
        
        {/* Admin-only routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute roles={['Admin']}>
            <AdminDashboardAgriMarketConnect />
          </ProtectedRoute>
        } />
        <Route path="/product-approval" element={
          <ProtectedRoute roles={['Admin']}>
            <ProductApprovalAdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/seller-verification" element={
          <ProtectedRoute roles={['Admin']}>
            <SellerVerificationAdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/user-order-management" element={
          <ProtectedRoute roles={['Admin']}>
            <UserOrderManagementAdminPanel />
          </ProtectedRoute>
        } />

        {/* Seller-only routes */}
        <Route path="/seller-dashboard" element={
          <ProtectedRoute roles={['Seller', 'Admin']}>
            <SellerDashboardVendorPortal />
          </ProtectedRoute>
        } />
        <Route path="/seller-bank-details" element={
          <ProtectedRoute roles={['Seller', 'Admin']}>
            <SellerRegistrationBankDetails />
          </ProtectedRoute>
        } />
        <Route path="/seller-business-details" element={
          <ProtectedRoute roles={['Seller', 'Admin']}>
            <SellerRegistrationBusinessDetails />
          </ProtectedRoute>
        } />
        <Route path="/seller-document-upload" element={
          <ProtectedRoute roles={['Seller', 'Admin']}>
            <SellerRegistrationDocumentUpload />
          </ProtectedRoute>
        } />

        {/* Public routes */}
        <Route path="/buyer-registration" element={<BuyerRegistrationPersonalInfo />} />
        <Route path="/create-account" element={<CreateYourAccountAgriMarketConnect />} />
      </Routes>
    </Router>
  );
}

export default App;
