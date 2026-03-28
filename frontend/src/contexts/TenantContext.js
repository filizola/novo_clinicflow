import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

const TenantContext = createContext({});

export const TenantProvider = ({ children }) => {
  const { user } = useAuth();

  const value = useMemo(() => {
    const clinicId = user?.clinic_id || null;
    const roles = user?.roles || [];
    const isMaster = roles.includes("ADMIN_MASTER");
    return { clinicId, roles, isMaster };
  }, [user]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => useContext(TenantContext);

