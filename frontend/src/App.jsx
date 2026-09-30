import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { SaveProvider } from "./lib/SaveContext";
import { CompareProvider } from "./lib/CompareContext";
import Nav from "./components/Nav";
import MobileNav from "./components/MobileNav";
import CompareBar from "./components/CompareBar";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import { Navigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Browse from "./pages/Browse";
import Compare from "./pages/Compare";
import RequirementForm from "./pages/RequirementForm";
import Results from "./pages/Results";
import PropertyDetails from "./pages/PropertyDetails";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProperty from "./pages/AdminAddProperty";
import AdminUsers from "./pages/AdminUsers";
import Saved from "./pages/Saved";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminTeam from "./pages/AdminTeam";
import AdminAllProperties from "./pages/AdminAllProperties";

function RootGate() {
  const { session, loading } = useAuth();
  const guestOk = sessionStorage.getItem("guest_continued") === "true";
  if (loading) return null;
  if (!session && !guestOk) return <Navigate to="/login" replace />;
  return <Home />;
}

function ConsumerLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink font-sans pb-16 md:pb-0">
      <Nav />
      {children}
      <CompareBar />
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SaveProvider>
        <CompareProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ConsumerLayout><RootGate /></ConsumerLayout>} />
              <Route path="/browse" element={<ConsumerLayout><Browse /></ConsumerLayout>} />
              <Route path="/compare" element={<ConsumerLayout><Compare /></ConsumerLayout>} />
              <Route path="/requirements" element={<ConsumerLayout><RequirementForm /></ConsumerLayout>} />
              <Route path="/results" element={<ConsumerLayout><Results /></ConsumerLayout>} />
              <Route path="/properties/:id" element={<ConsumerLayout><PropertyDetails /></ConsumerLayout>} />
              <Route path="/analytics" element={<ConsumerLayout><Analytics /></ConsumerLayout>} />
              <Route path="/login" element={<ConsumerLayout><Login /></ConsumerLayout>} />

              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/add" element={<AdminRoute><AdminAddProperty /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/saved" element={<ConsumerLayout><Saved /></ConsumerLayout>} />
              <Route path="/register" element={<ConsumerLayout><Register /></ConsumerLayout>} />
              <Route path="/admin/login" element={<AdminLogin />} />           
              <Route path="/admin/team" element={<AdminRoute><AdminTeam /></AdminRoute>} />
              <Route path="/admin/properties" element={<AdminRoute><AdminAllProperties /></AdminRoute>} />            
            </Routes>
          </BrowserRouter>
        </CompareProvider>
      </SaveProvider>
    </AuthProvider>
  );
}