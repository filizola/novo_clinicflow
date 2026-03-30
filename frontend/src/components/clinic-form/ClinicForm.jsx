import React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import FormField from "./FormField";
import FormSection from "./FormSection";
import { formatCNPJ, formatPhone, formatCEP } from "../../utils/masks";

const clinicFieldSections = [
  {
    title: "Informacoes da Clinica",
    description: "Dados principais usados para identificacao da unidade no cadastro mestre.",
    fields: [
      { key: "nome_fantasia", label: "Nome Fantasia", required: true, placeholder: "Ex: Clinica Linear Centro" },
      { key: "razao_social", label: "Razao Social", required: true, placeholder: "Ex: Clinica Linear Centro LTDA" },
      { key: "cnpj", label: "CNPJ", required: true, placeholder: "00.000.000/0000-00" },
      { key: "status", label: "Status", placeholder: "active" }
    ]
  },
  {
    title: "Contato",
    description: "Centralize os canais principais para relacionamento com a clinica.",
    fields: [
      { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
      { key: "email", label: "Email", type: "email", placeholder: "contato@clinica.com.br" }
    ]
  }
];

const addressSection = {
  title: "Endereco",
  description: "Informacoes completas de localizacao, mantendo o mesmo payload enviado hoje.",
  fields: [
    { key: "cep", label: "CEP", placeholder: "00000-000" },
    { key: "logradouro", label: "Logradouro", placeholder: "Rua, avenida, alameda..." },
    { key: "numero", label: "Numero", placeholder: "123" },
    { key: "complemento", label: "Complemento", placeholder: "Sala, andar ou bloco" },
    { key: "bairro", label: "Bairro", placeholder: "Bairro" },
    { key: "cidade", label: "Cidade", placeholder: "Cidade" },
    { key: "estado", label: "Estado", placeholder: "UF" },
    { key: "pais", label: "Pais", placeholder: "BR" }
  ]
};

export default function ClinicForm({
  formId,
  values,
  onSubmit,
  onFieldChange,
  onAddressFieldChange,
  readOnly = false,
  loading = false,
  footer,
  bannerTitle = "Dados da clinica",
  bannerDescription = "Campos obrigatorios destacados para manter o cadastro consistente e rapido de preencher.",
  className
}) {
  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className={cn("mx-auto max-w-4xl w-full space-y-6 rounded-2xl bg-white p-6 shadow-md", className)}
    >
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
              {readOnly ? "Visualizacao" : "Formulario"}
            </p>
            <h2 className="text-2xl font-semibold">{bannerTitle}</h2>
          </div>
          <p className="max-w-md text-sm text-blue-50">{bannerDescription}</p>
        </div>
      </div>

      <div className="space-y-6">
        {clinicFieldSections.map((section) => (
          <FormSection key={section.title} title={section.title} description={section.description}>
            {section.fields.map((field) => {
              let displayValue = values?.[field.key] || "";
              if (field.key === "cnpj") displayValue = formatCNPJ(displayValue);
              if (field.key === "telefone") displayValue = formatPhone(displayValue);

              return (
                <FormField
                  key={field.key}
                  id={`${formId || "clinic-form"}-${field.key}`}
                  label={field.label}
                  type={field.type}
                  value={displayValue}
                  onChange={readOnly ? undefined : (e) => {
                    let val = e.target.value;
                    if (field.key === "cnpj") val = formatCNPJ(val);
                    if (field.key === "telefone") val = formatPhone(val);
                    onFieldChange(field.key, val);
                  }}
                  readOnly={readOnly}
                  required={field.required}
                  placeholder={field.placeholder}
                  emptyValue="-"
                />
              );
            })}
          </FormSection>
        ))}

        <FormSection
          title={addressSection.title}
          description={addressSection.description}
          contentClassName="grid-cols-1 gap-4 md:grid-cols-2"
        >
          {addressSection.fields.map((field) => {
            let displayValue = values?.endereco?.[field.key] || "";
            if (field.key === "cep") displayValue = formatCEP(displayValue);

            return (
              <FormField
                key={field.key}
                id={`${formId || "clinic-form"}-endereco-${field.key}`}
                label={field.label}
                value={displayValue}
                onChange={readOnly ? undefined : (e) => {
                  let val = e.target.value;
                  if (field.key === "cep") val = formatCEP(val);
                  onAddressFieldChange(field.key, val);
                }}
                readOnly={readOnly}
                placeholder={field.placeholder}
                emptyValue="-"
              />
            );
          })}
        </FormSection>
      </div>

      {footer ? (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between sm:gap-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-blue-500" />
            {readOnly
              ? "Visualizacao estruturada com a mesma organizacao do cadastro."
              : "Estrutura organizada para leitura rapida e preenchimento sem friccao."}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">{footer}</div>
        </div>
      ) : null}
    </form>
  );
}

export function ClinicFormFooter({
  primaryLabel,
  secondaryLabel,
  onSecondaryClick,
  onPrimaryClick,
  primaryType = "button",
  primaryVariant = "primary",
  secondaryVariant = "secondary",
  loading = false,
  disabled = false,
  primaryIcon,
  secondaryIcon
}) {
  const PrimaryIcon = primaryIcon;
  const SecondaryIcon = secondaryIcon;

  return (
    <>
      <Button type="button" variant={secondaryVariant} onClick={onSecondaryClick} disabled={loading || disabled}>
        {SecondaryIcon ? <SecondaryIcon className="h-4 w-4" /> : null}
        {secondaryLabel}
      </Button>
      <Button
        type={primaryType}
        variant={primaryVariant}
        onClick={onPrimaryClick}
        disabled={loading || disabled}
      >
        {PrimaryIcon ? <PrimaryIcon className="h-4 w-4" /> : null}
        {primaryLabel}
      </Button>
    </>
  );
}
