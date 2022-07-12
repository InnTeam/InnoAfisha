import FormsLogin from "./FormsLogin.svelte";
import {render, screen} from "@testing-library/svelte";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import {shallow} from "enzyme";

describe("FormsLogin", () => {
    const credentials = {username: 'vladimir', password: 'vldmr1234', email: 'v.ryabenko@innopolis.university'};

    test("has Sign In header", () => {
        render(FormsLogin);
        const header = screen.getByRole("heading", {name: "Sign in"});
        expect(header).toBeInTheDocument();
    });

    test("username filled correctly", async () => {
        render(FormsLogin);
        const input = screen.getByPlaceholderText("Username");
        await userEvent.type(input, credentials.username);
        expect(input.value).toBe(credentials.username);
    });

    test("password filled correctly", async () => {
        render(FormsLogin);
        const input = screen.getByPlaceholderText("Password");
        await userEvent.type(input, credentials.password);
        expect(input.value).toBe(credentials.password);
    });
});
