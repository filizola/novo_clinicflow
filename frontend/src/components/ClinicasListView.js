import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, Pencil, ArrowUpAZ, ArrowDownAZ, Plus } from "lucide-react";
import Layout from "./Layout";
import { PanelCard, PanelGrid } from "./PanelGrid";

export default function ClinicasListView({
  isMaster,
  loading,
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Clínicas</h1>
          <div className="flex items-center gap-2">
            <Button onClick={onOpenNewClinic} disabled={loading} className="btn-primary" aria-label="Cadastrar nova clínica">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Clínica
            </Button>
            <Button
              variant="outline"
              className="btn-secondary"
              onClick={onToggleSort}
              aria-label={sortDir === "asc" ? "Ordenar por nome Z-A" : "Ordenar por nome A-Z"}
              disabled={loading}
            >
              {sortDir === "asc" ? <ArrowUpAZ className="w-5 h-5" /> : <ArrowDownAZ className="w-5 h-5" />}
            </Button>
            <Button variant="outline" className="btn-secondary" onClick={onRefresh} disabled={loading}>
              Atualizar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="clinicas-search">Buscar clínica</Label>
              <Input
                id="clinicas-search"
                type="text"
                inputMode="search"
                autoComplete="off"
                list={datalistId}
                value={query}
                onChange={onQueryChange}
                onInput={onQueryChange}
                placeholder="Digite o nome da clínica..."
                aria-describedby="clinicas-search-help"
              />
              <datalist id={datalistId}>
                {clinics.slice(0, 200).map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
              <div id="clinicas-search-help" className="text-xs text-gray-500">
                Filtro com debounce de 300ms.
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-6" />
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="h-10 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="md:hidden">
              <PanelGrid className="grid-cols-1">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </PanelGrid>
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full text-sm" role="table" aria-label="Lista de clínicas">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-3 px-6">Nome</th>
                    <th className="py-3 px-6">CNPJ</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Cadastro</th>
                    <th className="py-3 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emptyState ? (
                    <tr>
                      <td colSpan={5} className="py-10 px-6 text-gray-500">
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-6 font-semibold text-gray-900">{c.nome}</td>
                        <td className="py-3 px-6 text-gray-700">{c.cnpj}</td>
                        <td className="py-3 px-6 text-gray-700">{c.status}</td>
                        <td className="py-3 px-6 text-gray-700">
                          {c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : "-"}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="btn-secondary"
                              onClick={() => navigate(`/clinicas/detalhes/${c.id}`)}
                              aria-label={`Visualizar ${c.nome}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </Button>
                            <Button
                              variant="outline"
                              className="btn-secondary"
                              onClick={() => navigate(`/clinicas/editar/${c.id}`)}
                              aria-label={`Editar ${c.nome}`}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {emptyState ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 text-gray-500">Nenhum resultado encontrado.</div>
              ) : (
                <PanelGrid className="grid-cols-1">
                  {pageItems.map((c) => (
                    <PanelCard key={c.id} onClick={() => navigate(`/clinicas/detalhes/${c.id}`)} aria-label={`Abrir ${c.nome}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xl font-bold text-gray-900 truncate">{c.nome}</div>
                          <div className="text-gray-600 mt-1">CNPJ: {c.cnpj}</div>
                          <div className="text-gray-600">Status: {c.status}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="btn-secondary flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/clinicas/detalhes/${c.id}`);
                          }}
                          aria-label={`Visualizar ${c.nome}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          className="btn-secondary flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/clinicas/editar/${c.id}`);
                          }}
                          aria-label={`Editar ${c.nome}`}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </PanelCard>
                  ))}
                </PanelGrid>
              )}
            </div>
          </>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={onPrevPage}
              disabled={page === 1}
              variant="outline"
              className="btn-secondary"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={onNextPage}
              disabled={page === totalPages}
              variant="outline"
              className="btn-secondary"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showClinicDialog} onOpenChange={setShowClinicDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Clínica</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmitClinic} className="space-y-4">
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
    </Layout>
  );
}

