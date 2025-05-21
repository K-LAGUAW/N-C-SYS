const printerSelect = document.getElementById('printerSelect');
const confirmPrinter = document.getElementById('confirmPrinter');

const sendForm = document.getElementById('sendForm');

const shipmentForm = document.getElementById('shipmentForm');
const packageSelect = document.getElementById('packageSelect');
const shippingSelect = document.getElementById('shipmentSelect');
const packageCheck = document.getElementById('packagePickupCheck');

const scannerModal = new bootstrap.Modal('#scannerModal');
const printerModal = new bootstrap.Modal('#printerModal');
const addModal = new bootstrap.Modal('#addModal');

const parzibyteSerial = "YTAwODkxYjhfXzIwMjUtMDUtMTVfXzIwMjUtMDYtMTQjIyNZWkJRNTVZdko3bGJncWVJRXpUNCtxa0VTc1Y0Y1lhbXdhZVJscUI2OVNqME5tOVBNaVppcFdHRjVVVVNKTmQ2OXVoMTZzbHIxY05GMzBDRFVTUnRabC9BRUxqMTdOclNhSngxVjI1bzh2akE3bWRrc3FKdlhTRXB6blZ1NW1xVmN2WWJGZDRFSU1ZSXc1djQ0MU9OU3ROYURtbnMxQXdtRitKN29LOVEvdkQ0aTcrTGZUNTR6d3NlMWlhSk1iMXBUSFpPQ3lsZE9YU0dQME0yV1M1VmdpejJCRGNFemY0dldBOG5sZzlFaWtDVnd0RkMwUThCUVYrTjJtWlVGUUgyampFS1JUTkUvSG16NTgxTWxLK200NXVEWXdKa09RZjVZM0FuMC9TUFN2WGx6ZXl5WjBDSFpIUHp1T2M4WE50ZmlFOHpzcTg2Q0NpUE9Nam9QQjdYeUY0OUwzMWhNQi9xbHFGM0dUT0F5ZGpoa1VIWEozMjAyNkxDQ2djTFNyT0o4ZitPRjRsTlJjSTl1ZFBrNU44emNTcXJFVGVGYzdiQ0ZtRlMxSVRXb25FcUJXKzVHaTJuMWIxWUlVZVBwYkpEbkJmMVR3OXhTMTg4RU81a0JyL1dyYVB1Z1VKelUzYjZFdUpwTW11Z01XU053WmdMM2IwVVR6SXVnQmJ2NnBSaGdlamZWYmEybmozMEVMSVJZN3c1aXB6bjdaN3ZvUXc3VlJLcXVqcmMwV2VrMVV2emRjMjVZdXZhaU0zeU9lUXJ0U3JFWS9ic3hOd1hkcjhKYkdkdStZZHZSSVdQSm5wUzlKcEtBWUNubkhZWnNRc3FTTnFRN2VYWlRXaDljYWt2ai9oOU83SVV1YVkwZmJmQ1NCSXlxSkdwaGdHWHpHbSs5aWZNb21TNnczMD0=";
let tableShipmentsInitialized = false;
let dataTable;

const Toast = (time = 3000) => Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: time,
    timerProgressBar: true
});

const dataTableOptions = {
    scrollCollapse: true,
    responsive: true,
    scrollY: '67vh',
    destroy: true,
    paging: false,
    info: false,
    language: { url: '/static/json/es-ES.json' },
    order: [1],
    columnDefs: [{ targets: '_all', className: 'text-center align-middle' }, { targets: 0, orderable: false }],
};

const html5QrcodeScanner = new Html5QrcodeScanner(
    "readerElement",
    { fps: 10, qrbox: { width: 250, height: 250 } }, false
);

function showDetails(data) {
    return (
        `<div class="d-flex flex-column flex-md-row justify-content-around align-items-center gap-2">
            <div class="d-flex flex-column text-center">
                <p class="mb-1"><strong>Fecha de envío:</strong> ${data.creation_date}</p>
                <p class="mb-1"><strong>Estado:</strong> ${data.status.name}</p>
                <p class="mb-1"><strong>Ultima actualización</strong> ${data.update_date}</p>
            </div>
            <div class="d-flex flex-column text-center">        
            </div>
            <div class="d-flex justify-content-center align-items-center gap-2">
                <button type="button" class="btn btn-success fw-semibold shadow-sm ${data.status.id === 3 ? '' : 'd-none'}">Confirmar entrega</button>
                <button type="button" class="btn btn-warning fw-semibold shadow-sm ${data.status.id > 3 ? 'd-none' : ''}">Reimprimir ticket</button>
            </div>
        </div>`
    );
}

window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/v1/list');
        const data = await response.json();

        if (window.dataTable) {
            window.dataTable.destroy();
        }

        window.dataTable = $('#shipmentsTable').DataTable({
            ...dataTableOptions,
            data: data,
            columns: [
                {
                    className: 'dt-control text-center align-middle',
                    orderable: false,
                    data: null,
                },
                { data: 'tracking_number' },
                { data: 'sender' },
                { data: 'recipient' }
            ]
        });

        window.dataTable.on('click', 'td.dt-control', function (e) {
            let tr = e.target.closest('tr');
            let row = window.dataTable.row(tr);

            if (row.child.isShown()) {
                row.child.hide();
            }
            else {
                row.child(showDetails(row.data())).show();
            }
        });

    } catch (error) {
        console.error('Error al cargar envíos:', error);
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function initializeScanner() {
    scannerModal.show();

    html5QrcodeScanner.render(
        (decodedText, decodedResult) => {
            html5QrcodeScanner.clear();
            scannerModal.hide();

            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: "success",
                title: `Escaneo exitoso: ${decodedText}`
            })
        },
        (error) => {
            console.warn(`Code scan error = ${error}`);
        }
    );
}

async function printQR(sender, recipient, tracking_number, qr_code) {
    const payload = {
        "serial": parzibyteSerial,
        "nombreImpresora": getCookie('printer'),
        "operaciones": [
            {
                "nombre": "Iniciar",
                "argumentos": []
            },
            {
                "nombre": "EstablecerAlineacion",
                "argumentos": [
                    1
                ]
            },
            {
                "nombre": "DescargarImagenDeInternetEImprimir",
                "argumentos": [
                    "https://i.postimg.cc/c41Jcf6L/nyc-logo.png",
                    300,
                    0,
                    false
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n\n"
                ]
            },
            {
                "nombre": "EstablecerTamañoFuente",
                "argumentos": [
                    3,
                    3
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    tracking_number + "\n"
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n\n"
                ]
            },
            {
                "nombre": "DescargarImagenDeInternetEImprimir",
                "argumentos": [
                    "http://localhost:5000/media/qrcodes/PAQ-D1898E33.png",
                    300,
                    0,
                    false
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n\n"
                ]
            },
            {
                "nombre": "EstablecerTamañoFuente",
                "argumentos": [
                    2,
                    2
                ]
            },
            {
                "nombre": "EstablecerSubrayado",
                "argumentos": [
                    true
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "REMITENTE:\n"
                ]
            },
            {
                "nombre": "EstablecerSubrayado",
                "argumentos": [
                    false
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n"
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    sender + "\n"
                ]
            },
            {
                "nombre": "EstablecerSubrayado",
                "argumentos": [
                    true
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n"
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "DESTINATARIO:\n"
                ]
            },
            {
                "nombre": "EstablecerSubrayado",
                "argumentos": [
                    false
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n"
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                     "\n"
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "\n"
                ]
            },
            {
                "nombre": "Feed",
                "argumentos": [
                    8
                ]
            },
            {
                "nombre": "CorteParcial",
                "argumentos": []
            },
            {
                "nombre": "Iniciar",
                "argumentos": []
            }
        ]
    };

    const response = await fetch("http://localhost:2811/imprimir", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.ok) {
        console.log("Impreso correctamente")
    } else {
        console.error("Petición ok pero error en el plugin: " + data.message);
    }
}

async function addShipment() {
    packageSelect.innerHTML = '';
    shippingSelect.innerHTML = '';

    addModal.show();

    try {
        const response = await fetch('/api/v1/categories');
        const data = await response.json();

        data.package_categories.forEach(category => {
            packageSelect.innerHTML += `
                <option value="${category.id}">${category.name} - $${category.mount}</option>
            `;
        });

        data.shipping_categories.forEach(category => {
            shippingSelect.innerHTML += `
                <option value="${category.id}">${category.name}</option>
            `;
        });

        packageSelect.disabled = false;
        shippingSelect.disabled = false;
    }
    catch (error) {
        console.error('Error al agregar envío:', error);
    }
}

sendForm.addEventListener('click', async () => {
    const csrftoken = getCookie('csrftoken');

    const formData = new FormData(shipmentForm);
    formData.append('package_amount', packageSelect.value);
    formData.append('shipping_category', shippingSelect.value);
    formData.append('package_pickups', packageCheck.checked);

    sendForm.disabled = true;

    try {
        const response = await fetch('/api/v1/create/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        const data = await response.json();

        console.log(data);

        if (response.status === 201) {
            printQR(data.recipient, data.sender, data.tracking_number, data.qr_code);
            Toast(1500).fire({
                icon: "success",
                title: "Envío creado correctamente"
            }).then(() => {
                shipmentForm.reset();
                addModal.hide();
                
            });
        } else {
            Toast.fire({
                icon: "error",
                title: "Error al crear el envío"
            });
        }
    } catch (error) {
        Toast.fire({
            icon: "error",
            title: "Error al procesar la solicitud"
        });
    }
});

async function configPrinter() {
    printerSelect.innerHTML = '';
    printerModal.show();

    try {
        const response = await fetch("http://localhost:2811/impresoras");
        const data = await response.json();

        data.forEach(impresora => {
            printerSelect.innerHTML += `
                <option value="${impresora}">${impresora}</option>
            `;
        });

        printerSelect.disabled = false;
        confirmPrinter.disabled = false;
    } catch (error) {
        printerSelect.innerHTML = `
            <option value="error selected>Algo no funciono 😭</option>
        `;
        printerSelect.classList.add('is-invalid');

        Toast.fire({
            icon: "error",
            title: "No se pudo conectar al servicio de impresión"
        });
    }
}

confirmPrinter.addEventListener('click', async () => {
    const printerValue = printerSelect.value;

    if (printerValue === 'error') {
        Toast.fire({
            icon: "error",
            title: "Seleccione una impresora válida."
        });
        return;
    }

    const payload = {
        "serial": parzibyteSerial,
        "nombreImpresora": printerValue,
        "operaciones": [
            {
                "nombre": "Feed",
                "argumentos": [
                    1
                ]
            },
            {
                "nombre": "EstablecerAlineacion",
                "argumentos": [
                    1
                ]
            },
            {
                "nombre": "DescargarImagenDeInternetEImprimir",
                "argumentos": [
                    "https://i.postimg.cc/9QpFZRNC/nyc-logo.png",
                    300,
                    0,
                    false
                ]
            },
            {
                "nombre": "EstablecerTamañoFuente",
                "argumentos": [
                    2,
                    2
                ]
            },
            {
                "nombre": "Feed",
                "argumentos": [
                    2
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    "Impresora configurada\n"
                ]
            },
            {
                "nombre": "Feed",
                "argumentos": [
                    1
                ]
            },
            {
                "nombre": "EscribirTexto",
                "argumentos": [
                    `[${printerValue}]\n`
                ]
            },
            {
                "nombre": "Feed",
                "argumentos": [
                    2
                ]
            }
        ]
    };

    document.cookie = `printer=${printerValue}; max-age=${10 * 365 * 24 * 60 * 60}; path=/`;

    confirmPrinter.disabled = true;

    const response = await fetch("http://localhost:2811/imprimir", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.ok) {
        Toast.fire({
            icon: "success",
            title: `Impresora ${printerValue} configurada correctamente`
        });

        printerModal.hide();
    } else {
        Toast.fire({
            icon: "error",
            title: `Error al intentar imprimir: ${data.message.toUpperCase()}`
        });
    }
});