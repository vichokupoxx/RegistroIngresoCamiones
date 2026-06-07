// ============================
// 🔥 FIREBASE IMPORTS
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ============================
// 🔑 CONFIG FIREBASE (COMPLETA)
// ⚠️ ASEGÚRATE QUE ESTO SEA REAL
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyAyLjBFwolyYSVwIw0fvwYdt_LBm0PZgvg",
  authDomain: "control-ingreso-camiones.firebaseapp.com",
  projectId: "control-ingreso-camiones",
  storageBucket: "control-ingreso-camiones.firebasestorage.app",
  messagingSenderId: "534705179311",
  appId: "1:534705179311:web:cc8c4377c0b84aa721225a",
};

// ============================
// 🚀 INIT
// ============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================
// 📍 DETECTAR PÁGINA
// ============================
const path = window.location.pathname.toLowerCase();

const isLoginPage =
  path.endsWith("index.html") || path === "/" || path === "";

const isRegistrarPage = path.includes("registrar");
const isRegistrosPage = path.includes("registros");

// ============================
// 🧠 MOSTRAR APP
// ============================
function mostrarApp() {
  const appDiv = document.getElementById("app");
  if (appDiv) appDiv.classList.add("ready");
}

// ============================
// 🔐 LOGIN
// ============================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
      alert("Error interno: inputs no encontrados");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "Registrar.html";
    } catch (error) {
      console.error("ERROR LOGIN:", error);

      if (error.code === "auth/invalid-credential") {
        alert("Correo o contraseña incorrectos");
      } else {
        alert("Error al iniciar sesión");
      }
    }
  });
}

// ============================
// 🔓 LOGOUT
// ============================
const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("ERROR LOGOUT:", error);
    }
  });
}

// ============================
// 📊 CARGAR REGISTROS
// ============================
async function cargarRegistros() {
  const contenedor = document.getElementById("listaRegistros");

  if (!contenedor) return;

  contenedor.innerHTML = "Cargando...";

  try {
    const snapshot = await getDocs(collection(db, "registros"));

    contenedor.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <p><strong>${data.patente || ""}</strong></p>
        <p>${data.nombre || ""} ${data.apellidoP || ""}</p>
        <p>${data.fecha || ""} ${data.hora || ""}</p>
        <p>${data.destino || ""}</p>
        <hr>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("ERROR REGISTROS:", error);
    contenedor.innerHTML = "Error al cargar";
  }
}

// ============================
// 🔐 CONTROL DE SESIÓN
// ============================
onAuthStateChanged(auth, async (user) => {

  try {

    const userEmailSpan = document.getElementById("userEmail");

    // ❌ NO LOGUEADO
    if (!user) {

      if (isRegistrarPage || isRegistrosPage) {
        window.location.href = "index.html";
        return;
      }

      mostrarApp();
      return;
    }

    // ✅ LOGUEADO
    if (userEmailSpan) {
      userEmailSpan.textContent = user.email;
    }

    // Redirección desde login
    if (isLoginPage) {
      window.location.href = "Registrar.html";
      return;
    }

    // 📊 Página registros
    if (isRegistrosPage) {
      await cargarRegistros();
    }

    // 🚛 Página registrar
    if (isRegistrarPage) {

      const form = document.getElementById("ingresoForm");

      if (form && !form.dataset.loaded) {

        form.dataset.loaded = "true";

        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          try {

            const data = {
              patente: document.getElementById("Patente")?.value || "",
              nombre: document.getElementById("NombreChofer")?.value || "",
              apellidoP: document.getElementById("ApellidoPChofer")?.value || "",
              apellidoM: document.getElementById("ApellidoMChofer")?.value || "",
              fecha: document.getElementById("FechaIngreso")?.value || "",
              hora: document.getElementById("HoraIngreso")?.value || "",
              destino: document.getElementById("Destino")?.value || "",
              usuario: user.email,
              timestamp: new Date()
            };

            await addDoc(collection(db, "registros"), data);

            alert("Registro guardado 🚛");
            form.reset();

          } catch (error) {
            console.error("ERROR GUARDAR:", error);
            alert("Error al guardar");
          }
        });
      }
    }

    mostrarApp();

  } catch (error) {
    console.error("ERROR GLOBAL:", error);
    mostrarApp();
  }

});

// ============================
// 📱 MENÚ RESPONSIVE (FIX REAL)
// ============================
document.addEventListener("DOMContentLoaded", () => {

  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navLinks");

  if (toggle && nav) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.toggle("active");
    });

    document.addEventListener("click", () => {
      nav.classList.remove("active");
    });

    nav.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

});