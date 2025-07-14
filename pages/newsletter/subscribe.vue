<template>
  <div class="newsletter-page">
    <h1 class="page-title">Suscríbete a nuestra Newsletter</h1>
    
    <div class="newsletter-container">
      <div class="newsletter-info">
        <h2>Mantente al día con las últimas novedades</h2>
        <p>Suscríbete a nuestra newsletter para recibir:</p>
        <ul>
          <li>Tutoriales y guías sobre Linux</li>
          <li>Noticias sobre software libre</li>
          <li>Consejos y trucos para mejorar tu experiencia con Linux</li>
          <li>Información sobre nuevas distribuciones y actualizaciones</li>
        </ul>
        <p>No compartiremos tu correo electrónico con terceros y puedes darte de baja en cualquier momento.</p>
      </div>
      
      <div class="newsletter-form-container">
        <form @submit.prevent="subscribe" class="newsletter-form">
          <div class="form-group" :class="{ 'has-error': state.error }">
            <label for="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email"
              v-model="email" 
              placeholder="Tu correo electrónico" 
              class="newsletter-input"
              :disabled="state.loading"
              required
            />
            <span v-if="state.error" class="error-message">{{ state.error }}</span>
          </div>

          <button 
            type="submit" 
            class="newsletter-button" 
            :disabled="state.loading"
          >
            <span v-if="!state.loading">Suscribirme</span>
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
  </div>
</template>

<script lang="ts" setup>
import { useNewsletter } from '~/composables/useNewsletter';

const { email, state, subscribe } = useNewsletter();

// SEO
useHead({
  title: 'Suscríbete a nuestra Newsletter - La Guía Linux',
  meta: [
    { name: 'description', content: 'Suscríbete a la newsletter de La Guía Linux para recibir las últimas noticias, tutoriales y guías sobre Linux y software libre.' },
    { name: 'keywords', content: 'newsletter, suscripción, linux, software libre, tutoriales, guías, noticias' },
  ]
});
</script>

<style scoped>
.newsletter-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary);
  font-size: 2.5rem;
}

.newsletter-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.newsletter-info {
  color: white;
}

.newsletter-info h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.newsletter-info p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.newsletter-info ul {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.newsletter-info li {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.newsletter-form-container {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 8px;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: white;
  font-weight: 600;
}

.newsletter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: rgba(255, 255, 255, 0.15);
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.newsletter-button {
  padding: 1rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
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
  font-size: 0.9rem;
}

.success-message {
  display: flex;
  align-items: center;
  background-color: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.3);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  color: white;
}

.success-icon {
  color: #48bb78;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
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

/* Responsive styles */
@media (min-width: 768px) {
  .newsletter-container {
    grid-template-columns: 1fr 1fr;
  }
}
</style>