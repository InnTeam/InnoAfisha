import { render, screen } from "@testing-library/svelte";
import "@testing-library/jest-dom";
import Footer from "./Footer.svelte";

it("has Sign Up header", () => {
	render(Footer);
	const header = screen.getByRole("heading", {
		name: "Contact us if you have any question",
	});
	expect(header).toBeInTheDocument();
});
