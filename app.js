// 🔥 Firebase
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
  signOut // ✅ FIX 1
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔑 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAyLjBFwolyYSVwIw0fvwYdt_LBm0PZgvg",
  authDomain: "control-ingreso-camiones.firebaseapp.com",
  projectId: "control-ingreso-camiones",
  storageBucket: "control-ingreso-camiones.firebasestorage.app",
  messagingSenderId: "534705179311",
  appId: "1:534705179311:web:cc8c4377c0b84aa721225a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);



async function cargarRegistros() {

  const contenedor = document.getElementById("listaRegistros");

  if (!contenedor) return;

  contenedor.innerHTML = "<p>Cargando...</p>";

  try {

    const snapshot = await getDocs(collection(db, "registros"));

    contenedor.innerHTML = "";

    snapshot.forEach((doc) => {

      const data = doc.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <p><strong>${data.patente}</strong></p>
        <p>${data.nombre} ${data.apellidoP} ${data.apellidoM}</p>
        <p>${data.fecha} - ${data.hora}</p>
        <p>${data.destino}</p>
        <hr>
      `;

      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>Error al cargar</p>";
  }
}





// 🔓 LOGOUT
const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada");

      window.location.href = "index.html";

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });
}

// 📍 Detectar página actual (más robusto)
const path = window.location.pathname.toLowerCase();

const isLoginPage = path.endsWith("index.html") || path === "/" || path === "";
const isRegistrarPage = path.includes("registrar");
const isRegistrosPage = path.includes("registros");

// 🔐 LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login OK");

      window.location.href = "Registrar.html";

    } catch (err) {
      alert("Error login");
      console.error(err);
    }
  });
}

// 👀 CONTROL TOTAL DE SESIÓN
onAuthStateChanged(auth, (user) => {

  const userEmailSpan = document.getElementById("userEmail");

  // 🔒 NO LOGUEADO
  if (!user) {

    if (userEmailSpan) {
      userEmailSpan.textContent = "";
    }

    if (isRegistrarPage || isRegistrosPage) {
      window.location.href = "index.html";
    }

    return;
  }

  // ✅ LOGUEADO
  console.log("Logueado:", user.email);

  if (userEmailSpan) {
    userEmailSpan.textContent = user.email; // ✅ FIX 2
  }

  // 🚫 Evitar volver al login
  if (isLoginPage) {
    window.location.href = "Registrar.html";
    return;
  }


  if (user && isRegistrosPage) {
    cargarRegistros();
  }




  // 🚛 Activar formulario solo en Registrar
  if (isRegistrarPage) {

    const form = document.forms["Ingreso"];

    if (form && !form.dataset.loaded) {

      form.dataset.loaded = "true";

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
          patente: document.getElementById("Patente").value
            .toUpperCase()
            .replace(/\s/g, ""),
          nombre: document.getElementById("NombreChofer").value,
          apellidoP: document.getElementById("ApellidoPChofer").value,
          apellidoM: document.getElementById("ApellidoMChofer").value,
          fecha: document.getElementById("FechaIngreso").value,
          hora: document.getElementById("HoraIngreso").value,
          destino: document.getElementById("Destino").value,
          timestamp: new Date(),
          usuario: user.email
        };

        try {
          await addDoc(collection(db, "registros"), data);

          alert("Registro guardado 🚛");
          form.reset();

        } catch (error) {
          console.error(error);
          alert("Error al guardar");
        }
      });
    }
  }
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-right");

  if (toggle) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }
});

