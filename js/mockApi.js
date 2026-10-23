const MOCK_DATA = {
  usuarios: [
    { user: 'admin', pass: 'admin123', rol: 'Administrador', nombre: 'Carlos Director' },
    { user: 'secretaria', pass: 'secre123', rol: 'Secretaría', nombre: 'María Administrativa' },
    { user: 'docente', pass: 'docente123', rol: 'Docente', nombre: 'Roberto Matemático' },
    { user: 'alumno', pass: 'alumno123', rol: 'Alumno', nombre: 'Lucía Pérez' }
  ],
  alumnos: [
    { id: 1, dni: '42111222', nombre: 'Pérez, Lucía', email: 'lucia.perez@email.com', curso: '5° Año A', estado: 'Activo' },
    { id: 2, dni: '43555666', nombre: 'Correa, Abril', email: 'abril.correa@email.com', curso: '5° Año A', estado: 'Activo' },
    { id: 3, dni: '44888999', nombre: 'Gómez, Tomás', email: 'tomas.gomez@email.com', curso: '4° Año B', estado: 'Activo' },
    { id: 4, dni: '41222333', nombre: 'Benítez, Sofía', email: 'sofia.benitez@email.com', curso: '6° Año C', estado: 'Inactivo' },
    { id: 5, dni: '45333444', nombre: 'Martínez, Mateo', email: 'mateo.martinez@email.com', curso: '5° Año A', estado: 'Activo' },
    { id: 6, dni: '46777888', nombre: 'Fernández, Camila', email: 'camila.fernandez@email.com', curso: '4° Año B', estado: 'Activo' },
    { id: 7, dni: '43999111', nombre: 'Ríos, Valentín', email: 'valentin.rios@email.com', curso: '6° Año C', estado: 'Activo' },
    { id: 8, dni: '42888222', nombre: 'López, Martina', email: 'martina.lopez@email.com', curso: '5° Año A', estado: 'Activo' }
  ],
  cursos: [
    { id: 101, nombre: 'Matemática Superior', anio: '5° Año A', docente: 'Roberto Matemático', horario: 'Lun y Mié 08:00 - 10:00', cupoMaximo: 30, alumnosInscriptos: 30 },
    { id: 102, nombre: 'Literatura Contemporánea', anio: '5° Año A', docente: 'Ana Letras', horario: 'Mar y Jue 10:30 - 12:30', cupoMaximo: 30, alumnosInscriptos: 25 },
    { id: 103, nombre: 'Física I', anio: '4° Año B', docente: 'Carlos Física', horario: 'Viernes 08:00 - 12:00', cupoMaximo: 35, alumnosInscriptos: 28 },
    { id: 104, nombre: 'Química General', anio: '4° Año B', docente: 'Elena Química', horario: 'Lun y Mié 10:30 - 12:30', cupoMaximo: 25, alumnosInscriptos: 25 },
    { id: 105, nombre: 'Historia Argentina', anio: '6° Año C', docente: 'Gonzalo Historia', horario: 'Martes 08:00 - 11:00', cupoMaximo: 30, alumnosInscriptos: 18 },
    { id: 106, nombre: 'Inglés Técnico', anio: '5° Año A', docente: 'Laura Idiomas', horario: 'Jueves 08:00 - 10:00', cupoMaximo: 30, alumnosInscriptos: 22 }
  ],
  inscripciones: [
    { id: 1, alumno: 'Pérez, Lucía', curso: 'Matemática Superior', fecha: '2026-03-02', estado: 'Aprobada' },
    { id: 2, alumno: 'Correa, Abril', curso: 'Literatura Contemporánea', fecha: '2026-03-03', estado: 'Aprobada' },
    { id: 3, alumno: 'Gómez, Tomás', curso: 'Física I', fecha: '2026-03-05', estado: 'Aprobada' },
    { id: 4, alumno: 'Martínez, Mateo', curso: 'Matemática Superior', fecha: '2026-03-10', estado: 'Aprobada' },
    { id: 5, alumno: 'Fernández, Camila', curso: 'Química General', fecha: '2026-03-12', estado: 'Aprobada' },
    { id: 6, alumno: 'Ríos, Valentín', curso: 'Matemática Superior', fecha: '2026-03-15', estado: 'Pendiente' },
    { id: 7, alumno: 'López, Martina', curso: 'Química General', fecha: '2026-03-18', estado: 'Rechazada' }
  ],
  cuotas: [
    { id: 1, alumno: 'Pérez, Lucía', mes: 'Marzo 2026', importe: 45000, estado: 'Pagada', fechaPago: '2026-03-05' },
    { id: 2, alumno: 'Pérez, Lucía', mes: 'Abril 2026', importe: 45000, estado: 'Pagada', fechaPago: '2026-04-10' },
    { id: 3, alumno: 'Pérez, Lucía', mes: 'Mayo 2026', importe: 45000, estado: 'Pendiente', fechaPago: '-' },
    { id: 4, alumno: 'Correa, Abril', mes: 'Mayo 2026', importe: 45000, estado: 'Vencida', fechaPago: '-' },
    { id: 5, alumno: 'Gómez, Tomás', mes: 'Marzo 2026', importe: 45000, estado: 'Pagada', fechaPago: '2026-03-08' },
    { id: 6, alumno: 'Martínez, Mateo', mes: 'Mayo 2026', importe: 45000, estado: 'Pagada', fechaPago: '2026-05-02' },
    { id: 7, alumno: 'Fernández, Camila', mes: 'Mayo 2026', importe: 45000, estado: 'Pendiente', fechaPago: '-' },
    { id: 8, alumno: 'Ríos, Valentín', mes: 'Abril 2026', importe: 45000, estado: 'Vencida', fechaPago: '-' }
  ],
  asistencias: [
    { id: 1, fecha: '2026-10-20', alumno: 'Pérez, Lucía', materia: 'Matemática Superior', estado: 'Presente' },
    { id: 2, fecha: '2026-10-20', alumno: 'Correa, Abril', materia: 'Matemática Superior', estado: 'Presente' },
    { id: 3, fecha: '2026-10-20', alumno: 'Gómez, Tomás', materia: 'Física I', estado: 'Ausente' },
    { id: 4, fecha: '2026-10-20', alumno: 'Martínez, Mateo', materia: 'Matemática Superior', estado: 'Presente' },
    { id: 5, fecha: '2026-10-21', alumno: 'Fernández, Camila', materia: 'Química General', estado: 'Presente' },
    { id: 6, fecha: '2026-10-21', alumno: 'Pérez, Lucía', materia: 'Literatura Contemporánea', estado: 'Presente' },
    { id: 7, fecha: '2026-10-21', alumno: 'López, Martina', materia: 'Inglés Técnico', estado: 'Ausente' }
  ],
  notas: [
    { id: 1, alumno: 'Pérez, Lucía', materia: 'Matemática Superior', evaluacion: 'Parcial 1', nota: 9, comentario: 'Excelente desempeño analítico.' },
    { id: 2, alumno: 'Pérez, Lucía', materia: 'Matemática Superior', evaluacion: 'Trabajo Práctico', nota: 8, comentario: 'Muy buen trabajo grupal.' },
    { id: 3, alumno: 'Correa, Abril', materia: 'Matemática Superior', evaluacion: 'Parcial 1', nota: 7, comentario: 'Buen desarrollo en los ejercicios.' },
    { id: 4, alumno: 'Martínez, Mateo', materia: 'Matemática Superior', evaluacion: 'Parcial 1', nota: 10, comentario: 'Examen perfecto.' },
    { id: 5, alumno: 'Pérez, Lucía', materia: 'Literatura Contemporánea', evaluacion: 'Ensayo Literario', nota: 10, comentario: 'Excepcional comprensión de texto.' },
    { id: 6, alumno: 'Gómez, Tomás', materia: 'Física I', evaluacion: 'Laboratorio 1', nota: 6, comentario: 'Debe reforzar el informe técnico.' },
    { id: 7, alumno: 'Fernández, Camila', materia: 'Química General', evaluacion: 'Parcial 1', nota: 8, comentario: 'Muy buen manejo de fórmulas.' }
  ]
};

class MockApiService {
  static async authenticate(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = MOCK_DATA.usuarios.find(u => u.user === username && u.pass === password);
        if (found) {
          resolve({ token: 'mock-jwt-token-xyz', usuario: found });
        } else {
          reject({ message: 'Usuario o contraseña incorrectos.' });
        }
      }, 150);
    });
  }

  static async getData(resource) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const key = resource.replace('/', '');
        resolve(MOCK_DATA[key] ? [...MOCK_DATA[key]] : []);
      }, 150);
    });
  }

  static async createItem(resource, item) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const key = resource.replace('/', '');
        item.id = Date.now();
        if (!MOCK_DATA[key]) MOCK_DATA[key] = [];
        MOCK_DATA[key].push(item);
        resolve(item);
      }, 150);
    });
  }

  static async updateItem(resource, id, updatedData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const key = resource.replace('/', '');
        const index = MOCK_DATA[key]?.findIndex(i => i.id === Number(id));
        if (index !== -1 && index !== undefined) {
          MOCK_DATA[key][index] = { ...MOCK_DATA[key][index], ...updatedData };
          resolve(MOCK_DATA[key][index]);
        } else {
          reject({ message: 'Registro no encontrado' });
        }
      }, 150);
    });
  }

  static async deleteItem(resource, id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const key = resource.replace('/', '');
        if (MOCK_DATA[key]) {
          MOCK_DATA[key] = MOCK_DATA[key].filter(i => i.id !== Number(id));
        }
        resolve({ success: true });
      }, 150);
    });
  }
}