import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import ClinicasListPage from "./ClinicasListPage";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockUseTenant = jest.fn(() => ({ isMaster: true }));

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => mockNavigate
  }),
  { virtual: true }
);

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

jest.mock("../contexts/TenantContext", () => ({
  __esModule: true,
  useTenant: () => mockUseTenant()
}));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>
}));

jest.mock("sonner", () => ({
  __esModule: true,
  toast: { error: jest.fn(), success: jest.fn() }
}));

const api = require("../services/api").default;
const toast = require("sonner").toast;

function makeClinics(n) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `c${i + 1}`,
    nome: `Clinica ${String(i + 1).padStart(2, "0")}`,
    cnpj: `000${i}`,
    status: "active",
    created_at: "2026-03-28T12:00:00.000Z"
  }));
}

describe("ClinicasListPage", () => {
  let container;
  let root;

  beforeEach(() => {
    jest.useFakeTimers();
    api.get.mockReset();
    api.post.mockReset();
    mockNavigate.mockReset();
    mockUseTenant.mockReset();
    mockUseTenant.mockReturnValue({ isMaster: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.useRealTimers();
  });

  test("carrega apenas a lista de clínicas no mount", async () => {
    api.get.mockResolvedValueOnce({ data: makeClinics(3) });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith("/master/clinics");
    expect(container.textContent).toContain("Clinica 01");
  });

  test("não carrega clínicas quando não é ADMIN_MASTER", async () => {
    mockUseTenant.mockReturnValueOnce({ isMaster: false });
    api.get.mockResolvedValueOnce({ data: makeClinics(1) });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(api.get).toHaveBeenCalledTimes(0);
  });

  test("aplica debounce de 300ms na pesquisa", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: "1", nome: "Alpha", cnpj: "1", status: "active" }, { id: "2", nome: "Beta", cnpj: "2", status: "active" }] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });
    await act(async () => {});

    const input = container.querySelector("#clinicas-search");
    expect(input).toBeTruthy();

    act(() => {
      input.value = "Al";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await act(async () => {
      jest.advanceTimersByTime(299);
    });
    expect(Array.from(container.querySelectorAll("tbody tr")).map((tr) => tr.textContent).join("\n")).toContain("Beta");

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    await act(async () => {});

    const rows = Array.from(container.querySelectorAll("tbody tr")).map((tr) => tr.textContent).join("\n");
    expect(rows).toContain("Alpha");
    expect(rows).not.toContain("Beta");
  });

  test("debounce cancela timeout anterior", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: "1", nome: "Alpha", cnpj: "1", status: "active" }, { id: "2", nome: "Beta", cnpj: "2", status: "active" }] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const input = document.querySelector("#clinicas-search");
    act(() => {
      input.value = "A";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      input.value = "Al";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const rows = Array.from(document.querySelectorAll("tbody tr")).map((tr) => tr.textContent).join("\n");
    expect(rows).toContain("Alpha");
    expect(rows).not.toContain("Beta");
  });

  test("ordena por nome A-Z/Z-A", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: "1", nome: "Beta", cnpj: "2", status: "active" }, { id: "2", nome: "Alpha", cnpj: "1", status: "active" }] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const rows = () => Array.from(container.querySelectorAll("tbody tr")).map((tr) => tr.textContent);
    expect(rows()[0]).toContain("Alpha");

    const sortBtn = Array.from(container.querySelectorAll("button[aria-label]")).find((b) => b.getAttribute("aria-label").includes("Ordenar"));
    act(() => sortBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(rows()[0]).toContain("Beta");
  });

  test("ordenação lida com nomes iguais", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: "1", nome: "Alpha", cnpj: "1", status: "active" }, { id: "2", nome: "Alpha", cnpj: "2", status: "active" }] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(container.textContent).toContain("Alpha");
  });

  test("pagina com limite de 20 registros", async () => {
    api.get.mockResolvedValueOnce({ data: makeClinics(25) });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(container.querySelectorAll("tbody tr").length).toBe(20);

    const next = container.querySelector('button[aria-label="Próxima página"]');
    act(() => next.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(container.querySelectorAll("tbody tr").length).toBe(5);

    const prev = container.querySelector('button[aria-label="Página anterior"]');
    act(() => prev.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(container.querySelectorAll("tbody tr").length).toBe(20);
  });

  test("exibe estado vazio quando não há resultados", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(container.textContent).toContain("Nenhum resultado encontrado");
  });

  test("trata erro de carregamento exibindo toast", async () => {
    api.get.mockRejectedValueOnce({ response: { data: { detail: "Falha" } } });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("trata erro de carregamento sem detail usando fallback", async () => {
    api.get.mockRejectedValueOnce({});

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao carregar clínicas");
  });

  test("navega para visualizar e editar", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: "c1", nome: "Alpha", cnpj: "1", status: "active" }] });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const viewBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent.includes("Visualizar"));
    const editBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent.includes("Editar"));

    act(() => viewBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    act(() => editBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(mockNavigate).toHaveBeenCalledWith("/clinicas/detalhes/c1");
    expect(mockNavigate).toHaveBeenCalledWith("/clinicas/editar/c1");
  });

  test("abre modal de cadastro e cria clínica", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({ data: { id: "new1" } });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const addBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent.includes("Cadastrar Clínica"));
    expect(addBtn).toBeTruthy();

    act(() => addBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    act(() => {
      const requiredInputs = Array.from(document.querySelectorAll("input"))
        .filter((i) => i.required)
        .filter((i) => i.id !== "clinicas-search");
      requiredInputs[0].value = "Clínica Nova";
      requiredInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[1].value = "Clínica Nova LTDA";
      requiredInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[2].value = "00000000000000";
      requiredInputs[2].dispatchEvent(new Event("input", { bubbles: true }));
    });

    const form = document.querySelector("form");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(api.post).toHaveBeenCalledWith("/master/clinics", expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith("/clinicas/detalhes/new1");
  });

  test("exibe erro quando cadastro falha", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockRejectedValueOnce({ response: { data: { detail: "Falhou" } } });

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const addBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Cadastrar Clínica"));
    act(() => addBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    act(() => {
      const requiredInputs = Array.from(document.querySelectorAll("input")).filter((i) => i.required).filter((i) => i.id !== "clinicas-search");
      requiredInputs[0].value = "Clínica Nova";
      requiredInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[1].value = "Clínica Nova LTDA";
      requiredInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[2].value = "00000000000000";
      requiredInputs[2].dispatchEvent(new Event("input", { bubbles: true }));
    });

    const form = document.querySelector("form");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(toast.error).toHaveBeenCalled();
  });

  test("cadastro falha sem detail usa fallback", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockRejectedValueOnce({});

    await act(async () => {
      root.render(<ClinicasListPage />);
    });

    const addBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Cadastrar Clínica"));
    act(() => addBtn.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    act(() => {
      const requiredInputs = Array.from(document.querySelectorAll("input")).filter((i) => i.required).filter((i) => i.id !== "clinicas-search");
      requiredInputs[0].value = "Clínica Nova";
      requiredInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[1].value = "Clínica Nova LTDA";
      requiredInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      requiredInputs[2].value = "00000000000000";
      requiredInputs[2].dispatchEvent(new Event("input", { bubbles: true }));
    });

    const form = document.querySelector("form");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(toast.error).toHaveBeenCalledWith("Erro ao cadastrar clínica");
  });
});
