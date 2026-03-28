import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTenant } from "../contexts/TenantContext";
import { toast } from "sonner";
import ClinicasListView from "../components/ClinicasListView";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

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

export default function ClinicasListPage() {
  const navigate = useNavigate();
  const { isMaster } = useTenant();

  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [clinicForm, setClinicForm] = useState({ ...emptyClinicForm });

  const itemsPerPage = 20;
  const debounceRef = useRef(null);
  const datalistId = "clinicas-autocomplete";

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
      if (res.data?.id) navigate(`/clinicas/detalhes/${res.data.id}`);
    } catch (e2) {
      toast.error(e2.response?.data?.detail || "Erro ao cadastrar clínica");
    } finally {
      setLoading(false);
    }
  };

  const loadClinics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/master/clinics");
      setClinics(res.data || []);
      setPage(1);
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filteredSorted = useMemo(() => {
    const q = normalizeText(debouncedQuery);
    const base = q
      ? clinics.filter((c) => normalizeText(c.nome).includes(q))
      : clinics.slice();

    base.sort((a, b) => {
      const an = normalizeText(a.nome);
      const bn = normalizeText(b.nome);
      if (an < bn) return sortDir === "asc" ? -1 : 1;
      if (an > bn) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return base;
  }, [clinics, debouncedQuery, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / itemsPerPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredSorted.slice(start, start + itemsPerPage);
  }, [filteredSorted, page]);

  const emptyState = !loading && pageItems.length === 0;

  return (
    <ClinicasListView
      isMaster={isMaster}
      loading={loading}
      clinics={clinics}
      datalistId={datalistId}
      query={query}
      onQueryChange={(e) => setQuery(e.target.value)}
      sortDir={sortDir}
      onToggleSort={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
      onRefresh={loadClinics}
      page={page}
      totalPages={totalPages}
      onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
      onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
      pageItems={pageItems}
      emptyState={emptyState}
      navigate={navigate}
      showClinicDialog={showClinicDialog}
      setShowClinicDialog={setShowClinicDialog}
      clinicForm={clinicForm}
      setClinicForm={setClinicForm}
      emptyAddress={emptyAddress}
      emptyClinicForm={emptyClinicForm}
      onOpenNewClinic={openNewClinic}
      onSubmitClinic={submitClinic}
    />
  );
}
