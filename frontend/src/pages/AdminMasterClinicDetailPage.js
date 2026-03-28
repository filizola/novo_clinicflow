import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelCard, PanelGrid } from "../components/PanelGrid";
import { ChevronLeft, Plus } from "lucide-react";

const emptyClinicUserForm = {
  name: "",
  email: "",
  password: "",
  roles: "ADMIN_CLINIC",
  user_type: "admin",
  professional_id: "",
  is_admin: true
};

export default function AdminMasterClinicDetailPage() {
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const { isMaster } = useTenant();
  const [loading, setLoading] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({ ...emptyClinicUserForm });

  const loadClinicDetail = async () => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const res = await api.get(`/master/clinics/${clinicId}`);
      setClinic(res.data?.clinic || null);
      setUsers(res.data?.users || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao carregar detalhes da clínica");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    loadClinicDetail();
  }, [isMaster, clinicId]);

  const openNewClinicUser = () => {
    setUserForm({ ...emptyClinicUserForm });
    setShowUserDialog(true);
  };

  const submitClinicUser = async (e) => {
    e.preventDefault();
    if (!userForm.password) {
      toast.error("Senha é obrigatória");
      return;
    }
    const rolesList = (userForm.roles || "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      await api.post(`/master/clinics/${clinicId}/users`, {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        roles: rolesList,
        user_type: userForm.user_type,
        professional_id: userForm.professional_id || null,
        is_admin: Boolean(userForm.is_admin)
      });
      toast.success("Usuário criado");
      setShowUserDialog(false);
      await loadClinicDetail();
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!isMaster) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Master</h1>
          <p className="text-gray-600 mt-2">Acesso restrito a ADMIN_MASTER.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="btn-secondary"
              onClick={() => navigate("/admin-master")}
              disabled={loading}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Detalhes da Clínica</h1>
              <p className="text-gray-600 mt-1">{clinic?.nome_fantasia || clinic?.razao_social || clinicId}</p>
            </div>
          </div>
          <Button onClick={openNewClinicUser} disabled={loading} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {loading && !clinic ? (
          <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ) : (
          <>
            <PanelGrid className="grid-cols-1 lg:grid-cols-2">
              <PanelCard onClick={null} role="region" tabIndex={-1} className="hover:bg-white hover:border-transparent cursor-default">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Cadastro</h2>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-semibold">Nome Fantasia:</span> {clinic?.nome_fantasia || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Razão Social:</span> {clinic?.razao_social || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">CNPJ:</span> {clinic?.cnpj || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {clinic?.status || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Criado em:</span>{" "}
                    {clinic?.created_at ? new Date(clinic.created_at).toLocaleString("pt-BR") : "-"}
                  </div>
                </div>
              </PanelCard>

              <PanelCard onClick={null} role="region" tabIndex={-1} className="hover:bg-white hover:border-transparent cursor-default">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Contato / Endereço</h2>
                <div className="space-y-2 text-gray-700">
                  <div>
                    <span className="font-semibold">Telefone:</span> {clinic?.telefone || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span> {clinic?.email || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Endereço:</span>{" "}
                    {clinic?.endereco?.logradouro || "-"} {clinic?.endereco?.numero || ""}{" "}
                    {clinic?.endereco?.bairro ? `- ${clinic.endereco.bairro}` : ""}
                  </div>
                  <div>
                    <span className="font-semibold">Cidade/UF:</span>{" "}
                    {clinic?.endereco?.cidade || "-"} {clinic?.endereco?.estado || ""}
                  </div>
                  <div>
                    <span className="font-semibold">CEP:</span> {clinic?.endereco?.cep || "-"}
                  </div>
                </div>
              </PanelCard>
            </PanelGrid>

            <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Usuários</h2>
                <Button variant="outline" className="btn-secondary" onClick={loadClinicDetail} disabled={loading}>
                  Atualizar
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-3">Nome</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Tipo</th>
                      <th className="py-2 pr-3">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-gray-500">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="border-b">
                          <td className="py-2 pr-3">{u.name}</td>
                          <td className="py-2 pr-3">{u.email}</td>
                          <td className="py-2 pr-3">{u.user_type || "-"}</td>
                          <td className="py-2 pr-3">{Array.isArray(u.roles) ? u.roles.join(", ") : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Usuário na Clínica</DialogTitle>
            </DialogHeader>

            <form onSubmit={submitClinicUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <Input value={userForm.user_type} onChange={(e) => setUserForm((p) => ({ ...p, user_type: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Roles (separadas por vírgula)</Label>
                  <Input value={userForm.roles} onChange={(e) => setUserForm((p) => ({ ...p, roles: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Professional ID (opcional)</Label>
                  <Input value={userForm.professional_id} onChange={(e) => setUserForm((p) => ({ ...p, professional_id: e.target.value }))} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowUserDialog(false)} disabled={loading} className="btn-secondary">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

