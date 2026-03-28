import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import ClinicasEditarPage from "./ClinicasEditarPage";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "c1" })
  }),
  { virtual: true }
);

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn()
  }
}));

jest.mock("../contexts/TenantContext", () => ({
  __esModule: true,
  useTenant: () => ({ isMaster: true })
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

describe("ClinicasEditarPage", () => {
  let container;
  let root;

  beforeEach(() => {
    mockNavigate.mockReset();
    api.get.mockReset();
    api.put.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test("carrega clínica e salva via PUT", async () => {
    api.get.mockResolvedValueOnce({
      data: { clinic: { id: "c1", nome_fantasia: "Clínica A", razao_social: "Clínica A", cnpj: "1", status: "active", endereco: {} }, users: [] }
    });
    api.put.mockResolvedValueOnce({ data: { message: "ok" } });

    await act(async () => {
      root.render(<ClinicasEditarPage />);
    });

    expect(api.get).toHaveBeenCalledWith("/master/clinics/c1");

    const form = container.querySelector("#clinic-edit-form");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(api.put).toHaveBeenCalledWith("/master/clinics/c1", expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith("/clinicas/detalhes/c1");
  });
});
