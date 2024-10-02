// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyByw_494F3afqcFo1A8IRiVFTw6ZPQHKlM",
    authDomain: "formulario-de-preguntas-7eced.firebaseapp.com",
    projectId: "formulario-de-preguntas-7eced",
    storageBucket: "formulario-de-preguntas-7eced.appspot.com",
    messagingSenderId: "746116712458",
    appId: "1:746116712458:web:3fa549b3ea3fe01f8f37f3",
    measurementId: "G-591MN0MFBX"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Elementos del DOM
  const loginDiv = document.getElementById('login');
  const formDiv = document.getElementById('form');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signupEmailInput = document.getElementById('signupEmail');
  const signupPasswordInput = document.getElementById('signupPassword');
  const questionForm = document.getElementById('questionForm');
  const resultsList = document.getElementById('results');
  
  // Iniciar Sesión
  loginBtn.addEventListener('click', () => {
      const email = emailInput.value;
      const password = passwordInput.value;
      auth.signInWithEmailAndPassword(email, password)
          .then(() => {
              loginDiv.style.display = 'none';
              formDiv.style.display = 'block';
          })
          .catch((error) => {
              alert('Error: ' + error.message);
          });
  });
  
  // Registrar nuevo usuario
  signupBtn.addEventListener('click', () => {
      const email = signupEmailInput.value;
      const password = signupPasswordInput.value;
  
      auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
              // Usuario registrado con éxito
              alert('Usuario registrado con éxito');
              
              // Cerrar el modal
              const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
              signupModal.hide();
          })
          .catch((error) => {
              alert('Error al registrar: ' + error.message);
          });
  });
  
  // Enviar Respuesta
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const answer = document.getElementById('answer').value;

    try {
        await db.collection('answers').add({
            answer: answer,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('answer').value = ''; // Limpiar campo
    } catch (error) {
        console.error('Error al enviar respuesta: ', error);
    }
});

  
  // Mostrar respuestas en tiempo real
  db.collection('answers').orderBy('timestamp').onSnapshot((snapshot) => {
      resultsList.innerHTML = '';
      snapshot.forEach((doc) => {
          const li = document.createElement('li');
          li.textContent = doc.data().answer;
          resultsList.appendChild(li);
      });
  });
  