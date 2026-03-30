import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Save, X } from "lucide-react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import ClinicForm, { ClinicFormFooter } from "../components/clinic-form/ClinicForm";
import PageHeader from "../components/clinic-list/PageHeader";
import EmptyState from "../components/clinic-list/EmptyState";
import Button from "../components/clinic-form/Button";
import { emptyClinicForm, normalizeClinicForm } from "../components/clinic-form/clinicFormState";

import { unmask } from "../utils/masks";

export default function ClinicasEditarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isMaster } = useTenant();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyClinicForm);

  const loadClinic = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/master/clinics/${id}`);
      setForm(normalizeClinicForm(res.data?.clinic || {}));
    } catch (e) {
      const message = e.response?.data?.detail || "Erro ao carregar clínica";
      setError(message);
      toast.error(message);
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

    const payload = {
      ...form,
      cnpj: unmask(form.cnpj),
      telefone: unmask(form.telefone),
      endereco: {
        ...form.endereco,
        cep: unmask(form.endereco?.cep)
      }
    };

    try {
      await api.put(`/master/clinics/${id}`, payload);
      toast.success("Clínica atualizada");
      navigate(`/clinicas/detalhes/${id}`);
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao salvar clínica");
    } finally {
      setLoading(false);
    }
  };

  const updateClinicField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddressField = (key, value) => {
    setForm((prev) => ({ ...prev, endereco: { ...(prev.endereco || {}), [key]: value } }));
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

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          badge="Gestao de Clinicas"
          title="Editar clinica"
          description={id ? `Atualize os dados da unidade ${id} mantendo o mesmo padrao visual do cadastro.` : "Atualize os dados da unidade mantendo o mesmo padrao visual do cadastro."}
        />

        {error ? (
          <section className="rounded-2xl bg-white shadow-md">
            <EmptyState
              icon={AlertCircle}
              title="Nao foi possivel carregar a clinica"
              description={error}
              action={
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={() => navigate(`/clinicas/detalhes/${id}`)} disabled={loading}>
                    Voltar
                  </Button>
                  <Button onClick={loadClinic} disabled={loading}>
                    Tentar novamente
                  </Button>
                </div>
              }
            />
          </section>
        ) : loading && !form?.nome_fantasia && !form?.razao_social ? (
          <div className="mx-auto max-w-4xl animate-pulse rounded-2xl bg-white p-6 shadow-md">
            <div className="h-8 w-1/2 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
          </div>
        ) : (
          <ClinicForm
            formId="clinic-edit-form"
            values={form}
            onSubmit={submit}
            onFieldChange={updateClinicField}
            onAddressFieldChange={updateAddressField}
            loading={loading}
            bannerTitle="Editar clinica"
            bannerDescription="Edite os dados mantendo o payload atual e o mesmo layout do cadastro."
            footer={
              <ClinicFormFooter
                secondaryLabel="Cancelar"
                primaryLabel={loading ? "Salvando..." : "Salvar"}
                primaryType="submit"
                onSecondaryClick={() => navigate(`/clinicas/detalhes/${id}`)}
                loading={loading}
                primaryIcon={Save}
                secondaryIcon={X}
              />
            }
          />
        )}
      </div>
    </Layout>
  );
}

