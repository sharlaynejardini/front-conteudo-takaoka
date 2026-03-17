import { supabase } from "./supabaseClient";
import logoTakaoka from "./assets/logo_takaoka.png";

function Login() {

  const loginGoogle = async (domain) => {

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: { hd: domain },
        scopes: "email profile"
      }
    });

    if (error) {
      alert(`Erro ao fazer login: ${error.message}`);
    }
  };

  return (
    <div style={styles.page}>
      
      {/* FUNDO COM GRADIENTE + EFEITO */}
      <div style={styles.backgroundGlow}></div>

      <div style={styles.card}>

        <img
          src={logoTakaoka}
          alt="Logo"
          style={styles.logo}
        />

        <h2 style={styles.title}>
          Acesso Restrito
        </h2>

        <p style={styles.subtitle}>
          Use sua conta institucional para continuar
        </p>

        {/* BOTÃO PROFESSOR */}
        <button
          onClick={() => loginGoogle("professor.barueri.br")}
          style={{ ...styles.button, ...styles.blue }}
        >
          <span style={styles.icon}>👨‍🏫</span>
          Entrar como Professor
        </button>

        {/* BOTÃO EDUCAÇÃO */}
        <button
          onClick={() => loginGoogle("educbarueri.sp.gov.br")}
          style={{ ...styles.button, ...styles.green }}
        >
          <span style={styles.icon}>🏫</span>
          Entrar como Educação
        </button>

        <p style={styles.footer}>
          Prefeitura de Barueri • Sistema Escolar 2026
        </p>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
    position: "relative",
    overflow: "hidden"
  },

  backgroundGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "rgba(255,255,255,0.08)",
    filter: "blur(120px)",
    top: "-100px",
    right: "-100px"
  },

  card: {
    backgroundColor: "white",
    padding: "45px 35px",
    borderRadius: "18px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    animation: "fadeIn 0.6s ease"
  },

  logo: {
    width: "90%",
    marginBottom: "20px"
  },

  title: {
    marginBottom: "8px",
    color: "#1e3a8a",
    fontSize: "22px"
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "25px"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.2s ease",
    marginTop: "10px"
  },

  blue: {
    backgroundColor: "#2563eb",
    color: "white"
  },

  green: {
    backgroundColor: "#16a34a",
    color: "white"
  },

  icon: {
    fontSize: "18px"
  },

  footer: {
    marginTop: "25px",
    fontSize: "12px",
    color: "#9ca3af"
  }
};

export default Login;