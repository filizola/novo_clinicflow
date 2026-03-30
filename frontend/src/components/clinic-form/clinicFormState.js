export const emptyAddress = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "BR"
};

export const emptyClinicForm = {
  nome_fantasia: "",
  razao_social: "",
  cnpj: "",
  telefone: "",
  email: "",
  status: "active",
  endereco: { ...emptyAddress }
};

export function normalizeClinicForm(clinic = {}) {
  return {
    nome_fantasia: clinic.nome_fantasia || "",
    razao_social: clinic.razao_social || "",
    cnpj: clinic.cnpj || "",
    telefone: clinic.telefone || "",
    email: clinic.email || "",
    status: clinic.status || "active",
    endereco: { ...emptyAddress, ...(clinic.endereco || {}) }
  };
}
