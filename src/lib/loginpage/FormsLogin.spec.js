import FormsLogin from "./FormsLogin.svelte";
import { render, screen } from "@testing-library/svelte";
import "@testing-library/jest-dom";

it("has Sign Up header", () => {
	render(FormsLogin);
	const header = screen.getByRole("heading", { name: "Sign in" });
	expect(header).toBeInTheDocument();
});
