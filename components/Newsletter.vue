<template>
    <div class="box-newsletter">
        <div class="newsletter-header">
            <div class="newsletter-icon">
                <NuxtImg src="/images/icons/social/mail.svg" width="24" alt="Logo de Mail" />
            </div>
            <h3 class="newsletter-title">Suscríbete a nuestra newsletter</h3>
        </div>

        <div class="newsletter-content">
            <p class="newsletter-description">Recibe las últimas noticias y tutoriales directamente en tu correo.</p>

            <form @submit.prevent="subscribe" class="newsletter-form">
                <div class="form-group" :class="{ 'has-error': state.error }">
                    <input 
                        type="email" 
                        v-model="email" 
                        placeholder="Tu correo electrónico" 
                        class="newsletter-input"
                        :disabled="state.loading"
                    />
                    <span v-if="state.error" class="error-message">{{ state.error }}</span>
                </div>

                <button 
                    type="submit" 
                    class="newsletter-button" 
                    :disabled="state.loading"
                >
                    <span v-if="!state.loading">Enviar</span>
                    <span v-else class="loading-spinner"></span>
                </button>
            </form>

            <div v-if="state.success" class="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="success-icon">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor"/>
                </svg>
                <p>¡Gracias por suscribirte! Pronto recibirás nuestras actualizaciones.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useNewsletter } from '~/composables/useNewsletter';

const { email, state, subscribe } = useNewsletter();
</script>

<style scoped>
.box-newsletter {
    background-color: #2d3748;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: white;
    padding: 1.5rem;
}

.newsletter-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.newsletter-icon {
    background-color: transparent;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
}

.newsletter-icon img {
    color: var(--primary);
    filter: invert(21%) sepia(90%) saturate(2259%) hue-rotate(337deg) brightness(94%) contrast(96%);
}

.newsletter-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
}

.newsletter-description {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    opacity: 0.8;
}

.newsletter-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
}

.form-group {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 1rem; /* Increased spacing between input and button */
}

.newsletter-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
    max-width: 100%;
}

.newsletter-input:focus {
    outline: none;
    border-color: var(--primary);
    background-color: rgba(255, 255, 255, 0.1);
}

.newsletter-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.newsletter-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 42px;
    width: 100%; /* Make button take full width */
}

.newsletter-button:hover {
    background-color: #0056b3;
}

.newsletter-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error-message {
    color: #ff6b6b;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
}

.success-message {
    display: flex;
    align-items: center;
    background-color: rgba(72, 187, 120, 0.1);
    border: 1px solid rgba(72, 187, 120, 0.3);
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 1rem;
}

.success-icon {
    color: #48bb78;
    margin-right: 0.5rem;
    flex-shrink: 0;
}

.success-message p {
    margin: 0;
    font-size: 0.9rem;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.has-error .newsletter-input {
    border-color: #ff6b6b;
}

/* Desktop styles removed to keep consistent column layout */
</style>
