const SUPABASE_URL = 'https://oavhefketpjocebnxjle.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hdmhlZmtldHBqb2NlYm54amxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjc5NjgsImV4cCI6MjA2NTUwMzk2OH0.duPfj6qdU1f3Lu3mPbLfZTSiniOKZ5umv6AGmKCGNcA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tablaContenido = document.getElementById('tabla-contenido');

// Mostrar Equipos
async function mostrarEquipos() {
    const { data, error } = await supabase.from('equipo').select('*');
    if (error) {
        tablaContenido.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        tablaContenido.innerHTML = '<p>No hay equipos cargados.</p>';
        return;
    }

    let html = `<h3>Equipos</h3><table class="table table-bordered">
      <thead><tr><th>ID</th><th>Marca</th><th>Modelo</th><th>Descripción</th><th>Reparado</th><th>Cliente CUIL</th><th>Ingreso</th><th>Acciones</th></tr></thead><tbody>`;

    data.forEach(eq => {
        html += `<tr>
          <td>${eq.id}</td><td>${eq.marca}</td><td>${eq.modelo}</td>
          <td>${eq.descr}</td><td>${eq.estado ? 'Sí' : 'No'}</td>
          <td>${eq.clienteCuil}</td><td>${eq.fIngreso}</td>
          <td>
            <button class="btn btn-sm btn-info" onclick="editarEquipo(${eq.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarEquipo(${eq.id})">Eliminar</button>
          </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tablaContenido.innerHTML = html;
}

// Mostrar Clientes
async function mostrarClientes() {
    const { data, error } = await supabase.from('cliente').select('*');
    if (error) {
        tablaContenido.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        tablaContenido.innerHTML = '<p>No hay clientes cargados.</p>';
        return;
    }

    let html = `<h3>Clientes</h3><table class="table table-bordered">
        <thead><tr><th>CUIL</th><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead><tbody>`;

    data.forEach(cl => {
        html += `<tr>
            <td>${cl.cuil}</td><td>${cl.nom}</td><td>${cl.dire}</td>
            <td>${cl.tel}</td><td>${cl.correo}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="editarCliente('${cl.cuil}')">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarCliente('${cl.cuil}')">Eliminar</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tablaContenido.innerHTML = html;
}

// Agregar Cliente
const formCliente = document.getElementById('formAgregarCliente');
formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente = {
        cuil: document.getElementById('cuil').value,
        nom: document.getElementById('nombre').value,
        dire: document.getElementById('direccion').value,
        tel: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value
    };
    await supabase.from('cliente').upsert(cliente);
    bootstrap.Modal.getInstance(document.getElementById('modalAgregarCliente')).hide();
    formCliente.reset();
    mostrarClientes();
});

// Cargar clientes en el select al abrir modal de equipo
async function cargarClientesEnSelect() {
    const { data, error } = await supabase.from('cliente').select('*');
    const select = document.getElementById('clienteSelect');
    select.innerHTML = '<option value="">Selecciona un Cliente</option>';
    data?.forEach(c => {
        select.innerHTML += `<option value="${c.cuil}">${c.nom}</option>`;
    });
}
document.getElementById('modalAgregarEquipo').addEventListener('show.bs.modal', cargarClientesEnSelect);

// Agregar Equipo
const formEquipo = document.getElementById('formAgregarEquipo');
formEquipo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const equipo = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        descr: document.getElementById('descripcion').value,
        estado: document.getElementById('estado').value === 'true',
        fIngreso: document.getElementById('fIngreso').value,
        clienteCuil: document.getElementById('clienteSelect').value
    };
    await supabase.from('equipo').insert(equipo);
    bootstrap.Modal.getInstance(document.getElementById('modalAgregarEquipo')).hide();
    formEquipo.reset();
    mostrarEquipos();
});

// Eliminar Cliente
async function eliminarCliente(cuil) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
    await supabase.from('cliente').delete().eq('cuil', cuil);
    mostrarClientes();
}

// Eliminar Equipo
async function eliminarEquipo(id) {
    if (!confirm("¿Seguro que deseas eliminar este equipo?")) return;
    await supabase.from('equipo').delete().eq('id', id);
    mostrarEquipos();
}

// Editar Cliente
async function editarCliente(cuil) {
    const { data } = await supabase.from('cliente').select('*').eq('cuil', cuil).single();
    document.getElementById('cuil').value = data.cuil;
    document.getElementById('nombre').value = data.nom;
    document.getElementById('direccion').value = data.dire;
    document.getElementById('telefono').value = data.tel;
    document.getElementById('correo').value = data.correo;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarCliente')).show();
}

// Editar Equipo
// Editar Equipo
async function editarEquipo(id) {
    const { data, error } = await supabase.from('equipo').select('*').eq('id', id).single();
    if (error) {
        alert('Error al obtener equipo: ' + error.message);
        return;
    }

    // Cargar datos del cliente asignado (solo ese)
    const { data: cliente } = await supabase.from('cliente').select('*').eq('cuil', data.clienteCuil).single();
    const select = document.getElementById('clienteSelect');
    select.innerHTML = `<option value="${cliente.cuil}" selected>${cliente.nom}</option>`;
    select.disabled = true; // ❌ No permitir cambiar el cliente

    // Cargar datos del equipo
    document.getElementById('marca').value = data.marca;
    document.getElementById('modelo').value = data.modelo;
    document.getElementById('descripcion').value = data.descr;
    document.getElementById('estado').value = data.estado ? 'true' : 'false';
    document.getElementById('fIngreso').value = data.fIngreso;

    // Reemplazar listener del formulario
    const formEquipo = document.getElementById('formAgregarEquipo');
    const nuevoForm = formEquipo.cloneNode(true);
    formEquipo.parentNode.replaceChild(nuevoForm, formEquipo);

    nuevoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const equipoActualizado = {
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            descr: document.getElementById('descripcion').value,
            estado: document.getElementById('estado').value === 'true',
            fIngreso: document.getElementById('fIngreso').value
            // clienteCuil no se modifica
        };

        await supabase.from('equipo').update(equipoActualizado).eq('id', id);
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarEquipo')).hide();
        mostrarEquipos();
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarEquipo')).show();
}

// Inicialización
window.onload = () => {
    mostrarEquipos();
};

window.mostrarClientes = mostrarClientes;
window.mostrarEquipos = mostrarEquipos;
window.eliminarCliente = eliminarCliente;
window.eliminarEquipo = eliminarEquipo;
window.editarCliente = editarCliente;
window.editarEquipo = editarEquipo;
