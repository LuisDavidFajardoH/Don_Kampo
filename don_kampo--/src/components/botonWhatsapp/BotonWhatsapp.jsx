import React from "react";
import { FloatingWhatsApp } from "react-floating-whatsapp";

const BotonWhatsapp = () => {
  return (
    <FloatingWhatsApp
      phoneNumber="573117366666"
      accountName="Don Kampo"
      avatar="/images/icon.png"
      statusMessage="En línea"
      chatMessage="Bienvenido a Don Kampo                   ¿En qué podemos ayudarte?"
      placeholder="Escribe tu mensaje..."
      darkMode={true}
      allowClickAway={true}
      color="black" 
    />
    );
};

export default BotonWhatsapp;