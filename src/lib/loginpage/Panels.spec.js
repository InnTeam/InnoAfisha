import Panels from "./Panels.svelte";
import {render, screen} from "@testing-library/svelte";
import "@testing-library/jest-dom";

it("has Afisha header", () => {
    render(Panels);
    const header = screen.getByRole("heading", {name: "Innopolis Afisha"});
    expect(header).toBeInTheDocument();
});
