document.addEventListener('DOMContentLoaded', function () {
    initializeTable();
});

function initializeTable() {
    $('#shipmentsTable').DataTable( {
        ajax: {
            url: '/api/v1/shipments/',
            type: 'GET',
            dataSrc: function(json) {
                console.log('Datos en bruto:', json);
                return json;
            }
        },
        columnDefs: [
            { targets: '_all', className: 'text-center align-middle' },
            { targets: 0, orderable: false }
        ],
        columns: [
            {
                className: 'dt-control text-center align-middle',
                orderable: false,
                data: null,
                defaultContent: '<i class="ti ti-menu-2 fs-4"></i>'
            },
            { data: 'tracking_number' },
            { data: 'sender' },
            { data: 'recipient' }
        ],
        destroy: true,
        info: false,
        language: { url: '/static/json/es-ES.json' },
        order: [1],
        paging: false,
        processing: true,
        responsive: true,
        scrollCollapse: true,
        scrollY: '67vh'
    });
};