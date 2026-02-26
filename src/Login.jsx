import { supabase } from "./supabaseClient";

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

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Acesso Restrito</h2>
      <button onClick={loginGoogle}>
        Entrar com Google
      </button>
    </div>
  );
}

export default Login;