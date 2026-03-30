import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { hasAdminMasterAccess } from "../utils/roles";
import Layout from "./Layout";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If not logged in, it will be caught by PrivateRoute, but just in case
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If not admin_master, redirect to dashboard or show access denied
  if (!hasAdminMasterAccess(user)) {
    // We can redirect to a "Access Denied" page or dashboard
    return (
      <Layout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="max-w-md w-full p-8 bg-white shadow-sm border border-gray-100 rounded-xl text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta página
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return children;
}
