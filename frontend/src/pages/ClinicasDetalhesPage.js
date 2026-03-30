import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import ClinicForm, { ClinicFormFooter } from "../components/clinic-form/ClinicForm";
import PageHeader from "../components/clinic-list/PageHeader";
import Button from "../components/clinic-form/Button";
import EmptyState from "../components/clinic-list/EmptyState";
import { normalizeClinicForm } from "../components/clinic-form/clinicFormState";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/clinic-list/Table";
import { AlertCircle, Pencil, RefreshCw, Trash2, Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import UserForm from "../components/UserForm";
import { useAuth } from "../contexts/AuthContext";
import { hasAdminMasterAccess } from "../utils/roles";

export default function ClinicasDetalhesPage() {

  const navigate = useNavigate();
  const { id } = useParams();
  const { isMaster } = useTenant();
  const { user: currentUser } = useAuth();
  const isAdminMaster = hasAdminMasterAccess(currentUser);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);

  // States for Edit User
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [allClinics, setAllClinics] = useState([]);

  // States for Remove User
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  // States for Add User
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/master/clinics/${id}`);
      setClinic(res.data?.clinic || null);
      setUsers(res.data?.users || []);
    } catch (e) {
      const message = e.response?.data?.detail || "Erro ao carregar detalhes da clínica";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    loadDetail();
    loadDependencies();
  }, [isMaster, id]);

  const loadDependencies = async () => {
    try {
      const [profRes, clinRes] = await Promise.all([
        api.get("/professionals"),
        api.get("/master/clinics")
      ]);
      setProfessionals(profRes.data || []);
      setAllClinics(clinRes.data || []);
    } catch (e) {
      console.error("Erro ao carregar dependencias");
    }
  };

  // Handlers for Edit
  const openEditUser = (user) => {
    console.log("[DEBUG] openEditUser - user selecionado:", user);
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const handleEditUserSubmit = async (formData) => {
    try {
      console.log("[DEBUG] handleEditUserSubmit - INICIO");
      console.log("[DEBUG] editingUser ID:", editingUser?.id);
      console.log("[DEBUG] formData recebido:", formData);
      
      if (!editingUser || !editingUser.id) {
        console.error("[DEBUG] Erro: ID do usuário está indefinido ou nulo");
        toast.error("Erro interno: ID do usuário não encontrado para edição.");
        return;
      }
      
      setLoading(true);
      const updateData = {
        name: formData.name,
        email: formData.email,
        user_type: formData.user_type,
        professional_id: formData.professional_id,
        is_admin: formData.is_admin,
        clinic_id: formData.clinic_id
        
        // Passo 11: Base para permissões por clínica (preparação futura)
        // Estrutura extensível para suportar múltiplas clínicas e roles por clínica:
        // clinic_associations: [
        //   { clinicId: formData.clinic_id, role: formData.is_admin ? 'ADMIN' : 'USER' }
        // ]
      };
      
      console.log("[DEBUG] Enviando payload PUT para /users/" + editingUser.id, updateData);
      await api.put(`/users/${editingUser.id}`, updateData);
      
      console.log("[DEBUG] Requisição PUT concluída com sucesso");
      toast.success("Usuário atualizado!");
      setShowEditDialog(false);
      setEditingUser(null);
      loadDetail();
    } catch (error) {
      console.error("[DEBUG] ERRO COMPLETO DO BACKEND NA EDIÇÃO:", error);
      console.log("STATUS:", error.response?.status);
      console.log("RESPONSE BODY:", error.response?.data);

      let errorMsg = "Erro ao atualizar usuário";
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Tratar erros de validação do Pydantic
          errorMsg = error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(' | ');
        } else {
          errorMsg = JSON.stringify(error.response.data.detail);
        }
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Remove
  const openRemoveUser = (user) => {
    setUserToRemove(user);
    setShowRemoveDialog(true);
  };

  const confirmRemoveUser = async () => {
    try {
      setLoading(true);
      await api.put(`/users/${userToRemove.id}`, { clinic_id: null });
      toast.success("Usuário removido da clínica!");
      setShowRemoveDialog(false);
      setUserToRemove(null);
      loadDetail();
    } catch (error) {
      toast.error("Erro ao remover usuário");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Add
  const openAddUserDialog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      // Show users that are NOT currently in this clinic
      const availableUsers = (res.data || []).filter(u => u.clinic_id !== id && !users.find(cu => cu.id === u.id));
      setAllUsers(availableUsers);
      setSelectedUserToAdd("");
      setShowAddDialog(true);
    } catch (error) {
      toast.error("Erro ao buscar usuários");
    } finally {
      setLoading(false);
    }
  };

  const confirmAddUser = async () => {
    if (!selectedUserToAdd) {
      toast.error("Selecione um usuário");
      return;
    }
    try {
      setLoading(true);
      // Passo 11: Base para permissões por clínica (preparação futura)
      // No futuro, isso poderia ser:
      // await api.post(`/users/${selectedUserToAdd}/clinics`, { clinicId: id, role: 'USER' });
      await api.put(`/users/${selectedUserToAdd}`, { clinic_id: id });
      toast.success("Usuário associado à clínica!");
      setShowAddDialog(false);
      setSelectedUserToAdd("");
      loadDetail();
    } catch (error) {
      toast.error("Erro ao associar usuário");
    } finally {
      setLoading(false);
    }
  };

  if (!isMaster) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800">Clínicas</h1>
          <p className="mt-2 text-gray-600">Acesso restrito a ADMIN_MASTER.</p>
        </div>
      </Layout>
    );
  }

  const formValues = normalizeClinicForm(clinic || {});
  const createdAtLabel = clinic?.created_at ? new Date(clinic.created_at).toLocaleString("pt-BR") : "";

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6 w-full">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <PageHeader
            badge="Gestão de Clínicas"
            title="Visualizar clínica"
            description={clinic?.nome_fantasia || clinic?.razao_social || id ? `Consulta estruturada para ${clinic?.nome_fantasia || clinic?.razao_social || id}.` : "Consulta estruturada da clinica mantendo o mesmo layout do cadastro."}
          />
        </div>

        {error ? (
          <section className="rounded-2xl bg-white shadow-md p-6">
            <EmptyState
              icon={AlertCircle}
              title="Nao foi possivel carregar a clinica"
              description={error}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={() => navigate("/clinicas")} disabled={loading}>
                    Voltar
                  </Button>
                  <Button onClick={loadDetail} disabled={loading}>
                    Tentar novamente
                  </Button>
                </div>
              }
            />
          </section>
        ) : loading && !clinic ? (
          <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md">
            <div className="h-8 w-1/2 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
          </div>
        ) : clinic ? (
          <div className="space-y-6 w-full">
            <ClinicForm
              formId="clinic-view-form"
              values={formValues}
              onSubmit={(e) => e.preventDefault()}
              onFieldChange={() => {}}
              onAddressFieldChange={() => {}}
              readOnly
              bannerTitle="Dados da clinica"
              bannerDescription={createdAtLabel ? `Criado em ${createdAtLabel}.` : "Visualizacao estruturada com o mesmo layout do cadastro."}
              footer={
                <ClinicFormFooter
                  secondaryLabel="Voltar"
                  primaryLabel="Editar"
                  onSecondaryClick={() => navigate("/clinicas")}
                  onPrimaryClick={() => navigate(`/clinicas/editar/${id}`)}
                  primaryIcon={Pencil}
                />
              }
            />

            <section className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium text-gray-700">Usuarios associados</h2>
                  <p className="text-sm text-gray-500">Lista de usuarios vinculados a esta clinica no cadastro mestre.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={loadDetail} disabled={loading} aria-label="Atualizar usuarios associados">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  {isAdminMaster && (
                    <Button onClick={openAddUserDialog} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  )}
                </div>
              </div>

              {users.length === 0 ? (
                <EmptyState
                  icon={AlertCircle}
                  title="Nenhum usuário associado a esta clínica"
                  description="Esta clinica ainda nao possui usuarios associados."
                  action={
                    isAdminMaster && (
                      <Button onClick={openAddUserDialog} disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                        Adicionar usuário
                      </Button>
                    )
                  }
                />
              ) : (
                <>
                  <div className="hidden md:block pb-2">
                    <Table role="table" aria-label="Usuarios da clinica">
                      <TableHead>
                        <tr>
                          <TableHeaderCell>Nome</TableHeaderCell>
                          <TableHeaderCell>Email</TableHeaderCell>
                          <TableHeaderCell>Tipo</TableHeaderCell>
                          <TableHeaderCell>Roles</TableHeaderCell>
                          {isAdminMaster && <TableHeaderCell className="text-right">Ações</TableHeaderCell>}
                        </tr>
                      </TableHead>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-semibold text-gray-900">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.user_type || "-"}</TableCell>
                            <TableCell>
                              {Array.isArray(u.roles) && u.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {u.roles.map(r => (
                                    <span key={r} className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            {isAdminMaster && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditUser(u)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar usuário"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openRemoveUser(u)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover da clínica"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-1 gap-4 px-6 py-4 md:hidden">
                    {users.map((u) => (
                      <div key={u.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Tipo:</span>
                          <span className="font-medium text-gray-700">{u.user_type || "-"}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                          {Array.isArray(u.roles) && u.roles.length > 0 ? (
                            u.roles.map(r => (
                              <span key={r} className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Sem roles</span>
                          )}
                        </div>
                        {isAdminMaster && (
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => openEditUser(u)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => openRemoveUser(u)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Total: {users.length}</span> usuario{users.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : (
          <section className="rounded-2xl bg-white shadow-md">
            <EmptyState
              icon={AlertCircle}
              title="Clinica nao encontrada"
              description="Nao foi possivel localizar os dados para esta clinica."
              action={
                <Button variant="secondary" onClick={() => navigate("/clinicas")}>
                  Voltar
                </Button>
              }
            />
          </section>
        )}
      </div>

      {/* Modal Editar Usuário */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false);
          setEditingUser(null);
        } else {
          setShowEditDialog(true);
        }
      }}>
        <DialogContent className="max-w-lg w-[95vw] md:w-full bg-white p-4 md:p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <UserForm
            initialData={editingUser}
            professionals={professionals}
            clinics={allClinics}
            onSubmit={handleEditUserSubmit}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingUser(null);
            }}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Remover Usuário */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-md w-[95vw] md:w-full bg-white p-4 md:p-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Remover Usuário</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Deseja remover o usuário <span className="font-semibold">{userToRemove?.name}</span> desta clínica?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              O usuário não será excluído do sistema, apenas perderá o acesso a esta clínica.
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowRemoveDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={confirmRemoveUser} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? "Removendo..." : "Remover da Clínica"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Usuário */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md w-[95vw] md:w-full bg-white p-4 md:p-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Usuário à Clínica</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selecione um usuário existente</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            {allUsers.length === 0 && (
              <p className="text-sm text-amber-600">
                Não há usuários disponíveis ou todos já estão nesta clínica.
              </p>
            )}
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowAddDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={confirmAddUser} disabled={loading || !selectedUserToAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Adicionando..." : "Adicionar à Clínica"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

