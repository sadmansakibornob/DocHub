import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ArticleDetails from "./pages/ArticleDetails";
import EditArticle from "./pages/EditArticle";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Read full article */}
          <Route
            path="/articles/:id"
            element={<ArticleDetails />}
          />

          {/* Edit article */}
          <Route element={<ProtectedRoute allowedRoles={["contributor", "admin"]} />}>
            <Route
              path="/articles/:id/edit"
              element={<EditArticle />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;