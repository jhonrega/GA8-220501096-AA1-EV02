document.getElementById('registro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('fecha').value;
    const incidentType = document.getElementById('tipo-incidente').value;
    const description = document.getElementById('descripcion').value;
    const location = document.getElementById('ubicacion').value;
    const responsible = document.getElementById('responsable').value;
    const actionsTaken = document.getElementById('acciones').value;
    const results = document.getElementById('resultados').value;

    try {
        const response = await fetch('/register-incident', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, incidentType, description, location, responsible, actionsTaken, results })
        });

        const data = await response.json();
        alert(data.message || data.error);

        // Limpiar el formulario
        if (response.ok) {
            document.getElementById('registro-form').reset();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al registrar el incidente.');
    }
});
