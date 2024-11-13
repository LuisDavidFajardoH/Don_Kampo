import React, { useEffect, useState } from "react";
import "./InstallPrompt.css"; // CSS para el modal

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Escucha el evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); // Evita que el navegador muestre el prompt nativo
      setDeferredPrompt(e); // Guarda el evento para usarlo más tarde
      setShowModal(true); // Muestra el modal
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Muestra el prompt nativo de instalación
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("El usuario aceptó instalar la app");
        } else {
          console.log("El usuario rechazó instalar la app");
        }
        setDeferredPrompt(null); // Limpia el evento
        setShowModal(false); // Cierra el modal
      });
    }
  };

  const handleCancel = () => {
    setShowModal(false); // Cierra el modal si el usuario decide no instalar
  };

  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>¿Quieres instalar esta aplicación?</h2>
        <p>Puedes instalar esta aplicación en tu dispositivo para un acceso más rápido y una experiencia más cómoda.</p>
        <div className="modal-actions">
          <button onClick={handleInstall}>Instalar</button>
          <button onClick={handleCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
