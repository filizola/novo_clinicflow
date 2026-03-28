import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { PanelCard, PanelGrid } from "./PanelGrid";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("PanelGrid", () => {
  test("renderiza grid e card e responde a Enter/Espaço", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const onClick = jest.fn();

    act(() => {
      root.render(
        <PanelGrid>
          <PanelCard onClick={onClick}>
            <span>Item</span>
          </PanelCard>
        </PanelGrid>
      );
    });

    const card = container.querySelector('[role="button"]');
    expect(card).toBeTruthy();

    act(() => {
      card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    act(() => {
      card.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    });

    expect(onClick).toHaveBeenCalledTimes(2);

    act(() => root.unmount());
    container.remove();
  });
});

