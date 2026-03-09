const loginF = document.querySelector("form");


// 1. Detección de entorno (Forzamos la ruta local para asegurar el JWT largo)
const URL_AUTH = '/wiki-kreative-gen15.5/backend/public/auth/login';

// Ya no necesitamos isLocal para la URL, pero podemos usarlo para logs
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
if (isLocal) console.log("Servidor detectado: Localhost");

// 2. Configuración bloqueo
const loginBtn = document.querySelector(".login-button");
let intentosFallidos = parseInt(localStorage.getItem("intentosFallidos")) || 0;
const maxIntentos = 5;
const bloqueoTiempo = 120; 

// 3. Gestión de bloqueo inicial
window.addEventListener("load", verificarBloqueo);

function verificarBloqueo() {
    const bloqueoHasta = parseInt(localStorage.getItem("bloqueoLoginHasta"));
    const ahora = Date.now();
    if (bloqueoHasta && bloqueoHasta > ahora) {
        loginBtn.disabled = true;
        actualizarMensajeBloqueo();
    } else {
        localStorage.removeItem("bloqueoLoginHasta");
        if (loginBtn) loginBtn.disabled = false;
        intentosFallidos = 0;
        localStorage.setItem("intentosFallidos", "0");
    }
}

function actualizarMensajeBloqueo() {
    const bloqueoHasta = parseInt(localStorage.getItem("bloqueoLoginHasta"));
    const ahora = Date.now();
    if (bloqueoHasta > ahora) {
        const segundosRestantes = Math.ceil((bloqueoHasta - ahora) / 1000);
        if (loginBtn) loginBtn.textContent = `Bloqueado (${segundosRestantes}s)`;
        setTimeout(actualizarMensajeBloqueo, 1000);
    } else {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Iniciar sesión";
        }
        localStorage.removeItem("bloqueoLoginHasta");
        localStorage.setItem("intentosFallidos", "0");
        intentosFallidos = 0;
    }
}

// 4. Funciones de Cifrado (Moisés)
async function obtenerClavePublica() {
    // Ajusta esta ruta si el archivo .pem está en otro lugar
    const res = await fetch('../../assets/a9f87e6df4b_secret/public.pem');
    return await res.text();
}

async function cifrarConClavePublica(textoPlano) {
    const clavePublica = await obtenerClavePublica();
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(clavePublica);
    const cifrado = encryptor.encrypt(textoPlano);
    if (!cifrado) throw new Error('Error al cifrar datos.');
    return cifrado;
}

// 5. EVENTO DE LOGIN (Lógica Unificada)
if (loginF) {
    loginF.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.querySelector("#username").value;
        const password = document.querySelector("#password").value;

        if (!username || !password) {
            mostrarErrorLogin("Por favor ingresa ambos campos.");
            return;
        }

        try {
            let response;
            let result = { success: false };

            /*// --- PASO A: INTENTO SISTEMA REAL ---
            try {
                const emailCifrado = await cifrarConClavePublica(username);
                const passwordCifrado = await cifrarConClavePublica(password);

                response = await fetch('https://systemauth.alphadocere.cl/login.php', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailCifrado, password: passwordCifrado })
                });
                result = await response.json();
            } catch (e) {
                console.log("Fallo login real, probando local...");
            }
            */

            // --- PASO B: RESPALDO LOCAL (Si falla el real o no hay red) ---
            if (!result.success && isLocal) {
                const datosLocal = new FormData();
                datosLocal.append('username', username);
                datosLocal.append('password', password);

                response = await fetch(URL_AUTH, {
                    method: "POST",
                    body: datosLocal,
                    credentials: 'include' 
                });
                result = await response.json();
            }

                        // --- PASO C: PROCESAR ÉXITO ---
            if (result.success === true) {
                // Ya no creamos la cookie con document.cookie aquí. 
                // PHP ya la envió en las cabeceras de la respuesta.
                
                console.log("✅ Login exitoso, redirigiendo...");
                sessionStorage.setItem('userLoggedIn', 'true');
                
                setTimeout(() => {
                    window.location.href = '/wiki-kreative-gen15.5/frontend/index.php';
                }, 200);
            }else {
                // MANEJO DE ERROR Y BLOQUEO
                mostrarErrorLogin(result.message || "Usuario o contraseña incorrectos.");
                intentosFallidos++;
                localStorage.setItem("intentosFallidos", intentosFallidos);

                if (intentosFallidos >= maxIntentos) {
                    const bloqueoHasta = Date.now() + (bloqueoTiempo * 1000);
                    localStorage.setItem("bloqueoLoginHasta", bloqueoHasta);
                    if (loginBtn) loginBtn.disabled = true;
                    actualizarMensajeBloqueo();
                }
            }
        } catch (error) {
            console.error("Error crítico:", error);
            mostrarErrorLogin('Error de comunicación con el servidor.');
        }
    });
}

// 6. Utilidades de interfaz (Ojo y errores)
const togglePassword = document.querySelector("#togglePassword");
const passwordP = document.querySelector("#password");

if (togglePassword && passwordP) {
    togglePassword.addEventListener("click", () => {
        const esPassword = passwordP.getAttribute("type") === "password";
        passwordP.setAttribute("type", esPassword ? "text" : "password");
        togglePassword.classList.toggle("bi-eye");
        togglePassword.classList.toggle("bi-eye-slash");
    });
}

function mostrarErrorLogin(mensaje) {
    const modal = document.getElementById("modalError-Login");
    const mensajeError = document.getElementById("mensajeError");
    if (modal && mensajeError) {
        mensajeError.textContent = mensaje;
        modal.style.display = "block";
        document.getElementById("cerrarModal").onclick = () => modal.style.display = "none";
    } else {
        alert(mensaje);
    }
}