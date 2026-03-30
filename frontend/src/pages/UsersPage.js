import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClinicMultiSelect from "../components/ClinicMultiSelect";
import UserForm from "../components/UserForm";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "consultor",
    professional_id: "",
    is_admin: false,
    clinic_id: null
  });

  useEffect(() => {
    loadUsers();
    loadProfessionals();
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      // Usando endpoint existente para buscar as clínicas
      const response = await api.get("/master/clinics");
      setClinics(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar clínicas");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await api.get("/professionals");
      setProfessionals(response.data);
    } catch (error) {
      console.error("Erro ao carregar profissionais");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      user_type: user.user_type || "consultor",
      professional_id: user.professional_id || "",
      is_admin: user.role?.is_admin || false,
      clinic_id: user.clinic_id || (user.clinics && user.clinics.length > 0 ? (user.clinics[0].clinicId || user.clinics[0].id) : null)
    });
    setShowDialog(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      user_type: "consultor",
      professional_id: "",
      is_admin: false,
      clinic_id: null
    });
    setShowDialog(true);
  };

  const handleSubmit = async (submittedFormData) => {
    console.log("Submit data:", submittedFormData);
    try {
      if (editingUser) {
        // Editar usuário existente
        const updateData = {
          name: submittedFormData.name,
          email: submittedFormData.email,
          user_type: submittedFormData.user_type,
          professional_id: submittedFormData.professional_id,
          is_admin: submittedFormData.is_admin,
          clinic_id: submittedFormData.clinic_id
        };
        console.log("Update user payload:", updateData);
        await api.put(`/users/${editingUser.id}`, updateData);
        toast.success("Usuário atualizado!");
      } else {
        // Criar novo usuário
        if (!submittedFormData.password) {
          toast.error("Senha é obrigatória para novo usuário");
          return;
        }
        
        const registerData = {
          name: submittedFormData.name,
          email: submittedFormData.email,
          password: submittedFormData.password,
          user_type: submittedFormData.user_type,
          professional_id: submittedFormData.professional_id || null,
          is_admin: submittedFormData.is_admin,
          clinic_id: submittedFormData.clinic_id || null
        };
        
        console.log("Register user payload:", registerData);
        await api.post("/auth/register", registerData);
        toast.success("Usuário criado com sucesso!");
      }
      setShowDialog(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error("ERRO COMPLETO DO BACKEND:", error);
      console.log("STATUS:", error.response?.status);
      console.log("RESPONSE BODY:", error.response?.data);

      let errorMsg = editingUser ? "Erro ao atualizar usuário" : "Erro ao criar usuário";
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Tratar erros de validação do Pydantic (array de erros)
          errorMsg = error.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(' | ');
        } else {
          errorMsg = JSON.stringify(error.response.data.detail);
        }
      }

      toast.error(errorMsg);
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success("Usuário deletado!");
      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      toast.error("Erro ao deletar usuário");
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      user_type: "consultor",
      professional_id: "",
      is_admin: false,
      clinic_id: null
    });
  };

  const getUserTypeBadge = (userType) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700",
      consultor: "bg-blue-100 text-blue-700",
      profissional: "bg-green-100 text-green-700"
    };
    const labels = {
      admin: "Super Usuário",
      consultor: "Consultor",
      profissional: "Profissional"
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[userType] || styles.consultor}`}>
      {labels[userType] || "Consultor"}
    </span>;
  };

  const getProfessionalName = (professionalId) => {
    const prof = professionals.find(p => p.id === professionalId);
    return prof ? prof.name : "-";
  };

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <Button onClick={handleNewUser} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Usuário
          </Button>
        </div>

        <div className="grid gap-6">
          {currentUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                    {getUserTypeBadge(user.user_type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Email: {user.email}</p>
                    {user.user_type === "profissional" && user.professional_id && (
                      <p className="text-gray-600">
                        Profissional vinculado: {getProfessionalName(user.professional_id)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="btn-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="btn-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Modal de Criar/Editar Usuário */}
        <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <UserForm 
              initialData={editingUser}
              professionals={professionals}
              clinics={clinics}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">
                Tem certeza que deseja deletar o usuário <strong>{userToDelete?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDelete}
                >
                  Confirmar Exclusão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
