document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginContainer = document.getElementById('login-container');
  const appContainer = document.getElementById('app-container');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');
  const sidebarMenu = document.getElementById('sidebar-menu');
  const viewContent = document.getElementById('view-content');
  const userDisplayInfo = document.getElementById('user-display-info');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const welcomeTitle = document.getElementById('welcome-title');
  const welcomeSubtitle = document.getElementById('welcome-subtitle');
  const currentDateBadge = document.getElementById('current-date-badge');

  const crudModalElement = document.getElementById('crudModal');
  const crudModal = new bootstrap.Modal(crudModalElement);
  const crudForm = document.getElementById('crudForm');
  const modalFormFields = document.getElementById('modalFormFields');
  const crudModalLabel = document.getElementById('crudModalLabel');

  const toastElement = document.getElementById('appToast');
  const appToast = new bootstrap.Toast(toastElement, { delay: 3000 });
  const toastMessage = document.getElementById('toastMessage');

  let currentView = '';
  let activeModalAction = null;

  // Usa sessionStorage para expiración automática al cerrar la pestaña
  const savedUser = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
  if (savedUser) {
    iniciarSesionUI(JSON.parse(savedUser));
  }

  function showNotification(msg) {
    toastMessage.textContent = msg;
    appToast.show();
  }

  document.querySelectorAll('.quick-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-user');
      usernameInput.value = u;
      passwordInput.value = '';
      passwordInput.focus();
      
      document.querySelectorAll('.quick-user-btn').forEach(b => b.classList.replace('btn-secondary', 'btn-outline-secondary'));
      btn.classList.replace('btn-outline-secondary', 'btn-secondary');
    });
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('d-none');
    
    const u = usernameInput.value.trim();
    const p = passwordInput.value.trim();

    try {
      const res = await ApiService.request('/auth/login', {
        method: 'POST',
        body: { username: u, password: p }
      });
      
      sessionStorage.setItem('token', res.token);
      sessionStorage.setItem('usuario', JSON.stringify(res.usuario));
      iniciarSesionUI(res.usuario);
      showNotification(`Bienvenido/a, ${res.usuario.nombre}`);
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.remove('d-none');
    }
  });

  btnLogout.addEventListener('click', () => {
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
  });

  function iniciarSesionUI(usuario) {
    loginContainer.classList.add('d-none');
    appContainer.classList.remove('d-none');
    userDisplayInfo.innerHTML = `<span class="user-badge">${usuario.nombre} &bull; <strong>${usuario.rol}</strong></span>`;
    
    // Configurar Banner de Bienvenida
    const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    currentDateBadge.textContent = hoy.charAt(0).toUpperCase() + hoy.slice(1);
    welcomeTitle.textContent = `Bienvenido/a, ${usuario.nombre}`;
    welcomeSubtitle.textContent = `Panel activo con rol de ${usuario.rol}`;

    renderMenu(usuario.rol);
  }

  function renderMenu(rol) {
    sidebarMenu.innerHTML = '';
    let opciones = [];

    if (rol === 'Administrador') {
      opciones = [
        { id: 'alumnos', label: 'Gestión de Alumnos' },
        { id: 'cursos', label: 'Cursos y Materias' }
      ];
    } else if (rol === 'Secretaría') {
      opciones = [
        { id: 'inscripciones', label: 'Inscripciones' },
        { id: 'cuotas', label: 'Cuotas y Pagos' }
      ];
    } else if (rol === 'Docente') {
      opciones = [
        { id: 'asistencias', label: 'Tomar Asistencia' },
        { id: 'notas', label: 'Cargar Notas' }
      ];
    } else if (rol === 'Alumno') {
      opciones = [
        { id: 'mi-situacion', label: 'Mi Situación' },
        { id: 'boletin', label: 'Mis Notas' }
      ];
    }

    opciones.forEach((opt, index) => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `<a href="#" class="nav-link ${index === 0 ? 'active' : ''}" data-view="${opt.id}">${opt.label}</a>`;
      li.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        cargarVista(opt.id);
      });
      sidebarMenu.appendChild(li);
    });

    if (opciones.length > 0) cargarVista(opciones[0].id);
  }

  async function cargarVista(viewId) {
    currentView = viewId;
    viewContent.innerHTML = `<div class="spinner-border text-primary" role="status"></div>`;

    try {
      if (viewId === 'alumnos') {
        const alumnos = await ApiService.request('/alumnos');
        renderAlumnosVista(alumnos);
      } else if (viewId === 'cursos') {
        const cursos = await ApiService.request('/cursos');
        renderCursosVista(cursos);
      } else if (viewId === 'inscripciones') {
        const inscripciones = await ApiService.request('/inscripciones');
        const cursos = await ApiService.request('/cursos');
        renderInscripcionesVista(inscripciones, cursos);
      } else if (viewId === 'cuotas' || viewId === 'mi-situacion') {
        const cuotas = await ApiService.request('/cuotas');
        renderCuotasVista(cuotas, viewId === 'mi-situacion');
      } else if (viewId === 'asistencias') {
        const asistencias = await ApiService.request('/asistencias');
        renderAsistenciasVista(asistencias);
      } else if (viewId === 'notas' || viewId === 'boletin') {
        const notas = await ApiService.request('/notas');
        renderNotasVista(notas, viewId === 'boletin');
      }
    } catch (e) {
      viewContent.innerHTML = `<div class="alert alert-danger">Error al cargar la información de la vista.</div>`;
    }
  }

  // VISTA ALUMNO (ADMIN)
  function renderAlumnosVista(alumnos) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Gestión de Alumnos</h3>
        <button class="btn btn-primary btn-sm px-3" id="btnNuevoAlumno">Nuevo Alumno</button>
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar por nombre o DNI...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr><th>DNI</th><th>Nombre</th><th>Email</th><th>Curso</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${alumnos.map(a => `
                <tr>
                  <td>${a.dni}</td>
                  <td><strong>${a.nombre}</strong></td>
                  <td>${a.email}</td>
                  <td>${a.curso}</td>
                  <td><span class="badge ${a.estado === 'Activo' ? 'badge-soft-success' : 'badge-soft-dark'}">${a.estado}</span></td>
                  <td>
                    <button class="btn btn-outline-primary btn-sm me-1 btn-edit" data-id="${a.id}">Editar</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${a.id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    document.getElementById('btnNuevoAlumno').addEventListener('click', () => {
      crudModalLabel.textContent = 'Nuevo Alumno';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">DNI</label><input type="text" id="mDni" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Nombre Completo</label><input type="text" id="mNombre" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Email</label><input type="email" id="mEmail" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Curso</label><input type="text" id="mCurso" class="form-control form-control-sm" required></div>
        <div class="mb-2">
          <label class="form-label small">Estado</label>
          <select id="mEstado" class="form-select form-select-sm"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select>
        </div>`;
      activeModalAction = async () => {
        await ApiService.request('/alumnos', {
          method: 'POST',
          body: {
            dni: document.getElementById('mDni').value,
            nombre: document.getElementById('mNombre').value,
            email: document.getElementById('mEmail').value,
            curso: document.getElementById('mCurso').value,
            estado: document.getElementById('mEstado').value
          }
        });
        showNotification('Alumno creado correctamente.');
      };
      crudModal.show();
    });

    bindTableEvents('/alumnos', alumnos, (item) => {
      crudModalLabel.textContent = 'Editar Alumno';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">DNI</label><input type="text" id="mDni" class="form-control form-control-sm" value="${item.dni}" required></div>
        <div class="mb-2"><label class="form-label small">Nombre Completo</label><input type="text" id="mNombre" class="form-control form-control-sm" value="${item.nombre}" required></div>
        <div class="mb-2"><label class="form-label small">Email</label><input type="email" id="mEmail" class="form-control form-control-sm" value="${item.email}" required></div>
        <div class="mb-2"><label class="form-label small">Curso</label><input type="text" id="mCurso" class="form-control form-control-sm" value="${item.curso}" required></div>
        <div class="mb-2">
          <label class="form-label small">Estado</label>
          <select id="mEstado" class="form-select form-select-sm">
            <option value="Activo" ${item.estado === 'Activo' ? 'selected' : ''}>Activo</option>
            <option value="Inactivo" ${item.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>`;
      activeModalAction = async () => {
        await ApiService.request(`/alumnos/${item.id}`, {
          method: 'PUT',
          body: {
            dni: document.getElementById('mDni').value,
            nombre: document.getElementById('mNombre').value,
            email: document.getElementById('mEmail').value,
            curso: document.getElementById('mCurso').value,
            estado: document.getElementById('mEstado').value
          }
        });
        showNotification('Alumno actualizado correctamente.');
      };
      crudModal.show();
    });
  }

  // VISTA CURSOS (ADMIN)
  function renderCursosVista(cursos) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Cursos y Materias</h3>
        <button class="btn btn-primary btn-sm px-3" id="btnNuevoCurso">Nuevo Curso</button>
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar materia o docente...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr><th>Materia</th><th>Año</th><th>Docente</th><th>Horario</th><th>Cupo / Inscriptos</th><th>Estado Cupo</th><th>Acciones</th></tr></thead>
            <tbody>
              ${cursos.map(c => {
                const max = c.cupoMaximo || 30;
                const estaCompleto = c.alumnosInscriptos >= max;
                return `
                  <tr>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.anio}</td>
                    <td>${c.docente}</td>
                    <td>${c.horario || '-'}</td>
                    <td>${c.alumnosInscriptos} / ${max}</td>
                    <td>
                      <span class="badge ${estaCompleto ? 'badge-soft-danger' : 'badge-soft-success'}">
                        ${estaCompleto ? 'Completo' : 'Cupo Disponible'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm me-1 btn-edit" data-id="${c.id}">Editar</button>
                      <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${c.id}">Eliminar</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    document.getElementById('btnNuevoCurso').addEventListener('click', () => {
      crudModalLabel.textContent = 'Nuevo Curso';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">Nombre Materia</label><input type="text" id="mNombre" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Año/División</label><input type="text" id="mAnio" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Docente a Cargo</label><input type="text" id="mDocente" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Horario</label><input type="text" id="mHorario" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Cupo Máximo</label><input type="number" id="mCupo" class="form-control form-control-sm" value="30" min="1" required></div>`;
      activeModalAction = async () => {
        await ApiService.request('/cursos', {
          method: 'POST',
          body: {
            nombre: document.getElementById('mNombre').value,
            anio: document.getElementById('mAnio').value,
            docente: document.getElementById('mDocente').value,
            horario: document.getElementById('mHorario').value,
            alumnosInscriptos: 0,
            cupoMaximo: Number(document.getElementById('mCupo').value)
          }
        });
        showNotification('Curso registrado correctamente.');
      };
      crudModal.show();
    });

    bindTableEvents('/cursos', cursos, (item) => {
      crudModalLabel.textContent = 'Editar Curso';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">Nombre Materia</label><input type="text" id="mNombre" class="form-control form-control-sm" value="${item.nombre}" required></div>
        <div class="mb-2"><label class="form-label small">Año/División</label><input type="text" id="mAnio" class="form-control form-control-sm" value="${item.anio}" required></div>
        <div class="mb-2"><label class="form-label small">Docente a Cargo</label><input type="text" id="mDocente" class="form-control form-control-sm" value="${item.docente}" required></div>
        <div class="mb-2"><label class="form-label small">Horario</label><input type="text" id="mHorario" class="form-control form-control-sm" value="${item.horario || ''}" required></div>
        <div class="mb-2"><label class="form-label small">Cupo Máximo</label><input type="number" id="mCupo" class="form-control form-control-sm" value="${item.cupoMaximo || 30}" min="1" required></div>`;
      activeModalAction = async () => {
        await ApiService.request(`/cursos/${item.id}`, {
          method: 'PUT',
          body: {
            nombre: document.getElementById('mNombre').value,
            anio: document.getElementById('mAnio').value,
            docente: document.getElementById('mDocente').value,
            horario: document.getElementById('mHorario').value,
            cupoMaximo: Number(document.getElementById('mCupo').value)
          }
        });
        showNotification('Curso actualizado correctamente.');
      };
      crudModal.show();
    });
  }

  // VISTA INSCRIPCIONES (SECRETARÍA CON CONTROL DE CUPOS)
  function renderInscripcionesVista(inscripciones, cursos) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Control de Inscripciones</h3>
        <button class="btn btn-primary btn-sm px-3" id="btnNuevaInscripcion">Nueva Inscripción</button>
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar alumno o materia...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr><th>Alumno</th><th>Materia / Curso</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${inscripciones.map(i => `
                <tr>
                  <td><strong>${i.alumno}</strong></td>
                  <td>${i.curso}</td>
                  <td>${i.fecha}</td>
                  <td><span class="badge ${i.estado === 'Aprobada' ? 'badge-soft-success' : i.estado === 'Rechazada' ? 'badge-soft-danger' : 'badge-soft-warning'}">${i.estado}</span></td>
                  <td>
                    <button class="btn btn-outline-primary btn-sm me-1 btn-edit" data-id="${i.id}">Cambiar Estado</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${i.id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    document.getElementById('btnNuevaInscripcion').addEventListener('click', () => {
      crudModalLabel.textContent = 'Registrar Inscripción';
      const opcionesCursos = cursos.map(c => {
        const estaCompleto = c.alumnosInscriptos >= (c.cupoMaximo || 30);
        return `<option value="${c.nombre}" data-completo="${estaCompleto}">${c.nombre} (${c.alumnosInscriptos}/${c.cupoMaximo || 30} ${estaCompleto ? '- COMPLETO' : ''})</option>`;
      }).join('');

      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">Nombre del Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" required></div>
        <div class="mb-2">
          <label class="form-label small">Seleccionar Materia / Curso</label>
          <select id="mCurso" class="form-select form-select-sm" required>
            ${opcionesCursos}
          </select>
        </div>
        <div id="cupoAlert" class="alert alert-warning py-2 small d-none">
          Atención: El curso seleccionado no tiene cupo disponible. La inscripción quedará registrada en estado <strong>Pendiente (Sin cupo)</strong>.
        </div>
        <div class="mb-2"><label class="form-label small">Fecha</label><input type="date" id="mFecha" class="form-control form-control-sm" value="${new Date().toISOString().split('T')[0]}" required></div>
        <div class="mb-2">
          <label class="form-label small">Estado Inicial</label>
          <select id="mEstado" class="form-select form-select-sm">
            <option value="Aprobada">Aprobada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>`;

      const cursoSelect = document.getElementById('mCurso');
      const estadoSelect = document.getElementById('mEstado');
      const cupoAlert = document.getElementById('cupoAlert');

      const evaluarCupoSeleccionado = () => {
        const option = cursoSelect.options[cursoSelect.selectedIndex];
        const esCompleto = option.getAttribute('data-completo') === 'true';
        if (esCompleto) {
          cupoAlert.classList.remove('d-none');
          estadoSelect.value = 'Pendiente';
          estadoSelect.querySelector('option[value="Aprobada"]').disabled = true;
        } else {
          cupoAlert.classList.add('d-none');
          estadoSelect.querySelector('option[value="Aprobada"]').disabled = false;
        }
      };

      cursoSelect.addEventListener('change', evaluarCupoSeleccionado);
      evaluarCupoSeleccionado();

      activeModalAction = async () => {
        const cursoNombre = cursoSelect.value;
        const estadoSelected = estadoSelect.value;
        const cursoObj = cursos.find(c => c.nombre === cursoNombre);

        await ApiService.request('/inscripciones', {
          method: 'POST',
          body: {
            alumno: document.getElementById('mAlumno').value,
            curso: cursoNombre,
            fecha: document.getElementById('mFecha').value,
            estado: estadoSelected
          }
        });

        if (estadoSelected === 'Aprobada' && cursoObj && cursoObj.alumnosInscriptos < (cursoObj.cupoMaximo || 30)) {
          await ApiService.request(`/cursos/${cursoObj.id}`, {
            method: 'PUT',
            body: { alumnosInscriptos: cursoObj.alumnosInscriptos + 1 }
          });
        }

        showNotification('Inscripción registrada correctamente.');
      };
      crudModal.show();
    });

    bindTableEvents('/inscripciones', inscripciones, (item) => {
      crudModalLabel.textContent = 'Modificar Estado de Inscripción';
      modalFormFields.innerHTML = `
        <p class="small text-muted mb-2">Alumno: <strong>${item.alumno}</strong> (${item.curso})</p>
        <div class="mb-2">
          <label class="form-label small">Estado</label>
          <select id="mEstado" class="form-select form-select-sm">
            <option value="Pendiente" ${item.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="Aprobada" ${item.estado === 'Aprobada' ? 'selected' : ''}>Aprobada</option>
            <option value="Rechazada" ${item.estado === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
          </select>
        </div>`;
      activeModalAction = async () => {
        await ApiService.request(`/inscripciones/${item.id}`, {
          method: 'PUT',
          body: { estado: document.getElementById('mEstado').value }
        });
        showNotification('Estado de inscripción actualizado.');
      };
      crudModal.show();
    });
  }

  // VISTA CUOTAS (SECRETARÍA / ALUMNO)
  function renderCuotasVista(cuotas, esAlumnoReadOnly) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Estado de Cuenta y Cuotas</h3>
        ${!esAlumnoReadOnly ? '<button class="btn btn-primary btn-sm px-3" id="btnNuevaCuota">Emitir Cuota</button>' : ''}
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar por mes, alumno o estado...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr><th>Alumno</th><th>Mes / Periodo</th><th>Importe</th><th>Estado</th><th>Fecha Pago</th>${!esAlumnoReadOnly ? '<th>Acciones</th>' : ''}</tr></thead>
            <tbody>
              ${cuotas.map(c => {
                let badge = c.estado === 'Pagada' ? 'badge-soft-success' : c.estado === 'Vencida' ? 'badge-soft-danger' : 'badge-soft-warning';
                return `
                  <tr>
                    <td><strong>${c.alumno || 'Pérez, Lucía'}</strong></td>
                    <td>${c.mes}</td>
                    <td>$${Number(c.importe).toLocaleString()}</td>
                    <td><span class="badge ${badge}">${c.estado}</span></td>
                    <td>${c.fechaPago || '-'}</td>
                    ${!esAlumnoReadOnly ? `
                      <td>
                        <button class="btn btn-outline-primary btn-sm btn-edit" data-id="${c.id}">Registrar Pago</button>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    if (!esAlumnoReadOnly) {
      document.getElementById('btnNuevaCuota').addEventListener('click', () => {
        crudModalLabel.textContent = 'Emitir Nueva Cuota';
        modalFormFields.innerHTML = `
          <div class="mb-2"><label class="form-label small">Nombre del Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" required></div>
          <div class="mb-2"><label class="form-label small">Mes / Periodo</label><input type="text" id="mMes" class="form-control form-control-sm" placeholder="ej. Junio 2026" required></div>
          <div class="mb-2"><label class="form-label small">Importe ($)</label><input type="number" id="mImporte" class="form-control form-control-sm" value="45000" required></div>`;
        activeModalAction = async () => {
          await ApiService.request('/cuotas', {
            method: 'POST',
            body: {
              alumno: document.getElementById('mAlumno').value,
              mes: document.getElementById('mMes').value,
              importe: Number(document.getElementById('mImporte').value),
              estado: 'Pendiente',
              fechaPago: '-'
            }
          });
          showNotification('Cuota emitida correctamente.');
        };
        crudModal.show();
      });

      bindTableEvents('/cuotas', cuotas, (item) => {
        crudModalLabel.textContent = 'Registrar Pago de Cuota';
        modalFormFields.innerHTML = `
          <p class="small text-muted mb-2">Periodo: <strong>${item.mes}</strong> - Importe: $${item.importe}</p>
          <div class="mb-2">
            <label class="form-label small">Estado de Pago</label>
            <select id="mEstado" class="form-select form-select-sm">
              <option value="Pagada">Pagada</option>
              <option value="Pendiente" ${item.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Vencida" ${item.estado === 'Vencida' ? 'selected' : ''}>Vencida</option>
            </select>
          </div>
          <div class="mb-2"><label class="form-label small">Fecha de Cobro</label><input type="date" id="mFechaPago" class="form-control form-control-sm" value="${new Date().toISOString().split('T')[0]}"></div>`;
        activeModalAction = async () => {
          await ApiService.request(`/cuotas/${item.id}`, {
            method: 'PUT',
            body: {
              estado: document.getElementById('mEstado').value,
              fechaPago: document.getElementById('mFechaPago').value
            }
          });
          showNotification('Pago registrado con éxito.');
        };
        crudModal.show();
      });
    }
  }

  // VISTA ASISTENCIAS (DOCENTE)
  function renderAsistenciasVista(asistencias) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Registro de Asistencias</h3>
        <button class="btn btn-primary btn-sm px-3" id="btnNuevaAsistencia">Cargar Asistencia</button>
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar por fecha, alumno o materia...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr><th>Fecha</th><th>Alumno</th><th>Materia</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${asistencias.map(as => `
                <tr>
                  <td>${as.fecha}</td>
                  <td><strong>${as.alumno}</strong></td>
                  <td>${as.materia}</td>
                  <td><span class="badge ${as.estado === 'Presente' ? 'badge-soft-success' : 'badge-soft-danger'}">${as.estado}</span></td>
                  <td>
                    <button class="btn btn-outline-primary btn-sm me-1 btn-edit" data-id="${as.id}">Editar</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${as.id}">Eliminar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    document.getElementById('btnNuevaAsistencia').addEventListener('click', () => {
      crudModalLabel.textContent = 'Registrar Asistencia';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">Fecha</label><input type="date" id="mFecha" class="form-control form-control-sm" value="${new Date().toISOString().split('T')[0]}" required></div>
        <div class="mb-2"><label class="form-label small">Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" required></div>
        <div class="mb-2"><label class="form-label small">Materia</label><input type="text" id="mMateria" class="form-control form-control-sm" value="Matemática Superior" required></div>
        <div class="mb-2">
          <label class="form-label small">Condición</label>
          <select id="mEstado" class="form-select form-select-sm">
            <option value="Presente">Presente</option>
            <option value="Ausente">Ausente</option>
          </select>
        </div>`;
      activeModalAction = async () => {
        await ApiService.request('/asistencias', {
          method: 'POST',
          body: {
            fecha: document.getElementById('mFecha').value,
            alumno: document.getElementById('mAlumno').value,
            materia: document.getElementById('mMateria').value,
            estado: document.getElementById('mEstado').value
          }
        });
        showNotification('Asistencia cargada.');
      };
      crudModal.show();
    });

    bindTableEvents('/asistencias', asistencias, (item) => {
      crudModalLabel.textContent = 'Editar Asistencia';
      modalFormFields.innerHTML = `
        <div class="mb-2"><label class="form-label small">Fecha</label><input type="date" id="mFecha" class="form-control form-control-sm" value="${item.fecha}" required></div>
        <div class="mb-2"><label class="form-label small">Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" value="${item.alumno}" required></div>
        <div class="mb-2"><label class="form-label small">Materia</label><input type="text" id="mMateria" class="form-control form-control-sm" value="${item.materia}" required></div>
        <div class="mb-2">
          <label class="form-label small">Condición</label>
          <select id="mEstado" class="form-select form-select-sm">
            <option value="Presente" ${item.estado === 'Presente' ? 'selected' : ''}>Presente</option>
            <option value="Ausente" ${item.estado === 'Ausente' ? 'selected' : ''}>Ausente</option>
          </select>
        </div>`;
      activeModalAction = async () => {
        await ApiService.request(`/asistencias/${item.id}`, {
          method: 'PUT',
          body: {
            fecha: document.getElementById('mFecha').value,
            alumno: document.getElementById('mAlumno').value,
            materia: document.getElementById('mMateria').value,
            estado: document.getElementById('mEstado').value
          }
        });
        showNotification('Asistencia actualizada.');
      };
      crudModal.show();
    });
  }

  // VISTA NOTAS (DOCENTE / ALUMNO)
  function renderNotasVista(notas, esAlumnoReadOnly) {
    viewContent.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h4 m-0 fw-bold">Boletín y Calificaciones</h3>
        ${!esAlumnoReadOnly ? '<button class="btn btn-primary btn-sm px-3" id="btnNuevaNota">Cargar Nota</button>' : ''}
      </div>
      <div class="card p-3">
        <div class="mb-3">
          <input type="text" class="form-control form-control-sm" id="searchTabla" placeholder="Buscar por materia o evaluación...">
        </div>
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0" id="mainTable">
            <thead><tr>${!esAlumnoReadOnly ? '<th>Alumno</th>' : ''}<th>Materia</th><th>Evaluación</th><th>Nota</th><th>Comentarios</th>${!esAlumnoReadOnly ? '<th>Acciones</th>' : ''}</tr></thead>
            <tbody>
              ${notas.map(n => `
                <tr>
                  ${!esAlumnoReadOnly ? `<td><strong>${n.alumno || 'Pérez, Lucía'}</strong></td>` : ''}
                  <td><strong>${n.materia}</strong></td>
                  <td>${n.evaluacion}</td>
                  <td><span class="badge badge-soft-dark fs-6">${n.nota}</span></td>
                  <td>${n.comentario || '-'}</td>
                  ${!esAlumnoReadOnly ? `
                    <td>
                      <button class="btn btn-outline-primary btn-sm me-1 btn-edit" data-id="${n.id}">Editar</button>
                      <button class="btn btn-outline-danger btn-sm btn-delete" data-id="${n.id}">Eliminar</button>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    setupSearchFilter();

    if (!esAlumnoReadOnly) {
      document.getElementById('btnNuevaNota').addEventListener('click', () => {
        crudModalLabel.textContent = 'Cargar Nueva Calificación';
        modalFormFields.innerHTML = `
          <div class="mb-2"><label class="form-label small">Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" required></div>
          <div class="mb-2"><label class="form-label small">Materia</label><input type="text" id="mMateria" class="form-control form-control-sm" value="Matemática Superior" required></div>
          <div class="mb-2"><label class="form-label small">Evaluación</label><input type="text" id="mEvaluacion" class="form-control form-control-sm" placeholder="ej. Parcial 2" required></div>
          <div class="mb-2"><label class="form-label small">Nota (1 a 10)</label><input type="number" id="mNota" class="form-control form-control-sm" min="1" max="10" required></div>
          <div class="mb-2"><label class="form-label small">Comentarios</label><input type="text" id="mComentario" class="form-control form-control-sm"></div>`;
        activeModalAction = async () => {
          await ApiService.request('/notas', {
            method: 'POST',
            body: {
              alumno: document.getElementById('mAlumno').value,
              materia: document.getElementById('mMateria').value,
              evaluacion: document.getElementById('mEvaluacion').value,
              nota: Number(document.getElementById('mNota').value),
              comentario: document.getElementById('mComentario').value
            }
          });
          showNotification('Calificación registrada.');
        };
        crudModal.show();
      });

      bindTableEvents('/notas', notas, (item) => {
        crudModalLabel.textContent = 'Editar Calificación';
        modalFormFields.innerHTML = `
          <div class="mb-2"><label class="form-label small">Alumno</label><input type="text" id="mAlumno" class="form-control form-control-sm" value="${item.alumno || ''}" required></div>
          <div class="mb-2"><label class="form-label small">Materia</label><input type="text" id="mMateria" class="form-control form-control-sm" value="${item.materia}" required></div>
          <div class="mb-2"><label class="form-label small">Evaluación</label><input type="text" id="mEvaluacion" class="form-control form-control-sm" value="${item.evaluacion}" required></div>
          <div class="mb-2"><label class="form-label small">Nota</label><input type="number" id="mNota" class="form-control form-control-sm" value="${item.nota}" min="1" max="10" required></div>
          <div class="mb-2"><label class="form-label small">Comentarios</label><input type="text" id="mComentario" class="form-control form-control-sm" value="${item.comentario || ''}"></div>`;
        activeModalAction = async () => {
          await ApiService.request(`/notas/${item.id}`, {
            method: 'PUT',
            body: {
              alumno: document.getElementById('mAlumno').value,
              materia: document.getElementById('mMateria').value,
              evaluacion: document.getElementById('mEvaluacion').value,
              nota: Number(document.getElementById('mNota').value),
              comentario: document.getElementById('mComentario').value
            }
          });
          showNotification('Calificación actualizada.');
        };
        crudModal.show();
      });
    }
  }

  // BUSCADOR EN TIEMPO REAL
  function setupSearchFilter() {
    const input = document.getElementById('searchTabla');
    if (!input) return;
    input.addEventListener('keyup', () => {
      const term = input.value.toLowerCase();
      const rows = document.querySelectorAll('#mainTable tbody tr');
      rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }

  // EVENTOS PARA EDICIÓN Y ELIMINACIÓN DE REGISTROS
  function bindTableEvents(endpoint, dataset, onEdit) {
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const item = dataset.find(i => i.id === id);
        if (item) onEdit(item);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Desea eliminar este registro?')) {
          await ApiService.request(`${endpoint}/${id}`, { method: 'DELETE' });
          showNotification('Registro eliminado.');
          cargarVista(currentView);
        }
      });
    });
  }

  // EVENTO SUBMIT DEL FORMULARIO MODAL
  crudForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (activeModalAction) {
      await activeModalAction();
      crudModal.hide();
      cargarVista(currentView);
    }
  });
});