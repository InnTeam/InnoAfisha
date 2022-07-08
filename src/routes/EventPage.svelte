<script lang="ts">
    import Header from "../lib/extra/Header.svelte";
    import Footer from "../lib/extra/Footer.svelte";
    import Spinner from "../lib/filters/spinner.svelte";

    export let params;
    let events = [];
    let colNames = [];

    async function getThings() {
        const res = await fetch(
            `http://innoafisha.pythonanywhere.com/api/v1/events`
        );
        const json = await res.json();

        if (res.ok) {
            setTimeout(() => {
                events = json;
                colNames = Object.keys(events[0]);

                return true;
            }, 0 * Math.random());
        }
    }

    let promise = getThings();
</script>

<main>
    {#await promise}
        <Spinner />
    {:then getThings}
        <body>
            <Header />
            {#each events as event, index (event.id)}
                {#if index === params.id - 1}
                    <div class="columns">
                        <div class="col_left">
                            <div class="event_pic">
                                <!-- svelte-ignore a11y-missing-attribute -->
                                <img
                                    src={event["picture"]}
                                    width="373px"
                                    height="373px"
                                />
                                <div class="dateplace">
                                    <div class="line1">
                                        <button class="rectangle2"
                                            >{event["date"]}</button
                                        >
                                        <button class="rectangle2"
                                            >{event["location"]}</button
                                        >
                                    </div>
                                </div>
                                <div class="numsite">
                                    <div class="line2">
                                        <button class="rectangle2"
                                            >{event["time"]}</button
                                        >
                                        <button class="btn"
                                            ><a href={event["link"]}>Site</a
                                            ></button
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col_right">
                            <p class="title">
                                {event["event_name"]}
                            </p>
                            <div class="rectangle1">
                                <p class="description">
                                    {event["description"]}
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
            <Footer />
        </body>
    {/await}
</main>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Lemon&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=M+PLUS+2&display=swap");
    body {
        background-color: #dff2dc;
        padding: 0;
        margin: 0;
    }

    .rectangle1 {
        text-align: center;
        background-color: #fff;
        border-radius: 11px;
    }

    .rectangle2 {
        font-family: "M PLUS 2", sans-serif;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: 0;
        border-radius: 5px;
        background: white;
        font-size: 20px;
        padding: 4px 8px;
        color: #1f3e24;
        min-width: 150px;
    }

    .columns {
        display: flex;
        column-gap: 40px;
        padding-left: 40px;
        padding-right: 40px;
        color: #1f3e24;
        font-family: "M PLUS 2", sans-serif;
    }

    .col_left {
        width: 50%;
        text-align: center;
        padding-top: 40px;
    }

    .col_right {
        text-align: center;
        font-size: 20px;
    }

    .title {
        font-size: 23px;
        padding-left: 60px;
        max-width: 500px;
    }

    .title::after {
        content: "";
        display: block;
        width: auto;
        height: 2px;
        background-color: #b3caaf;
    }

    .dateplace {
        font-size: 20px;
    }

    .numsite {
        font-size: 20px;
    }

    .description {
        width: 100%;
        max-width: 500px;
        color: #1f3e24;
        padding-left: 60px;
        padding-right: 60px;
    }

    .btn {
        font-family: "M PLUS 2", sans-serif;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: 0;
        border-radius: 5px;
        background: #7aae72;
        font-size: 20px;
        padding: 4px 8px;
        color: #1f3e24;
        min-width: 150px;
    }

    .btn:hover {
        background: rgb(59, 102, 59);
        cursor: pointer;
    }

    .btn:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgb(59, 102, 59);
    }

    .line2 {
        padding-top: 10px;
    }
</style>
