import { supabase } from "./supabaseClient";
import logoTakaoka from "./assets/logo_takaoka.png";

function Login() {

  const loginGoogle = async () => {

    const redirectUrl = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          hd: "professor.barueri.br"
        }
      }
    });
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "50px 40px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4285F4",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px"
  };

  const subtitleStyle = {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "10px"
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <img
          src={logoTakaoka}
          alt="Logo"
          style={{ width: "100%", marginBottom: "25px" }}
        />

        <h2 style={{ marginBottom: "10px", color: "#1e3a8a" }}>
          Acesso Restrito
        </h2>

        <p style={subtitleStyle}>
          Utilize sua conta institucional para acessar o sistema.
        </p>

        <button onClick={loginGoogle} style={buttonStyle}>
          <span style={{ fontSize: "18px" }}>🔵</span>
          Entrar com Google
        </button>

      </div>
    </div>
  );
}

export default Login;