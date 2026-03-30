export const formatCNPJ = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18);
};

export const formatPhone = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  if (v.length <= 10) {
    return v
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 14);
  }
  return v
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .substring(0, 15);
};

export const formatCEP = (value) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  return v.replace(/(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

export const unmask = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};
