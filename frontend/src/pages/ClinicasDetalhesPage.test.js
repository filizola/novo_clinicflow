import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import ClinicasDetalhesPage from "./ClinicasDetalhesPage";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: "c1" })
  }),
  { virtual: true }
);

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn()
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

describe("ClinicasDetalhesPage", () => {
  let container;
  let root;

  beforeEach(() => {
    api.get.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test("carrega detalhe da clínica e usuários", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        clinic: { id: "c1", nome_fantasia: "Clínica A", cnpj: "1", status: "active" },
        users: [{ id: "u1", name: "User 1", email: "u1@test.com", roles: ["ADMIN_CLINIC"] }]
      }
    });

    await act(async () => {
      root.render(<ClinicasDetalhesPage />);
    });

    expect(api.get).toHaveBeenCalledWith("/master/clinics/c1");
    expect(container.textContent).toContain("Clínica A");
    expect(container.textContent).toContain("User 1");
  });
});

