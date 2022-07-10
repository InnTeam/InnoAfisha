<script lang="ts">
    import Spinner from "../extra/services/spinner.svelte";
    export let params = "";
    let event = [];
    async function getEvent() {
        const res = await fetch(
            `http://innoafisha.pythonanywhere.com/api/v1/events/` + params
        );
        const json = await res.json();
        if (res.ok) {
            setTimeout(() => {
                event = json;
                return true;
            }, 0 * Math.random());
        }
    }
    let promise = getEvent();
</script>

{#await promise}
    <Spinner />
{:then getEvent}
    <div class="columns">
        <div class="col_left">
            <div class="event_pic">
                <!-- svelte-ignore a11y-missing-attribute -->
                <img
                    class="event_pic"
                    src={event["picture"]}
                    width="373px"
                    height="373px"
                />
                <div class="dateplace">
                    <div class="line1">
                        <button class="rectangle2">{event["date"]}</button>
                        <button class="rectangle2">{event["location"]}</button>
                    </div>
                </div>
                <div class="numsite">
                    <div class="line2">
                        <button class="rectangle2">{event["time"]}</button>
                        <a href={event["link"]}
                            ><button class="btn">Site</button></a
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
{/await}

<style>
    @import url("https://fonts.googleapis.com/css2?family=M+PLUS+2&display=swap");
    .event_pic {
        border-radius: 11px;
    }
    .rectangle1 {
        padding: 10px;
        background-color: #fff;
        border-radius: 11px;
        margin-bottom: 30px;
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
        font-size: 30px;
        padding-top: 40px;
    }
    .title::after {
        content: "";
        display: block;
        height: 2px;
        width: 500px;
        background-color: #b3caaf;
        margin: 15px auto;
    }
    .dateplace {
        font-size: 20px;
    }
    .numsite {
        font-size: 20px;
    }
    .description {
        width: 100%;
        max-width: 600px;
        color: #1f3e24;
        font-size: 25px;
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
    }
    .line2 {
        padding-top: 10px;
        padding-bottom: 30px;
    }
    .line1 {
        padding-top: 30px;
    }
</style>
