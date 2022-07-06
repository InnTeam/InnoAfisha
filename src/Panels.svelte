<div class="panels-container">
    <div class="panel left-panel">
        <div class="content">
            <h1 style="font-size: 3rem">Innopolis Afisha</h1>
            <p>Sign up and select your favorite events!</p>
            <button class="btn transparent" id="sign-up-btn"> Sign up </button>
        </div>
        <img src="img/log.svg" class="image" alt="" />
    </div>
    <div class="panel right-panel">
        <div class="content">
            <h1 style="font-size: 3rem">Innopolis Afisha</h1>
            <p>Sign in and select your favorite events!</p>
            <button class="btn transparent" id="sign-in-btn"> Sign in </button>
        </div>
        <img src="img/register.svg" class="image" alt="" />
    </div>
</div>

<style>
    .panels-container {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
    .image {
        width: 100%;
        transition: transform 1.1s ease-in-out;
        transition-delay: 0.4s;
    }
</style>
