import Favourites from "./Favourites.svelte"
import { render, screen } from "@testing-library/svelte"
import "@testing-library/jest-dom"

it('has Sign Up header', () => {
    render(Favourites);
    const header = screen.getByRole('heading', { name: 'My favourites'});
    expect(header).toBeInTheDocument();
})