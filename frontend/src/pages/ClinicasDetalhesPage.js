import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PanelCard, PanelGrid } from "../components/PanelGrid";

export default function ClinicasDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isMaster } = useTenant();

  const [loading, setLoading] = useState(false);
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/master/clinics/${id}`);
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
    loadDetail();
  }, [isMaster, id]);

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
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" className="btn-secondary" onClick={() => navigate("/clinicas")} disabled={loading}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Detalhes da Clínica</h1>
            <p className="text-gray-600 mt-1">{clinic?.nome_fantasia || clinic?.razao_social || id}</p>
          </div>
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
                <h2 className="text-xl font-bold text-gray-900">Usuários associados</h2>
                <Button variant="outline" className="btn-secondary" onClick={loadDetail} disabled={loading}>
                  Atualizar
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Usuários da clínica">
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
      </div>
    </Layout>
  );
}

