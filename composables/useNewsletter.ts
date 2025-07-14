import { ref } from 'vue';

/**
 * Estado de la suscripción
 */
interface SubscriptionState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

/**
 * Composable para gestionar la suscripción a la newsletter
 */
export function useNewsletter() {
  // Estado de la suscripción
  const state = ref<SubscriptionState>({
    loading: false,
    success: false,
    error: null
  });

  // Email del suscriptor
  const email = ref<string>('');

  // Validar formato de email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Suscribir email a la newsletter
  const subscribe = async () => {
    // Resetear estado
    state.value.success = false;
    state.value.error = null;

    // Validar email
    if (!email.value) {
      state.value.error = 'Por favor, introduce tu email';
      return;
    }

    if (!isValidEmail(email.value)) {
      state.value.error = 'Por favor, introduce un email válido';
      return;
    }

    // Inicio carga
    state.value.loading = true;

    try {
      // Obtengo configuración de runtime para la URL de la API
      const config = useRuntimeConfig();
      const API_BASE = config.public.api.base;
      const API_PATH = config.public.api.newsletter || 'newsletter/subscribe';

      // Obtengo el token CSRF de la cookie
      const csrfToken = useCookie('XSRF-TOKEN').value;

      // Realizo la llamada a la API
      const response = await fetch(`${API_BASE}/${API_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        credentials: 'include', // Incluyo cookies en la solicitud
        body: JSON.stringify({ email: email.value }),
      });

      if (!response.ok) {
        // Manejo diferentes códigos de error
        if (response.status === 422) {
          // Error de validación
          const errorData = await response.json();
          throw new Error(errorData.message || 'El email proporcionado no es válido');
        } else if (response.status === 409) {
          // Conflicto - el email ya está suscrito
          throw new Error('Este email ya está suscrito a nuestra newsletter');
        } else {
          throw new Error('Error al suscribirse a la newsletter');
        }
      }

      // Proceso respuesta exitosa
      const data = await response.json();

      // Marco como exitoso y limpio el formulario
      state.value.success = true;
      email.value = ''; // Limpiar email después de suscripción exitosa

    } catch (error) {
      // Capturo y muestro error
      console.error('Error al suscribirse:', error);

      // Muestro el mensaje de error específico si está disponible
      if (error instanceof Error) {
        state.value.error = error.message;
      } else {
        state.value.error = 'Ha ocurrido un error al intentar suscribirte. Por favor, inténtalo de nuevo más tarde.';
      }
    } finally {
      // Finalizar carga
      state.value.loading = false;
    }
  };

  // Resetear el formulario
  const reset = () => {
    email.value = '';
    state.value.success = false;
    state.value.error = null;
  };

  return {
    email,
    state,
    subscribe,
    reset
  };
}
