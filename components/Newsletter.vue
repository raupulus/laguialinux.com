<template>
    <div class="box-newsletter">
        <div class="box-newsletter-icon">
            <NuxtImg src="/images/icons/social/mail.svg" width="32" alt="Logo de Mail" />
        </div>

        <div class="box-newsletter-text">
            Suscríbete
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.box-newsletter {
    display: grid;
    grid-template-columns: auto 1fr;
    background-color: red;
    align-items: center;
    box-sizing: border-box;
}

.box-newsletter-icon {
    display: flex;
    height: 100%;
    padding: 10px 5px;
    align-items: center;
    justify-content: center;
    background-color: var(--danger);
    box-sizing: border-box;
}

.box-newsletter-text {
    display: flex;
    height: 100%;
    padding: 10px 5px;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--danger);
    background-color: var(--black);
    box-sizing: border-box;
}
</style>
