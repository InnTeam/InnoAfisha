import {render} from "@testing-library/svelte";
import EventLoad from "./EventLoad.svelte";

describe("EventLoad", () => {
    test("has no assertions", () => {
        expect.assertions(0);
        render(EventLoad);
    });
})