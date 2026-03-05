import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntityDetailHeader } from "./EntityDetailHeader";

describe("EntityDetailHeader", () => {
  const baseProps = {
    name: "My Skill",
    entityKey: "my-skill",
    entityLabel: "skill" as const,
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    actions: <button>Action</button>,
  };

  it("renders name and entity key", () => {
    render(<EntityDetailHeader {...baseProps} />);
    expect(screen.getByText("My Skill")).toBeInTheDocument();
    expect(screen.getByText("my-skill")).toBeInTheDocument();
  });

  it("renders star button with correct aria-label when not favorite", () => {
    render(<EntityDetailHeader {...baseProps} />);
    expect(screen.getByLabelText("Star skill")).toBeInTheDocument();
  });

  it("renders unstar aria-label when favorite", () => {
    render(<EntityDetailHeader {...baseProps} isFavorite={true} />);
    expect(screen.getByLabelText("Unstar skill")).toBeInTheDocument();
  });

  it("calls onToggleFavorite when star button clicked", async () => {
    const onToggle = vi.fn();
    render(<EntityDetailHeader {...baseProps} onToggleFavorite={onToggle} />);
    await userEvent.click(screen.getByLabelText("Star skill"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("renders actions slot", () => {
    render(
      <EntityDetailHeader
        {...baseProps}
        actions={<button>Custom Action</button>}
      />,
    );
    expect(screen.getByText("Custom Action")).toBeInTheDocument();
  });
});
