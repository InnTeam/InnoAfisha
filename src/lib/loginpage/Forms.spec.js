import Forms from "./Forms.svelte";
import {render, screen} from "@testing-library/svelte";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("Forms", () => {
    const credentials = {username: 'vladimir', password: 'vldmr1234', email: 'v.ryabenko@innopolis.university'};

    test("has Sign Up header", () => {
        render(Forms);
        const header = screen.getByRole("heading", {name: "Sign up"});
        expect(header).toBeInTheDocument();
    });

    test("username filled correctly", async () => {
        render(Forms);
        const input = screen.getByPlaceholderText("Username");
        await userEvent.type(input, credentials.username);
        expect(input.value).toBe(credentials.username);
    });

    test("email filled correctly", async () => {
        render(Forms);
        const input = screen.getByPlaceholderText("Email");
        await userEvent.type(input, credentials.email);
        expect(input.value).toBe(credentials.email);
    });

    test("password filled correctly", async () => {
        render(Forms);
        const input = screen.getByPlaceholderText("Password");
        await userEvent.type(input, credentials.password);
        expect(input.value).toBe(credentials.password);
    });
});
