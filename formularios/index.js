// Variables para evaluar preguntas
const formulario = document.getElementById('formulario');
const capital = document.getElementsByName('capital');
const educacion = document.getElementById('nivel');
const lenguaje = document.getElementById('lenguaje');
const anio = document.getElementById('anio');


//Variables para modal
const promedio = document.getElementById('promedio');
const modal = document.getElementById('modal');
const btnFinalizar = document.getElementById('finalizar');
let ancho = window.innerWidth;

formulario.addEventListener('submit',(e)=>{
    e.preventDefault();
    
    const respuestaSeleccionada = [
        Array.from(capital).filter((ciudad)=>{
            if(ciudad.checked){
                return ciudad.id;
            };
            return;
        })[0]?.id,
        educacion.value,
        lenguaje.value.trim(),
        anio.value
    ];
    console.log(respuestaSeleccionada);
    
    const capitalSeleccionada = Array.from(capital).map(ciudad=>ciudad.checked && ciudad.id === 'mexico')[0]
    const nivelEducacion = educacion.value === 'bachiller';
    const lenguajeProgramacion = lenguaje.value.toLowerCase().trim().includes('javascript');
    const anioCreacion = anio.value === '1995';

    const preguntasCorrectas = [capitalSeleccionada,nivelEducacion,lenguajeProgramacion,anioCreacion].filter(pregunta=>{
        return pregunta === true;
    });
    
    const promedioTotal = (preguntasCorrectas.length / 4) * 10;
    
    mostrarModal(promedioTotal, respuestaSeleccionada);

    formulario.reset();
});

function mostrarModal(promedioTotal,respuestaSeleccionada) {
    promedio.textContent = promedioTotal + '/10';
    modal.classList.add('modal--dinamico');
    if(respuestaSeleccionada.length > 0){
        graficaPregunta(respuestaSeleccionada[0],document.getElementById('preguntaUno'),'¿Cual es la capital de Mexico?');
        graficaPregunta(respuestaSeleccionada[1],document.getElementById('preguntaDos'),'¿Que titulo universitario tenia Steve Jobs en sus inicios?');
        graficaPregunta(respuestaSeleccionada[2],document.getElementById('preguntaTres'),'¿A que lenguaje de programacion pertenece las siglas JS?');
        graficaPregunta(respuestaSeleccionada[3],document.getElementById('preguntaCuatro'),'¿En que fecha se creo JS?');
    }
}

function graficaPregunta(respuesta,elemento,pregunta){

    google.charts.load('current', {'packages':['corechart']});

     google.charts.setOnLoadCallback(drawChart);

    function drawChart(){
        
        var data = new google.visualization.DataTable();
       data.addColumn('string', 'Topping');
       data.addColumn('number', 'Slices');
       data.addRows([
        [respuesta, 1]
       ]);

       var options = {
                'title': pregunta,
                'height': 200,
                'width':ancho-80,
       };

       var chart = new google.visualization.PieChart(elemento);
       chart.draw(data, options);
    }
}

btnFinalizar.addEventListener('click',()=>{
    modal.classList.remove('modal--dinamico');
});
document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState !== 'visible'){
        mostrarModal(0,[]);   
    }
});