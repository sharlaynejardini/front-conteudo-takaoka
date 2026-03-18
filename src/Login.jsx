import { supabase } from "./supabaseClient";
import logoTakaoka from "./assets/logo_takaoka.png";
import logoTakaokaImg from "./assets/logo_takaoka_img.png";

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
    <div style={styles.container}>

      {/* LADO ESQUERDO */}
      <div style={styles.left}>

        {/* OVERLAY SUAVE */}
        <div style={styles.overlay}></div>

        {/* IMAGEM COM FUNDO CORRIGIDO */}
        <div style={styles.imageBox}>
          <img
            src={logoTakaokaImg}
            alt="Imagem Escola"
            style={styles.leftImage}
          />
        </div>

        <h1 style={styles.brandTitle}>Sistema Escolar</h1>

        <p style={styles.brandSubtitle}>
          Gestão de conteúdos, trabalhos EMEIEF ENG. YOJIRO TAKAOKA
        </p>

      </div>

      {/* LADO DIREITO */}
      <div style={styles.right}>
        <div style={styles.card}>

          <img src={logoTakaoka} alt="Logo" style={styles.logo} />

          <h2 style={styles.title}>Entrar</h2>

          <p style={styles.subtitle}>
            Use sua conta institucional
          </p>

          <button
            onClick={() => loginGoogle("professor.barueri.br")}
            style={styles.googleBtn}
          >
            <span>🔐</span> Entrar como Professor
          </button>

          <button
            onClick={() => loginGoogle("educbarueri.sp.gov.br")}
            style={{ ...styles.googleBtn, background: "#16a34a" }}
          >
            <span>🏫</span> Entrar como Educação
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "Segoe UI, sans-serif"
  },

  /* ESQUERDA */
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden"
  },

  overlay: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "50%",
    top: "-100px",
    right: "-100px",
    filter: "blur(100px)"
  },

  imageBox: {
    background: "white", // 👈 resolve transparência
    padding: "12px",
    borderRadius: "16px",
    marginBottom: "30px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)"
  },

  leftImage: {
    width: "100%",
    maxWidth: "280px",
    borderRadius: "10px"
  },

  brandTitle: {
    fontSize: "34px",
    fontWeight: "700"
  },

  brandSubtitle: {
    marginTop: "10px",
    opacity: 0.9,
    maxWidth: "400px",
    lineHeight: "1.4"
  },

  /* DIREITA */
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc"
  },

  card: {
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  logo: {
    width: "80%",
    marginBottom: "20px"
  },

  title: {
    marginBottom: "5px",
    fontSize: "22px"
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "20px"
  },

  googleBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    transition: "0.2s"
  }
};

export default Login;