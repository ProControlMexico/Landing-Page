const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwYlK5kxWDbQMD80cbryhaow-LZjTivXX4-UAUUCKhXQji2zHoY8Md23xctAKjaw8BFVw/exec";

window.sendToGoogleSheets = async function sendToGoogleSheets(payload) {
  if (!SCRIPT_URL || SCRIPT_URL.includes("YOUR_SCRIPT_ID")) return;
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (err) {
    console.warn('Aviso de envío a Sheets:', err);
  }
};

function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.triggerWhatsApp = function triggerWhatsApp(message) {
  const number = '525540014294';
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, '_blank');
  if (popup) {
    popup.opener = null;
  } else {
    window.location.href = url;
  }
};

window.handleFormSubmit = async function handleFormSubmit(event) {
  event.preventDefault();

  const privacyCheck = document.getElementById('privacyCheck');
  const privacyError = document.getElementById('privacyError');
  const privacyAccepted = privacyCheck?.checked;
  if (!privacyAccepted) {
    privacyError?.classList.remove('hidden');
    privacyError?.classList.add('block');
    alert('Debes aceptar el aviso de privacidad antes de continuar.');
    return;
  }
  privacyError?.classList.add('hidden');
  privacyError?.classList.remove('block');

  const phoneInput = document.getElementById('telefono');
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  if (phoneDigits.length !== 10) {
    phoneInput.focus();
    alert('El teléfono es obligatorio y debe tener 10 dígitos.');
    return;
  }

  const ubicacion = document.getElementById('ubicacion').value;
  const sedesAutorizadas = ['CDMX', 'Mérida', 'Querétaro', 'Guadalajara', 'Tijuana', 'Chihuahua', 'Tapachula'];
  if (!sedesAutorizadas.includes(ubicacion)) {
    alert('Selecciona una de nuestras sedes autorizadas: CDMX, Mérida, Querétaro, Guadalajara, Tijuana, Chihuahua o Tapachula.');
    return;
  }

  const nombre = document.getElementById('nombre').value.trim();
  const empresa = document.getElementById('empresa').value.trim();
  const puestoSelect = document.getElementById('puesto');
  const puestoOtro = document.getElementById('puestoOtro');
  const puesto = puestoSelect.value === 'Otro' ? (puestoOtro.value.trim() || 'Otro') : puestoSelect.value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = phoneDigits;
  const giro = document.getElementById('giro').value;
  const proveedor = document.getElementById('proveedor').value;
  const modal = document.getElementById('successModal');
  const feedback = document.getElementById('modalUserFeedback');

  const payload = {
    fecha_hora: new Date().toISOString(),
    tipo_lead: 'AXIS',
    empresa: empresa || 'N/A',
    responsable: nombre || 'N/A',
    puesto: puesto || 'N/A',
    proveedor_actual: proveedor || 'N/A',
    tipo_establecimiento: giro || 'N/A',
    ciudad: ubicacion || 'N/A',
    telefono: telefono || 'N/A',
    correo: correo || 'No proporcionado',
    calificacion_criticos: 'N/A',
    calificacion_generales: 'N/A',
    fallas_criticas: 'N/A',
    fallas_generales: 'N/A',
    notas: 'N/A',
    aviso_privacidad: privacyAccepted ? 'Aceptado' : 'No aceptado'
  };

  const whatsappText = `Hola, vi el reel de AXIS y me interesa más información.\n\n*Nombre:* ${nombre}\n*Puesto:* ${puesto}\n*Empresa:* ${empresa}\n*Sector:* ${giro}\n*Ubicación:* ${ubicacion}\n*Teléfono:* ${telefono}\n*Correo:* ${correo || 'No proporcionado'}\n*Actualmente cuenta con servicio:* ${proveedor || 'No especificado'}\n*Procedencia:* AXIS Landing\n\nQuiero agendar un diagnóstico y conocer cómo AXIS puede apoyar a mi operación.`;

  // Sin await: window.open debe ir dentro del gesto del usuario o el navegador lo bloquea.
  // El fetch usa keepalive, así que sobrevive aunque la página navegue a WhatsApp.
  window.sendToGoogleSheets(payload);
  triggerWhatsApp(whatsappText);

  const strong = document.createElement('strong');
  strong.textContent = nombre;
  feedback.replaceChildren('Gracias ', strong, '. Hemos recibido tus datos y los hemos enviado a nuestro equipo para revisar tu caso.');
  modal.classList.remove('hidden');
  event.target.reset();
};

function closeModal() {
  document.getElementById('successModal').classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', () => {
      telefonoInput.value = telefonoInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  const puestoSelect = document.getElementById('puesto');
  const puestoOtro = document.getElementById('puestoOtro');

  if (puestoSelect && puestoOtro) {
    const togglePuestoOtro = () => {
      const isOtro = puestoSelect.value === 'Otro';
      puestoOtro.classList.toggle('hidden', !isOtro);
      if (!isOtro) {
        puestoOtro.value = '';
      }
    };

    puestoSelect.addEventListener('change', togglePuestoOtro);
    // reset() no dispara "change" y el evento "reset" se emite antes de limpiar los valores
    puestoSelect.form.addEventListener('reset', () => setTimeout(togglePuestoOtro, 0));
    // el navegador puede restaurar el select (recarga / botón atrás) sin disparar "change"
    togglePuestoOtro();
  }
});
