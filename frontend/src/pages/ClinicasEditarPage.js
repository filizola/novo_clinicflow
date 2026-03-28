import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";

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

export default function ClinicasEditarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isMaster } = useTenant();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    telefone: "",
    email: "",
    status: "active",
    endereco: { ...emptyAddress }
  });

  const loadClinic = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/master/clinics/${id}`);
      const clinic = res.data?.clinic || {};
      setForm({
        nome_fantasia: clinic.nome_fantasia || "",
        razao_social: clinic.razao_social || "",
        cnpj: clinic.cnpj || "",
        telefone: clinic.telefone || "",
        email: clinic.email || "",
        status: clinic.status || "active",
        endereco: { ...emptyAddress, ...(clinic.endereco || {}) }
      });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao carregar clínica");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    loadClinic();
  }, [isMaster, id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      await api.put(`/master/clinics/${id}`, form);
      toast.success("Clínica atualizada");
      navigate(`/clinicas/detalhes/${id}`);
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao salvar clínica");
    } finally {
      setLoading(false);
    }
  };

  if (!isMaster) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Clínicas</h1>
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
            <Button variant="outline" className="btn-secondary" onClick={() => navigate(`/clinicas/detalhes/${id}`)} disabled={loading}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Editar Clínica</h1>
              <p className="text-gray-600 mt-1">{id}</p>
            </div>
          </div>
          <Button type="submit" form="clinic-edit-form" className="btn-primary" disabled={loading}>
            <Save className="w-5 h-5 mr-2" />
            Salvar
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form id="clinic-edit-form" onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input value={form.nome_fantasia} onChange={(e) => setForm((p) => ({ ...p, nome_fantasia: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input value={form.razao_social} onChange={(e) => setForm((p) => ({ ...p, razao_social: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={form.cnpj} onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Input value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-semibold text-gray-900 mb-3">Endereço</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={form.endereco.cep} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, cep: e.target.value } }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Logradouro</Label>
                  <Input
                    value={form.endereco.logradouro}
                    onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, logradouro: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={form.endereco.numero} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, numero: e.target.value } }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Complemento</Label>
                  <Input
                    value={form.endereco.complemento}
                    onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, complemento: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={form.endereco.bairro} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, bairro: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={form.endereco.cidade} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, cidade: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={form.endereco.estado} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, estado: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input value={form.endereco.pais} onChange={(e) => setForm((p) => ({ ...p, endereco: { ...p.endereco, pais: e.target.value } }))} />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

