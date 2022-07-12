import Forms from "./Forms.svelte";
import { render, screen } from "@testing-library/svelte";
import "@testing-library/jest-dom";

it("has Sign Up header", () => {
	render(Forms);
	const header = screen.getByRole("heading", { name: "Sign up" });
	expect(header).toBeInTheDocument();
});
