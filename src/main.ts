import App from "./App.svelte";

export let eventFav = [];

const app = new App({
    target: document.body,
});

export default app;
