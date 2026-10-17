document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que la página se recargue

    const usuarioInput = document.getElementById('usuario').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;
    const mensajeError = document.getElementById('mensajeError');

    // Simulación de validación de roles basada en tus diagramas y actores
    if (usuarioInput === 'admin' && passwordInput === '1234') {
        alert('¡Bienvenido Administrador! Redirigiendo al panel de control...');
        // window.location.href = 'dashboard-admin.html'; (Pronto crearemos esta pantalla)
    } 
    else if (usuarioInput === 'secretaria' && passwordInput === '1234') {
        alert('¡Bienvenido Personal Administrativo! Redirigiendo a gestiones de pagos e inscripciones...');
        // window.location.href = 'dashboard-admin.html'; 
    }
    else if (usuarioInput === 'docente' && passwordInput === '1234') {
        alert('¡Bienvenido Docente! Redirigiendo al registro de notas y asistencias...');
        // window.location.href = 'dashboard-docente.html';
    }
    else if (usuarioInput === 'alumno' && passwordInput === '1234') {
        alert('¡Bienvenido Alumno! Redirigiendo a tu autoconcaulta...');
        // window.location.href = 'dashboard-alumno.html';
    }
    else {
        // Muestra el mensaje de error si los datos no coinciden
        mensajeError.classList.remove('d-none');
    }
});

// Lógica para Alta de Docentes (Panel Administrador)
const formAltaDocente = document.getElementById('formAltaDocente');
if (formAltaDocente) {
    formAltaDocente.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombreDocente').value;
        const materia = document.getElementById('materiaAsignada').value;

        const tabla = document.getElementById('tablaDocentes');
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${nombre}</td>
            <td>${materia}</td>
            <td><span class="badge bg-success">Activo</span></td>
        `;
        tabla.appendChild(nuevaFila);

        const alerta = document.getElementById('alertaDocente');
        alerta.classList.remove('d-none');
        formAltaDocente.reset();
        setTimeout(() => { alerta.classList.add('d-none'); }, 3000);
    });
}

// Lógica para Alta de Cursos (Panel Administrador)
const formAltaCurso = document.getElementById('formAltaCurso');
if (formAltaCurso) {
    formAltaCurso.addEventListener('submit', function(e) {
        e.preventDefault();
        const curso = document.getElementById('nombreCurso').value;
        const cupo = document.getElementById('cupoMaximo').value;

        const tabla = document.getElementById('tablaCursos');
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${curso}</td>
            <td>${cupo} Alumnos</td>
            <td><span class="badge bg-success">Vacantes Disponibles</span></td>
        `;
        tabla.appendChild(nuevaFila);

        const alerta = document.getElementById('alertaCurso');
        alerta.classList.remove('d-none');
        formAltaCurso.reset();
        setTimeout(() => { alerta.classList.add('d-none'); }, 3000);
    });
}