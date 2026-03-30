import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowDownAZ,
  ArrowUpAZ,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Sparkles
} from "lucide-react";
import Layout from "./Layout";
import Button from "./clinic-form/Button";
import Input from "./clinic-form/Input";
import ClinicForm, { ClinicFormFooter } from "./clinic-form/ClinicForm";
import PageHeader from "./clinic-list/PageHeader";
import EmptyState from "./clinic-list/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./clinic-list/Table";

function ClinicStatusBadge({ status }) {
  const tone = status === "inactive"
    ? "bg-gray-100 text-gray-600"
    : status === "pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

function LoadingCardGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 h-5 w-2/3 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
          <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-lg bg-gray-200" />
            <div className="h-10 flex-1 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="hidden md:block">
      <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200">
        <div className="space-y-3 p-6">
          <div className="h-5 w-1/4 rounded bg-gray-200" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

import { unmask } from "../utils/masks";

function ClinicCard({ clinic, navigate }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="truncate text-lg font-semibold text-gray-800">{clinic.nome}</div>
          <div className="text-sm text-gray-500">CNPJ: {clinic.cnpj || "-"}</div>
          <ClinicStatusBadge status={clinic.status} />
        </div>
        <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate(`/clinicas/detalhes/${clinic.id}`)}
          aria-label={`Visualizar ${clinic.nome}`}
        >
          <Eye className="h-4 w-4" />
          Visualizar
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate(`/clinicas/editar/${clinic.id}`)}
          aria-label={`Editar ${clinic.nome}`}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>
    </div>
  );
}

export default function ClinicasListView({
  isMaster,
  loading,
  error,
  clinics,
  datalistId,
  query,
  onQueryChange,
  sortDir,
  onToggleSort,
  onRefresh,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  pageItems,
  emptyState,
  navigate,
  showClinicDialog,
  setShowClinicDialog,
  clinicForm,
  setClinicForm,
  emptyAddress,
  emptyClinicForm,
  onOpenNewClinic,
  onSubmitClinic
}) {
  const updateClinicField = (field, value) => {
    setClinicForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field, value) => {
    setClinicForm((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
  };

  const handleDialogChange = (open) => {
    setShowClinicDialog(open);
    if (!open) {
      setClinicForm({ ...emptyClinicForm, endereco: { ...emptyAddress } });
    }
  };

  if (!isMaster) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-800">Clinicas</h1>
          <p className="mt-2 text-gray-600">Acesso restrito a ADMIN_MASTER.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Painel 1: Header simples */}
        <PageHeader title="Gestão de Clínicas" />

        {/* Painel 2: Conteúdo Principal */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-md">
          
          {/* 1. Área de busca e filtros */}
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 max-w-md">
                <Input
                  id="clinicas-search"
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  list={datalistId}
                  value={query}
                  onChange={onQueryChange}
                  onInput={onQueryChange}
                  label="Buscar clínica"
                  placeholder="Digite o nome da clínica..."
                  inputClassName="bg-gray-50"
                />
                <datalist id={datalistId}>
                  {clinics.slice(0, 200).map((c) => (
                    <option key={c.id} value={c.nome} />
                  ))}
                </datalist>
              </div>
              <Button 
                variant="primary" 
                onClick={() => {}} 
                disabled={loading} 
                className="md:mb-[2px]"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* 3. Ações da listagem (dentro da área da listagem, no topo) */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-700">Listagem de clínicas</h2>
              
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button onClick={onOpenNewClinic} disabled={loading}>
                  <Plus className="h-4 w-4" />
                  Cadastrar Clínica
                </Button>
                <Button
                  variant="secondary"
                  onClick={onToggleSort}
                  disabled={loading}
                  aria-label={sortDir === "asc" ? "Ordenar por nome Z-A" : "Ordenar por nome A-Z"}
                >
                  {sortDir === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                  Ordenar
                </Button>
                <Button variant="secondary" onClick={onRefresh} disabled={loading}>
                  <Sparkles className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* 2. Listagem de clínicas */}
            {error ? (
              <EmptyState
                icon={AlertCircle}
                title="Não foi possível carregar as clínicas"
                description={error}
                action={
                  <Button variant="secondary" onClick={onRefresh}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : loading ? (
              <>
                <LoadingTable />
                <LoadingCardGrid />
              </>
            ) : emptyState ? (
              <EmptyState
                icon={Search}
                title="Nenhum resultado encontrado"
                description="Tente ajustar a busca ou cadastre uma nova clínica para iniciar a base."
                action={
                  <Button onClick={onOpenNewClinic}>
                    <Plus className="h-4 w-4" />
                    Cadastrar Clínica
                  </Button>
                }
              />
            ) : (
              <>
                <div className="hidden md:block pb-2">
                  <Table role="table" aria-label="Lista de clínicas">
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Nome</TableHeaderCell>
                        <TableHeaderCell>CNPJ</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Cadastro</TableHeaderCell>
                        <TableHeaderCell className="text-right">Ações</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {pageItems.map((c) => (
                        <TableRow key={c.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-semibold text-gray-900">{c.nome}</TableCell>
                          <TableCell>{c.cnpj || "-"}</TableCell>
                          <TableCell>
                            <ClinicStatusBadge status={c.status} />
                          </TableCell>
                          <TableCell>{c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : "-"}</TableCell>
                          <TableCell>
                            {/* 4. Ações por item */}
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => navigate(`/clinicas/detalhes/${c.id}`)}
                                aria-label={`Visualizar ${c.nome}`}
                              >
                                <Eye className="h-4 w-4" />
                                Visualizar
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => navigate(`/clinicas/editar/${c.id}`)}
                                aria-label={`Editar ${c.nome}`}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {pageItems.map((c) => (
                    <ClinicCard key={c.id} clinic={c} navigate={navigate} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 5. Paginação */}
          {!loading && !error && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Total: {clinics.length}</span> clínica{clinics.length !== 1 ? 's' : ''} • Página {page} de {totalPages || 1}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={onPrevPage}
                    disabled={page === 1}
                    variant="secondary"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={onNextPage}
                    disabled={page === totalPages}
                    variant="secondary"
                    aria-label="Próxima página"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <Dialog open={showClinicDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-0 bg-gray-50 p-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-200 bg-white px-6 py-5 md:px-8">
            <DialogTitle className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Building2 className="h-6 w-6" />
              </span>
              <span className="space-y-1">
                <span className="block text-2xl font-semibold text-gray-800">Cadastrar Clinica</span>
                <span className="block text-sm font-normal text-gray-500">
                  Preencha os dados da unidade sem alterar a integracao atual com o backend.
                </span>
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para cadastrar uma clinica com informacoes principais, contato e endereco.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 md:p-8">
            <ClinicForm
              formId="clinic-create-form"
              values={clinicForm}
              onSubmit={onSubmitClinic}
              onFieldChange={updateClinicField}
              onAddressFieldChange={updateAddressField}
              loading={loading}
              footer={
                <ClinicFormFooter
                  secondaryLabel="Cancelar"
                  primaryLabel={loading ? "Salvando..." : "Cadastrar"}
                  primaryType="submit"
                  onSecondaryClick={() => handleDialogChange(false)}
                  loading={loading}
                />
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
