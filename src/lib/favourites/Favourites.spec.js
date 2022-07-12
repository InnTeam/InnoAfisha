import Favourites from "./Favourites.svelte";
import {render, screen} from "@testing-library/svelte";
import "@testing-library/jest-dom";

describe("Favourites", () => {
    test("has no assertions", () => {
        expect.assertions(0);
        render(Favourites);
    });

    test("has favourites header", () => {
        render(Favourites);
        const header = screen.getByRole("heading", {name: "My favourites"});
        expect(header).toBeInTheDocument();
    });
})
