<template>
    <div>
        aaaa
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
/** TODO: background select cambiar color **/
/*
.box-search {}

.box-search-title {}

.box-search-fields {}
*/

.img-technology-search {
    margin-left: 1px;
    margin-right: 3px;
    width: 23px;
    height: 23px;
    translate: 0 3px;
}

.technology-select-feature {
    font-weight: bold;
    font-size: 1.3rem;
    text-shadow: 1px 1px 1px #000;
}

.category-input {
    display: grid;
    margin: auto;
    width: 80%;
    max-width: 600px;
    grid-template-columns: 1fr 50px;
    align-items: center;
    box-sizing: border-box;
}

.category-input>.box-search>input {
    margin: 0 auto;
    padding: 10px 45px 10px 10px;
    width: 100%;
    font-size: 1.3rem;
    font-weight: bold;
    color: rgba(20, 20, 20, 0.64);
    background-color: var(--gray);
    border: none;
    border-radius: 4px;
    box-sizing: border-box;
}

.category-input>.box-search>input::placeholder {
    font-style: italic;
}

.category-input>.btn-clean {
    display: grid;
    padding-left: 0.5rem;
    height: 100%;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
}

.category-input>.btn-clean>img {
    width: 100%;
    fill: rgba(20, 20, 20, 0.64);
}

.category-input>.btn-clean>img:hover {
    filter: brightness(10%);
}

.category-input>.box-search>.btn-search {
    position: absolute;
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 0;
    translate: -50px;
    border: 1px solid transparent;
    border-radius: inherit;
    background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='bi bi-search' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
    cursor: pointer;
    opacity: 0.5;
}

.category-input>.box-search>span:hover {
    opacity: 1;
}

.category-input>.box-search>span:focus,
.category-input>.box-search>input:focus {
    box-shadow: 0 0 3px 0 var(--primary);
    border-color: var(--primary);
    outline: none;
}

/*** Proyectos ***/
.box-projects {
    /*
    margin-top: 4rem;
    padding: 2rem 1.3rem
    */
    padding: 0.9rem 0.6rem
}

.projects-content-resume {
    text-align: right;
}

@media (max-width: 880px) {
    .category-input {
        width: 100%;
        padding: 0 1.3rem;
    }

    .box-projects {
        margin-top: 0.6rem;
        padding: 1.3rem 0.6rem;
    }

    .projects-content-resume {
        text-align: center;
    }
}
</style>
