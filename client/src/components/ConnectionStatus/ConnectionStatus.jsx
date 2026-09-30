import "./ConnectionStatus.css";

function ConnectionStatus({ state, message }) {
  return (
    <div className={`connection connection--${state}`} role="status">
      <span className="connection-indicator" aria-hidden="true" />
      <div>
        <strong>Development connection</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ConnectionStatus;