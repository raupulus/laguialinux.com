<template>
    <div class="box-nb">
        <div class="box-nb-banner">
            <NuxtImg src="/images/banners/reading.png" alt="banner" style="width: 100%;"/>
        </div>


        <div class="box-nb-more-readers">
            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">Desc 1</NuxtLink>
                </div>
            </article>

            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">Desc 2</NuxtLink>
                </div>
            </article>

            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">Desc 3</NuxtLink>
                </div>
            </article>
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>

.box-nb {
    position: relative;
    margin: 0;
    padding: 1.3rem;
    width: 100%;
    background-color: var(--secondary);
    box-sizing: border-box;
}

.box-nb-banner {
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}
.box-nb-more-readers {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    box-sizing: border-box;
}

.nb-card {
    position: relative;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: var(--blue);
    box-sizing: border-box;
    color: red;
    border: 5px solid #454a51;
}

.nb-card-image {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.nb-card-image img {
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}

.nb-card-title {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 1.2rem;
    font-weight: bold;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.5);
}

.nb-card-title a {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: var(--white);
}

@media (max-width: 768px) {
    .box-nb {
        padding: 0.5rem;
    }

    .box-nb-more-readers {
        grid-template-columns: 1fr;
    }
}
</style>
