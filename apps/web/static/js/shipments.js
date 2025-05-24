const reloadButton = document.getElementById('reloadButton');
const showShipment = document.getElementById('showShipment');

const typeSelect = document.getElementById('typeSelect');
const priceSelect = document.getElementById('priceSelect');

const packageContainer = document.getElementById('packageContainer');
const packageCheckbox = document.getElementById('packageCheckbox');

const senderContainer = document.getElementById('senderContainer');
const senderInput = document.getElementById('senderInput');

const envelopeContainer = document.getElementById('envelopeContainer');
const envelopeInput = document.getElementById('envelopeInput');

const shipmentModal = new bootstrap.Modal(document.getElementById('shipmentModal'));
const shipmentForm = document.getElementById('shipmentForm');
const shipmentButton = document.getElementById('shipmentButton');

let table;

document.addEventListener('DOMContentLoaded', function () {
    initializeTable();
});

function showNotification(type, title, message, time = 3000) {
    Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: time,
        timerProgressBar: true
    }).fire({
        icon: type,
        title: title,
        text: message
    });
};

async function printQR(data) {

}

function showDetails(data) {
    return (
        `
        <div class="d-flex flex-column my-2">
            <div class="text-center mb-3">
                <h2 class="text-decoration-underline link-offset-1 fs-4">Detalles del envio</h2>
            </div>
            <div class="d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-md-around">
                <div class="shipment-details text-center">
                    <p><strong>Fecha de envio:</strong> ${data.creation_date}</p>
                    <p><strong>Numero de seguimiento:</strong> ${data.tracking_number}</p>
                    <p><strong>Remitente:</strong> ${data.sender}</p>
                    <p><strong>Destinatario:</strong> ${data.recipient}</p>
                </div>
                <div class="shipment-status text-center">
                    <p><strong>Fecha de actualizacion:</strong> ${data.update_date}</p>
                    <p><strong>Estado:</strong> ${data.status.name}</p>
                    <p class="text-decoration-underline link-offset-1 fs-4 m-1">Total</p>
                    <p class="fs-4 bg-success rounded-pill d-inline-block px-3 text-white">$ ${data.total_amount}</p>
                </div>
            </div>
            <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
                <button class="btn btn-warning fw-medium">Reimprimir ticket</button>
                <button class="btn btn-success fw-medium">Confirmar entrega</button>
            </div>
        </div>
        `
    );
};

function initializeTable() {
    if (table) {
        table.destroy();
        $('#shipmentsTable').empty();
    }

    table = new DataTable('#shipmentsTable', {
        ajax: {
            url: '/api/v1/shipments/',
            type: 'GET',
            dataSrc: ''
        },
        columnDefs: [
            {
                targets: '_all',
                className: 'text-center align-middle'
            }
        ],
        columns: [
            {
                className: 'dt-control',
                orderable: false,
                data: null,
                defaultContent: '<i class="ti ti-id fs-4"></i>'
            },
            { data: 'tracking_number' },
            { data: 'sender' },
            { data: 'recipient' }
        ],
        order: [1],
        processing: true,
        responsive: true,
        scrollY: '67vh',
        scrollCollapse: true,
        paging: false,
        info: false,
        language: {
            url: '/static/json/es-ES.json'
        }
    });

    table.on('click', 'td.dt-control', (e) => {
        let tr = e.target.closest('tr');
        let row = table.row(tr);
     
        if (row.child.isShown()) {
            row.child.hide();
        }
        else {
            row.child(showDetails(row.data())).show();
        }
    });
};

showShipment.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/v1/packages_categories/');
        const data = await response.json();

        if (!response.ok) {
            throw new Error();
        }

        typeSelect.innerHTML = '';
        priceSelect.innerHTML = '';

        data.package_types.forEach(type => {
            typeSelect.innerHTML += `<option value="${type.id}">${type.name}</option>`;
        });

        data.package_prices.forEach(price => {
            priceSelect.innerHTML += `<option value="${price.id}">${price.name} - $${price.mount}</option>`;
        });

        shipmentModal.show();
    } catch {
        showNotification('error', 'Error contacte con el administrador');
    }
});

shipmentButton.addEventListener('click', async () => {
    const formData = new FormData(shipmentForm);

    const sender = formData.get('sender');
    const envelopeAmount = formData.get('envelope_amount');

    formData.set('sender', !sender || sender === '' ? 'N&C' : sender);
    formData.set('envelope_amount', !envelopeAmount || envelopeAmount === '' ? 0 : envelopeAmount);

    formData.append('package_type', typeSelect.value);
    formData.append('package_amount', priceSelect.value);
    formData.append('package_pickup', packageCheckbox.checked);

    const formDataObject = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/v1/create_shipment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        });
        const data = await response.json();

        if (!response.ok) {
            showNotification('error', 'Error al crear el envio');
            return;
        }

        if (table) {
            table.ajax.reload();
        }
        
        showNotification('success', 'Envio creado correctamente');
        shipmentModal.hide();
    } catch (error) {
        showNotification('error', 'Error al contactar con el servidor');
    }
});

typeSelect.addEventListener('change', function() {
    if (this.options[this.selectedIndex].text.toLowerCase() === 'turismo') {
        senderInput.disabled = true;
        senderInput.value = '';
        senderContainer.classList.add('d-none');
        
        envelopeInput.disabled = true;
        envelopeInput.value = '';
        envelopeContainer.classList.add('d-none');
        
        packageCheckbox.disabled = true;
        packageCheckbox.checked = false;
        packageContainer.classList.add('d-none');
    } else {
        senderInput.disabled = false;
        senderContainer.classList.remove('d-none');
        
        envelopeInput.disabled = false;
        envelopeContainer.classList.remove('d-none');
        
        packageCheckbox.disabled = false;
        packageContainer.classList.remove('d-none');
    }
});

shipmentModal._element.addEventListener('hidden.bs.modal', function () {
    shipmentForm.reset();
    
    senderInput.disabled = false;
    senderContainer.classList.remove('d-none');
    
    envelopeInput.disabled = false;
    envelopeContainer.classList.remove('d-none');
    
    packageCheckbox.disabled = false;
    packageCheckbox.checked = false;
    packageContainer.classList.remove('d-none');
    
    typeSelect.innerHTML = '';
    priceSelect.innerHTML = '';
});