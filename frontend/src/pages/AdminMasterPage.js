import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyAddress = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "BR"
};

const emptyClinicForm = {
  nome_fantasia: "",
  razao_social: "",
  cnpj: "",
  telefone: "",
  email: "",
  status: "active",
  endereco: { ...emptyAddress }
};

const emptyClinicUserForm = {
  name: "",
  email: "",
  password: "",
  roles: "ADMIN_CLINIC",
  user_type: "admin",
  professional_id: "",
  is_admin: true
};

export default function AdminMasterPage() {
  const { isMaster } = useTenant();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [clinicUsers, setClinicUsers] = useState([]);

  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [clinicForm, setClinicForm] = useState({ ...emptyClinicForm });

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({ ...emptyClinicUserForm });

  const selectedClinic = useMemo(() => clinics.find((c) => c.id === selectedClinicId) || null, [clinics, selectedClinicId]);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/clinics");
      setClinics(res.data || []);
      if (!selectedClinicId && res.data?.length) {
        setSelectedClinicId(res.data[0].id);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao carregar clínicas");
    } finally {
      setLoading(false);
    }
  };

  const loadClinicUsers = async (clinicId) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const res = await api.get(`/master/clinics/${clinicId}/users`);
      setClinicUsers(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao carregar usuários da clínica");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    loadClinics();
  }, [isMaster]);

  useEffect(() => {
    if (!isMaster) return;
    if (!selectedClinicId) return;
    loadClinicUsers(selectedClinicId);
  }, [isMaster, selectedClinicId]);

  const openNewClinic = () => {
    setEditingClinic(null);
    setClinicForm({ ...emptyClinicForm, endereco: { ...emptyAddress } });
    setShowClinicDialog(true);
  };

  const openEditClinic = (clinic) => {
    setEditingClinic(clinic);
    setClinicForm({
      nome_fantasia: clinic.nome_fantasia || "",
      razao_social: clinic.razao_social || "",
      cnpj: clinic.cnpj || "",
      telefone: clinic.telefone || "",
      email: clinic.email || "",
      status: clinic.status || "active",
      endereco: { ...emptyAddress, ...(clinic.endereco || {}) }
    });
    setShowClinicDialog(true);
  };

  const submitClinic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingClinic) {
        await api.put(`/master/clinics/${editingClinic.id}`, clinicForm);
        toast.success("Clínica atualizada");
      } else {
        const res = await api.post("/master/clinics", clinicForm);
        toast.success("Clínica criada");
        if (res.data?.id) setSelectedClinicId(res.data.id);
      }
      setShowClinicDialog(false);
      await loadClinics();
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao salvar clínica");
    } finally {
      setLoading(false);
    }
  };

  const openNewClinicUser = () => {
    if (!selectedClinicId) return;
    setUserForm({ ...emptyClinicUserForm });
    setShowUserDialog(true);
  };

  const submitClinicUser = async (e) => {
    e.preventDefault();
    if (!selectedClinicId) return;
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
      await api.post(`/master/clinics/${selectedClinicId}/users`, {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        roles: rolesList,
        user_type: userForm.user_type,
        professional_id: userForm.professional_id || null,
        is_admin: Boolean(userForm.is_admin)
      });
      toast.success("Usuário criado na clínica");
      setShowUserDialog(false);
      await loadClinicUsers(selectedClinicId);
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao criar usuário na clínica");
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Master</h1>
            <p className="text-gray-600 mt-1">Gerencie clínicas e usuários por clínica</p>
          </div>
          <Button onClick={openNewClinic} disabled={loading}>
            Nova Clínica
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Clínicas</h2>
              <Button variant="outline" onClick={loadClinics} disabled={loading}>
                Atualizar
              </Button>
            </div>

            <div className="space-y-2">
              {clinics.length === 0 ? (
                <div className="text-gray-500">Nenhuma clínica cadastrada</div>
              ) : (
                clinics.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClinicId(c.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      selectedClinicId === c.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{c.nome_fantasia}</div>
                        <div className="text-sm text-gray-600 truncate">{c.razao_social}</div>
                        <div className="text-xs text-gray-500 truncate">CNPJ: {c.cnpj}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditClinic(c);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Usuários da Clínica</h2>
                <div className="text-sm text-gray-600">
                  {selectedClinic ? `${selectedClinic.nome_fantasia} (${selectedClinic.id})` : "Selecione uma clínica"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => loadClinicUsers(selectedClinicId)} disabled={!selectedClinicId || loading}>
                  Atualizar
                </Button>
                <Button onClick={openNewClinicUser} disabled={!selectedClinicId || loading}>
                  Novo Usuário
                </Button>
              </div>
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
                  {clinicUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-gray-500">
                        {selectedClinicId ? "Nenhum usuário encontrado" : "Selecione uma clínica"}
                      </td>
                    </tr>
                  ) : (
                    clinicUsers.map((u) => (
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
        </div>
      </div>

      <Dialog open={showClinicDialog} onOpenChange={setShowClinicDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingClinic ? "Editar Clínica" : "Nova Clínica"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitClinic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input value={clinicForm.nome_fantasia} onChange={(e) => setClinicForm((p) => ({ ...p, nome_fantasia: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input value={clinicForm.razao_social} onChange={(e) => setClinicForm((p) => ({ ...p, razao_social: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={clinicForm.cnpj} onChange={(e) => setClinicForm((p) => ({ ...p, cnpj: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={clinicForm.telefone} onChange={(e) => setClinicForm((p) => ({ ...p, telefone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={clinicForm.email} onChange={(e) => setClinicForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={clinicForm.status} onChange={(e) => setClinicForm((p) => ({ ...p, status: e.target.value }))} />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-semibold text-gray-900 mb-3">Endereço</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={clinicForm.endereco.cep} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, cep: e.target.value } }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Logradouro</Label>
                  <Input value={clinicForm.endereco.logradouro} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, logradouro: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={clinicForm.endereco.numero} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, numero: e.target.value } }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Complemento</Label>
                  <Input value={clinicForm.endereco.complemento} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, complemento: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={clinicForm.endereco.bairro} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, bairro: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={clinicForm.endereco.cidade} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, cidade: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={clinicForm.endereco.estado} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, estado: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input value={clinicForm.endereco.pais} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, pais: e.target.value } }))} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowClinicDialog(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
              <Button type="button" variant="outline" onClick={() => setShowUserDialog(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

