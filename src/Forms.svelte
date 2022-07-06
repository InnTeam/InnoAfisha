<div class="forms-container">
    <div class="signin-signup">
        <form action="#" class="sign-in-form">
            <h2 class="title">Sign in</h2>
            <div class="input-field">
                <i class="fas fa-user" />
                <input type="text" placeholder="Username" />
            </div>
            <div class="input-field">
                <i class="fas fa-lock" />
                <input type="password" placeholder="Password" />
            </div>
            <input type="submit" value="Login" class="btn solid" />
        </form>
        <form action="#" class="sign-up-form">
            <h2 class="title">Sign up</h2>
            <div class="input-field">
                <i class="fas fa-user" />
                <input type="text" placeholder="Username" />
            </div>
            <div class="input-field">
                <i class="fas fa-envelope" />
                <input type="email" placeholder="Email" />
            </div>
            <div class="input-field">
                <i class="fas fa-lock" />
                <input type="password" placeholder="Password" />
            </div>
            <input type="submit" class="btn" value="Sign up" />
        </form>
    </div>
</div>

<style>
    .forms-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }

    .signin-signup {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 75%;
        width: 50%;
        transition: 1s 0.7s ease-in-out;
        display: grid;
        grid-template-columns: 1fr;
        z-index: 5;
    }

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

    .title {
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
