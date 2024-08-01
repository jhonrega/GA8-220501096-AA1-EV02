document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/incidents');
        const incidents = await response.json();

        const tableBody = document.querySelector('#incidents-table tbody');
        incidents.forEach(incident => {
            const row = document.createElement('tr');

            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(incident.date).toLocaleDateString();
            row.appendChild(dateCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = incident.incidentType;
            row.appendChild(typeCell);

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = incident.description;
            row.appendChild(descriptionCell);

            const locationCell = document.createElement('td');
            locationCell.textContent = incident.location;
            row.appendChild(locationCell);

            const responsibleCell = document.createElement('td');
            responsibleCell.textContent = incident.responsible;
            row.appendChild(responsibleCell);

            const actionsCell = document.createElement('td');
            actionsCell.textContent = incident.actionsTaken;
            row.appendChild(actionsCell);

            const resultsCell = document.createElement('td');
            resultsCell.textContent = incident.results;
            row.appendChild(resultsCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener los incidentes:', error);
        alert('Ocurrió un error al obtener los incidentes.');
    }
});
