<script lang="ts">
    import axios from "axios";

    let usernameL = "",
        passwordL = "";
    let axiosConfig = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    $: submit = async () => {
        await axios
            .post(
                "https://innoafisha.pythonanywhere.com/auth/token/login",
                {
                    password: passwordL,
                    username: usernameL,
                },
                axiosConfig
            )
            .then((res) => {
                console.log("RESPONSE RECEIVED: ", res);
                if (res.status === 200)
                    axios.defaults.headers.common[
                        "Authorization"
                    ] = `Bearer ${res.data.auth_token}`;
            })
            .catch((err) => {
                console.log("AXIOS ERROR: ", err);
            });
    };
</script>

<form action="#" class="sign-in-form" on:submit|preventDefault={submit}>
    <h2 class="titleA">Sign in</h2>
    <div class="input-field">
        <i class="fas fa-user" />
        <input bind:value={usernameL} type="text" placeholder="Username" />
    </div>
    <div class="input-field">
        <i class="fas fa-lock" />
        <input bind:value={passwordL} type="password" placeholder="Password" />
    </div>
    <input type="submit" value="Login" class="btnA solid" />
</form>

<style>
    form {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 0rem 5rem;
        transition: all 0.2s 0.7s;
        overflow: hidden;
        grid-column: 1 / 2;
        grid-row: 1 / 2;
    }

    .titleA {
        font-size: 3rem;
        color: #444;
        margin-bottom: 10px;
    }

    .input-field {
        max-width: 380px;
        width: 100%;
        background-color: #f0f0f0;
        margin: 10px 0;
        height: 55px;
        border-radius: 55px;
        display: grid;
        grid-template-columns: 15% 85%;
        padding: 0 0.4rem;
        position: relative;
    }
</style>
