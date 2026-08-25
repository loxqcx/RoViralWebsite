// Made by loxqcx on Discord.
import { useState } from 'react';

export default function ServiceLogo({ service, variant }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`service-logo service-logo--${variant}`} aria-hidden="true">
      {!failed && service.logo
        ? <img src={service.logo} alt="" onError={() => setFailed(true)} />
        : <span>{service.id}</span>}
    </span>
  );
}
