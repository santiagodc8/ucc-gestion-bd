// Configuración de Firebase
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

// Estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        loginDiv.style.display = 'none';
        formDiv.style.display = 'block';
        initializeCharts();  // Inicializar los gráficos
        loadRealTimeAnswers();
    } else {
        loginDiv.style.display = 'block';
        formDiv.style.display = 'none';
    }
});

// Iniciar Sesión
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
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
            alert('Usuario registrado con éxito');
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
    const favoriteLanguage = document.getElementById('favoriteLanguage').value;
    const experienceLevel = document.getElementById('experienceLevel').value;
    const user = auth.currentUser;

    try {
        await db.collection('answers').add({
            favoriteLanguage: favoriteLanguage,
            experienceLevel: experienceLevel,
            userId: user.uid,
            userEmail: user.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Resetear el formulario
        questionForm.reset();
    } catch (error) {
        console.error('Error al enviar respuesta: ', error);
        alert('Error al enviar la respuesta: ' + error.message);
    }
});

// Inicializar gráficos
let languageChart, experienceChart;
function initializeCharts() {
    // Gráfico de Lenguajes
    const languageCtx = document.getElementById('languageChart').getContext('2d');
    languageChart = new Chart(languageCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Distribución de Lenguajes Favoritos'
                }
            }
        }
    });

    // Gráfico de Experiencia
    const experienceCtx = document.getElementById('experienceChart').getContext('2d');
    experienceChart = new Chart(experienceCtx, {
        type: 'bar',
        data: {
            labels: ['Principiante', 'Intermedio', 'Avanzado'],
            datasets: [{
                label: 'Nivel de Experiencia',
                data: [0, 0, 0],
                backgroundColor: [
                    '#FF9F40',
                    '#4BC0C0',
                    '#36A2EB'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Función para actualizar los gráficos
function updateCharts(answers) {
    // Procesar datos para el gráfico de lenguajes
    const languageCounts = {};
    const experienceCounts = {
        'Principiante': 0,
        'Intermedio': 0,
        'Avanzado': 0
    };

    answers.forEach(answer => {
        // Contar lenguajes
        languageCounts[answer.favoriteLanguage] = (languageCounts[answer.favoriteLanguage] || 0) + 1;
        // Contar niveles de experiencia
        experienceCounts[answer.experienceLevel]++;
    });

    // Actualizar gráfico de lenguajes
    languageChart.data.labels = Object.keys(languageCounts);
    languageChart.data.datasets[0].data = Object.values(languageCounts);
    languageChart.update();

    // Actualizar gráfico de experiencia
    experienceChart.data.datasets[0].data = [
        experienceCounts['Principiante'],
        experienceCounts['Intermedio'],
        experienceCounts['Avanzado']
    ];
    experienceChart.update();
}

// Función para cargar respuestas en tiempo real
function loadRealTimeAnswers() {
    // Desuscribirse de cualquier listener anterior
    if (window.unsubscribe) {
        window.unsubscribe();
    }

    window.unsubscribe = db.collection('answers')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            resultsList.innerHTML = ''; // Limpiar la lista
            const answers = []; // Array para almacenar las respuestas

            snapshot.forEach((doc) => {
                const data = doc.data();
                answers.push(data); // Guardar cada respuesta

                const li = document.createElement('li');
                li.classList.add('list-group-item');
                
                // Formatear la fecha
                const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
                const formattedDate = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();

                // Crear el contenido del elemento de la lista
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Lenguaje:</strong> ${data.favoriteLanguage}<br>
                            <strong>Nivel:</strong> ${data.experienceLevel}<br>
                            <small class="text-muted">Por: ${data.userEmail}</small>
                        </div>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                `;
                resultsList.appendChild(li);
            });

            // Actualizar los gráficos con las respuestas recopiladas
            updateCharts(answers);
        }, (error) => {
            console.error("Error al cargar respuestas: ", error);
        });
}

// Cerrar sesión
const logoutButton = document.createElement('button');
logoutButton.textContent = 'Cerrar Sesión';
logoutButton.classList.add('btn', 'btn-danger', 'mt-3');
logoutButton.addEventListener('click', () => {
    auth.signOut();
});
formDiv.appendChild(logoutButton);
