import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelCard, PanelGrid } from "../components/PanelGrid";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

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

export default function AdminMasterClinicsPage() {
  const navigate = useNavigate();
  const { isMaster } = useTenant();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [clinicForm, setClinicForm] = useState({ ...emptyClinicForm });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/clinics");
      setClinics(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao carregar clínicas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    loadClinics();
  }, [isMaster]);

  const openNewClinic = () => {
    setClinicForm({ ...emptyClinicForm, endereco: { ...emptyAddress } });
    setShowClinicDialog(true);
  };

  const submitClinic = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/master/clinics", clinicForm);
      toast.success("Clínica cadastrada");
      setShowClinicDialog(false);
      await loadClinics();
      if (res.data?.id) navigate(`/admin-master/clinics/${res.data.id}`);
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao cadastrar clínica");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(clinics.length / itemsPerPage) || 1;
  const pagedClinics = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return clinics.slice(start, end);
  }, [clinics, currentPage, itemsPerPage]);

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Clínicas</h1>
          <Button onClick={openNewClinic} disabled={loading} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Clínica
          </Button>
        </div>

        {loading ? (
          <PanelGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </PanelGrid>
        ) : (
          <PanelGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {pagedClinics.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg text-gray-600">
                Nenhuma clínica cadastrada.
              </div>
            ) : (
              pagedClinics.map((c) => (
                <PanelCard key={c.id} onClick={() => navigate(`/admin-master/clinics/${c.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{c.nome}</h3>
                      <p className="text-gray-600 mt-1">CNPJ: {c.cnpj}</p>
                      <p className="text-gray-600">Status: {c.status}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Cadastro: {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : "-"}
                      </p>
                    </div>
                  </div>
                </PanelCard>
              ))
            )}
          </PanelGrid>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1 || loading}
              variant="outline"
              className="btn-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages || loading}
              variant="outline"
              className="btn-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        <Dialog open={showClinicDialog} onOpenChange={setShowClinicDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Clínica</DialogTitle>
            </DialogHeader>

            <form onSubmit={submitClinic} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input
                    value={clinicForm.nome_fantasia}
                    onChange={(e) => setClinicForm((p) => ({ ...p, nome_fantasia: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social</Label>
                  <Input
                    value={clinicForm.razao_social}
                    onChange={(e) => setClinicForm((p) => ({ ...p, razao_social: e.target.value }))}
                    required
                  />
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
                    <Input
                      value={clinicForm.endereco.logradouro}
                      onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, logradouro: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número</Label>
                    <Input value={clinicForm.endereco.numero} onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, numero: e.target.value } }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Complemento</Label>
                    <Input
                      value={clinicForm.endereco.complemento}
                      onChange={(e) => setClinicForm((p) => ({ ...p, endereco: { ...p.endereco, complemento: e.target.value } }))}
                    />
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
                <Button type="button" variant="outline" onClick={() => setShowClinicDialog(false)} disabled={loading} className="btn-secondary">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Salvando..." : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

