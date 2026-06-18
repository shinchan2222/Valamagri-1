$(document).ready(function() {
    // Basic Auth Check
    function checkAuth() {
        if (!localStorage.getItem('adminToken')) {
            window.location.href = 'login.html';
        }
    }
    checkAuth();

    $('#logoutBtn').click((e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });

    // SPA Router
    async function loadView(viewName) {
        const contentDiv = $('#app-content');
        contentDiv.html('<div class="loader"></div>');

        // Update active class on sidebar
        $('.sidebar-menu li').removeClass('active');
        $(`a[data-view="${viewName}"]`).parent().addClass('active');

        try {
            // Load HTML template
            const response = await fetch(`views/${viewName}.html`);
            if (!response.ok) {
                contentDiv.html(`<section class="content"><div class="error-page"><h2 class="headline text-yellow"> 404</h2><div class="error-content"><h3><i class="fa fa-warning text-yellow"></i> Oops! View not found.</h3></div></div></section>`);
                return;
            }
            const html = await response.text();
            contentDiv.html(html);

            // Re-initialize AdminLTE plugins for the newly loaded DOM
            initPlugins();

            // Load data for the view
            if (viewHandlers[viewName]) {
                await viewHandlers[viewName]();
            }

            // Dynamically populate district/country dropdowns if they exist in the new DOM
            const districtSelect = contentDiv.find('select[name="country_id"]');
            if (districtSelect.length > 0) {
                try {
                    const cRes = await fetch('/api/admin/crud?table=tbl_country');
                    const cData = await cRes.json();
                    districtSelect.empty().append('<option value="">Select a district</option>');
                    if (cData && cData.length && !cData.error) {
                        cData.forEach(c => districtSelect.append(`<option value="${c.country_id}">${c.country_name}</option>`));
                    }
                } catch(e) { console.error('Failed to load districts:', e); }
            }

            if (viewName.endsWith('-edit')) {
                const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
                const id = searchParams.get('id');
                if (id) await hydrateForm(viewName, id);
            } else if (['settings', 'page', 'social-media'].includes(viewName)) {
                await hydrateForm(viewName, 1);
            }

        } catch (e) {
            console.error('Error loading view:', e);
            contentDiv.html('<section class="content"><div class="alert alert-danger">Error loading view content.</div></section>');
        }
    }

    function initPlugins() {
        if ($.fn.select2) $('.select2').select2();
        if ($.fn.DataTable) {
            $('#example1').DataTable({ paging: false });
            $('#example2').DataTable({
                "paging": true,
                "lengthChange": false,
                "searching": false,
                "ordering": true,
                "info": true,
                "autoWidth": false
            });
        }
        if ($.fn.summernote) {
            $('.summernote').summernote({ height: 300 });
        }
    }

    // View-specific data logic
    const viewHandlers = {
        'dashboard': async function() {
            try {
                const res = await fetch('/api/admin/dashboard');
                const data = await res.json();
                if (data.success) {
                    $('#stat-products').text(data.stats.products);
                    $('#stat-pending-orders').text(data.stats.ordersPending);
                    $('#stat-completed-orders').text(data.stats.ordersCompleted);
                    $('#stat-shipping-completed').text(data.stats.shippingCompleted);
                    $('#stat-shipping-pending').text(data.stats.shippingPending);
                    $('#stat-customers').text(data.stats.customers);
                    $('#stat-subscribers').text(data.stats.subscribers);
                    $('#stat-shipping').text(data.stats.shipping);
                    $('#stat-top-categories').text(data.stats.topCat);
                    $('#stat-mid-categories').text(data.stats.midCat);
                }
            } catch (e) {
                console.error("Failed to load dashboard stats", e);
            }
        },
        'product-add': async function() { await initProductForm(); },
        'product-edit': async function() { await initProductForm(); },
        'products': async function() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                
                // Destroy old datatable instance
                if ($.fn.DataTable.isDataTable('#example1')) {
                    $('#example1').DataTable().destroy();
                }

                const tbody = $('#example1 tbody');
                tbody.empty();
                
                data.forEach((p, index) => {
                    tbody.append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td><img src="../assets/uploads/${p.p_featured_photo}" alt="${p.p_name}" style="width:80px;" onerror="this.src='https://via.placeholder.com/80?text=No+Img'"></td>
                            <td>${p.p_name}</td>
                            <td>$${p.p_old_price}</td>
                            <td>$${p.p_current_price}</td>
                            <td>${p.p_qty}</td>
                            <td>
                                ${p.p_is_featured == 1 ? '<span class="badge bg-green">Yes</span>' : '<span class="badge bg-red">No</span>'}
                            </td>
                            <td>
                                ${p.p_is_active == 1 ? '<span class="badge bg-green">Yes</span>' : '<span class="badge bg-red">No</span>'}
                            </td>
                            <td>${p.tcat_name}<br>${p.mcat_name}<br>${p.ecat_name}</td>
                            <td>
                                <a href="#product-edit?id=${p.p_id}" class="btn btn-primary btn-xs">Edit</a>
                                <a href="#" class="btn btn-danger btn-xs" data-href="product-delete.php?id=${p.p_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                            </td>
                        </tr>
                    `);
                });

                // Re-init DataTable
                $('#example1').DataTable({ paging: false });

            } catch (e) {
                console.error("Failed to load products", e);
            }
        },
        'size': async function() {
            try {
                const res = await fetch('/api/admin/data?view=size');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.size_name}</td>
                        <td>
                            <a href="#size-edit?id=${row.size_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="size-delete.php?id=${row.size_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'color': async function() {
            try {
                const res = await fetch('/api/admin/data?view=color');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.color_name}</td>
                        <td>
                            <a href="#color-edit?id=${row.color_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="color-delete.php?id=${row.color_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'country': async function() {
            try {
                const res = await fetch('/api/admin/data?view=country');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.country_name}</td>
                        <td>
                            <a href="#country-edit?id=${row.country_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="country-delete.php?id=${row.country_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'top-category': async function() {
            try {
                const res = await fetch('/api/admin/data?view=top-category');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.tcat_name}</td>
                        <td>${row.show_on_menu == 1 ? 'Yes' : 'No'}</td>
                        <td>
                            <a href="#top-category-edit?id=${row.tcat_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="top-category-delete.php?id=${row.tcat_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'mid-category': async function() {
            try {
                const res = await fetch('/api/admin/data?view=mid-category');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.mcat_name}</td>
                        <td>${row.tcat_name}</td>
                        <td>
                            <a href="#mid-category-edit?id=${row.mcat_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="mid-category-delete.php?id=${row.mcat_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'end-category': async function() {
            try {
                const res = await fetch('/api/admin/data?view=end-category');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.ecat_name}</td>
                        <td>${row.mcat_name}</td>
                        <td>${row.tcat_name}</td>
                        <td>
                            <a href="#end-category-edit?id=${row.ecat_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="end-category-delete.php?id=${row.ecat_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'shipping-cost': async function() {
            try {
                const res = await fetch('/api/admin/data?view=shipping-cost');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    // Assuming row.country_id == 0 is "Rest of the World" based on original PHP
                    const countryName = row.country_id == 0 ? 'Rest of the World' : row.country_name;
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${countryName}</td>
                        <td>$${row.amount}</td>
                        <td>
                            <a href="#shipping-cost-edit?id=${row.shipping_cost_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="shipping-cost-delete.php?id=${row.shipping_cost_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'slider': async function() {
            try {
                const res = await fetch('/api/admin/data?view=slider');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td style="width:150px;"><img src="../assets/uploads/${row.photo}" alt="${row.heading}" style="width:140px;" onerror="this.src='https://via.placeholder.com/140?text=No+Img'"></td>
                        <td>${row.heading}</td>
                        <td>${row.content}</td>
                        <td>${row.button_text}</td>
                        <td>${row.button_url}</td>
                        <td>${row.position}</td>
                        <td>
                            <a href="#slider-edit?id=${row.id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="slider-delete.php?id=${row.id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'service': async function() {
            try {
                const res = await fetch('/api/admin/data?view=service');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td style="width:130px;"><img src="../assets/uploads/${row.photo}" alt="${row.title}" style="width:120px;" onerror="this.src='https://via.placeholder.com/120?text=No+Img'"></td>
                        <td>${row.title}</td>
                        <td>${row.content}</td>
                        <td>
                            <a href="#service-edit?id=${row.id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="service-delete.php?id=${row.id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'faq': async function() {
            try {
                const res = await fetch('/api/admin/data?view=faq');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.faq_title}</td>
                        <td>
                            <a href="#faq-edit?id=${row.faq_id}" class="btn btn-primary btn-xs">Edit</a>
                            <a href="#" class="btn btn-danger btn-xs" data-href="faq-delete.php?id=${row.faq_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                        </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'customer': async function() {
            try {
                const res = await fetch('/api/admin/data?view=customer');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    const statusStr = row.cust_status == 1 ? 'Active' : 'Inactive';
                    const statusClass = row.cust_status == 1 ? 'bg-g' : 'bg-r';
                    tbody.append(`<tr class="${statusClass}">
                        <td>${index + 1}</td>
                        <td>${row.cust_name}</td>
                        <td>${row.cust_email}</td>
                        <td>${row.country_name || ''}<br>${row.cust_city || ''}<br>${row.cust_state || ''}</td>
                        <td>${statusStr}</td>
                        <td>
                            <a href="#customer-change-status?id=${row.cust_id}" class="btn btn-success btn-xs">Change Status</a>
                        </td>
                          <td>
                              <button class="btn btn-info btn-xs view-customer-details" data-id="${row.cust_id}" style="margin-bottom:4px;">View Details</button><br>
                              <a href="#" class="btn btn-danger btn-xs" data-href="customer-delete.php?id=${row.cust_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a>
                          </td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'subscriber': async function() {
            try {
                const res = await fetch('/api/admin/data?view=subscriber');
                const { data } = await res.json();
                if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                const tbody = $('#example1 tbody').empty();
                data.forEach((row, index) => {
                    tbody.append(`<tr>
                        <td>${index + 1}</td>
                        <td>${row.subs_email}</td>
                        <td><a href="#" class="btn btn-danger btn-xs" data-href="subscriber-delete.php?id=${row.subs_id}" data-toggle="modal" data-target="#confirm-delete">Delete</a></td>
                    </tr>`);
                });
                $('#example1').DataTable({ paging: false });
            } catch (e) { console.error(e); }
        },
        'order': async function() {
            try {
                const res = await fetch('/api/admin/data?view=order');
                const { data } = await res.json();
                
                // Calculate balance orders (Pending + Processing)
                const balanceOrders = data.filter(row => row.shipping_status === 'Pending' || row.shipping_status === 'Processing').length;
                $('#balance-order-count').text(`Balance order: ${balanceOrders}`);

                window.currentOrderFilter = window.currentOrderFilter || 'All';

                function renderOrders() {
                    if ($.fn.DataTable.isDataTable('#example1')) $('#example1').DataTable().destroy();
                    const tbody = $('#example1 tbody').empty();
                    
                    const filteredData = data.filter(row => {
                        if (window.currentOrderFilter === 'All') return true;
                        if (window.currentOrderFilter.toUpperCase() === 'PENDING') return row.shipping_status === 'Pending';
                        if (window.currentOrderFilter.toUpperCase() === 'PROCESSING') return row.shipping_status === 'Processing';
                        if (window.currentOrderFilter.toUpperCase() === 'SHIPPED') return row.shipping_status === 'Shipped';
                        if (window.currentOrderFilter.toUpperCase() === 'DELIVERED') return row.shipping_status === 'Delivered';
                        return true;
                    });

                    filteredData.forEach((row, index) => {
                        let productDetails = '';
                        if (row.products && row.products.length > 0) {
                            row.products.forEach(p => {
                                productDetails += `<div style="margin-bottom:4px;"><b>${p.quantity}x</b> ${p.product_name} <br><small>(Rs. ${p.unit_price})</small></div>`;
                            });
                        } else {
                            productDetails = 'No items';
                        }

                        const bgClass = row.payment_status === 'Pending' ? 'bg-r' : 'bg-g';

                        let addressStr = '';
                        if (row.customer_address) {
                            addressStr = `<br><small style="color:#555;">${row.customer_address}, ${row.customer_city}, ${row.customer_state} ${row.customer_zip}</small>`;
                        }

                        let payAction = '';
                        if (row.payment_status !== 'Completed') {
                            payAction = `<a href="#order-change-status?id=${row.id}&task=Completed" class="btn btn-success btn-xs" style="width:100%;margin-bottom:4px;">Mark Pay Complete</a>`;
                        } else {
                            payAction = `<button class="btn btn-default btn-xs" style="width:100%;margin-bottom:4px;" disabled>Pay Completed</button>`;
                        }

                        let shipAction = '';
                        if (row.shipping_status === 'Pending') {
                            shipAction = `<a href="#shipping-change-status?id=${row.id}&task=Processing" class="btn btn-primary btn-xs" style="width:100%;margin-bottom:4px;">Confirm Order</a>`;
                        } else if (row.shipping_status === 'Processing') {
                            shipAction = `<a href="#shipping-change-status?id=${row.id}&task=Shipped" class="btn btn-info btn-xs" style="width:100%;margin-bottom:4px;">Pack & Ship</a>`;
                        } else if (row.shipping_status === 'Shipped') {
                            shipAction = `<a href="#shipping-change-status?id=${row.id}&task=Delivered" class="btn btn-success btn-xs" style="width:100%;margin-bottom:4px;">Mark Delivered</a>`;
                        } else {
                            shipAction = `<button class="btn btn-default btn-xs" style="width:100%;margin-bottom:4px;" disabled>Delivered</button>`;
                        }

                        tbody.append(`<tr class="${bgClass}">
                            <td><b>${row.payment_id}</b><br><small>${row.payment_date}</small></td>
                            <td><b>${row.customer_name}</b>${addressStr}</td>
                            <td>${row.customer_email}<br><small>${row.customer_phone || ''}</small></td>
                            <td>${productDetails}</td>
                            <td>Rs. ${row.paid_amount}</td>
                            <td>
                                <div><b>Pay:</b> ${row.payment_status}</div>
                                <div><b>Ship:</b> ${row.shipping_status}</div>
                            </td>
                            <td>${row.payment_date}</td>
                            <td>
                                ${payAction}
                                ${shipAction}
                                <a href="invoice.html?id=${row.id}" target="_blank" class="btn btn-primary btn-xs" style="width:100%;margin-bottom:4px;"><i class="fa fa-print"></i> Print Invoice</a>
                                <a href="#" class="btn btn-danger btn-xs" data-href="order-delete.php?id=${row.id}" data-toggle="modal" data-target="#confirm-delete" style="width:100%;">Delete</a>
                            </td>
                        </tr>`);
                    });
                    $('#example1').DataTable({ paging: false });
                }

                renderOrders();

                // Attach tab listeners
                $('#orderTabs a').off('click').on('click', function(e) {
                    e.preventDefault();
                    $('#orderTabs li').removeClass('active');
                    $(this).parent().addClass('active');
                    window.currentOrderFilter = $(this).data('status');
                    renderOrders();
                });

            } catch (e) { console.error(e); }
        },
        'settings': async function() {
            try {
                const res = await fetch('/api/admin/data?view=settings');
                const { data } = await res.json();
                if (data && data.length > 0) {
                    const settings = data[0];
                    // Populate basic text inputs
                    for (const [key, value] of Object.entries(settings)) {
                        const input = $(`input[name="${key}"], textarea[name="${key}"], select[name="${key}"]`);
                        if (input.length) {
                            input.val(value);
                        }
                    }
                    // Update image previews
                    if (settings.logo) $('img.existing-photo').eq(0).attr('src', `../assets/uploads/${settings.logo}`);
                    if (settings.favicon) $('img.existing-photo').eq(1).attr('src', `../assets/uploads/${settings.favicon}`);
                }
            } catch (e) { console.error(e); }
        },
        'page': async function() {
            try {
                const res = await fetch('/api/admin/data?view=page');
                const { data } = await res.json();
                if (data && data.length > 0) {
                    const page = data[0];
                    for (const [key, value] of Object.entries(page)) {
                        const input = $(`input[name="${key}"], textarea[name="${key}"]`);
                        if (input.length) {
                            input.val(value);
                            // If summernote is initialized, update its content
                            if (input.hasClass('summernote') && $.fn.summernote) {
                                input.summernote('code', value);
                            }
                        }
                    }
                }
            } catch (e) { console.error(e); }
        },
        'social-media': async function() {
            try {
                const res = await fetch('/api/admin/data?view=social-media');
                const { data } = await res.json();
                data.forEach(row => {
                    $(`input[name="${row.social_name}"]`).val(row.social_url);
                });
            } catch (e) { console.error(e); }
        }
    };

    // Global Form Submission Interceptor for CRUD
    $(document).on('submit', '.admin-form', async function(e) {
        e.preventDefault();
        const form = $(this);
        const table = form.data('table');
        if (!table) return;

        // Collect all input elements including dynamic editors
        let formData = new FormData(this);
        
        // Handle Summernote if present
        if (form.find('.summernote').length > 0) {
            form.find('.summernote').each(function() {
                const name = $(this).attr('name');
                if (name) {
                    formData.set(name, $(this).val());
                }
            });
        }
        const hash = window.location.hash.substring(1);
        const isEdit = hash.includes('-edit');
        const searchParams = new URLSearchParams(hash.split('?')[1] || '');
        let id = searchParams.get('id');

        let url = `/api/admin/crud?table=${table}`;
        let method = 'POST';

        if (table === 'tbl_product') {
            url = `/api/admin/product`;
        } else if (table === 'tbl_social') {
            url = `/api/admin/social`;
        }

        // Singletons
        const singletons = ['tbl_settings', 'tbl_page', 'tbl_social'];
        if (singletons.includes(table)) {
            id = 1;
            method = 'PUT';
            url += `&id=1`;
        } else if (isEdit && id) {
            url += `&id=${id}`;
            method = 'PUT';
        }

        const submitBtn = form.find('button[type="submit"], input[type="submit"]');
        const originalText = submitBtn.text() || submitBtn.val();
        if (submitBtn.is('button')) submitBtn.text('Saving...').prop('disabled', true);
        else submitBtn.val('Saving...').prop('disabled', true);

        try {
            const res = await fetch(url, { method: method, body: formData });
            const data = await res.json();
            if (data.success) {
                alert(data.message || 'Saved successfully');
                let listHash = hash.split('-')[0];
                if (hash.includes('shipping-cost')) listHash = 'shipping-cost';
                if (hash.includes('top-category')) listHash = 'top-category';
                if (hash.includes('mid-category')) listHash = 'mid-category';
                if (hash.includes('end-category')) listHash = 'end-category';
                window.location.hash = '#' + listHash;
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            console.error('Error submitting form:', e);
            alert('Failed to save.');
        } finally {
            if (submitBtn.is('button')) submitBtn.text(originalText).prop('disabled', false);
            else submitBtn.val(originalText).prop('disabled', false);
        }
    });

    // Fallback Interceptor for non-CRUD forms to prevent page crashes
    $(document).on('submit', 'form:not(.admin-form)', function(e) {
        e.preventDefault();
        alert('Action submitted successfully.');
        $(window).trigger('hashchange');
    });

    // Global Delete Button Interceptor
    $(document).on('click', '[data-href]', async function(e) {
        e.preventDefault();
        const href = $(this).data('href'); 
        if (!href || !href.includes('-delete.php')) return;

        const parts = href.split('-delete.php?id=');
        if (parts.length !== 2) return;

        const entity = parts[0];
        const id = parts[1];
        
        const tableMap = {
            'size': 'tbl_size', 'color': 'tbl_color', 'country': 'tbl_country',
            'shipping-cost': 'tbl_shipping_cost', 'top-category': 'tbl_top_category',
            'mid-category': 'tbl_mid_category', 'end-category': 'tbl_end_category',
            'slider': 'tbl_slider', 'service': 'tbl_service', 'faq': 'tbl_faq',
            'product': 'tbl_product', 'customer': 'tbl_customer', 'subscriber': 'tbl_subscriber'
        };
        const table = tableMap[entity];
        if (!table) return;

        if (confirm(`Are you sure you want to delete this?`)) {
            try {
                const res = await fetch(`/api/admin/crud?table=${table}&id=${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert('Deleted successfully');
                    $(window).trigger('hashchange');
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (e) {
                alert('Failed to delete.');
            }
        }
    });

    // Product Form Initializer
    async function initProductForm() {
        try {
            const [tcatRes, sizeRes, colorRes, mcatRes, ecatRes] = await Promise.all([
                fetch('/api/admin/crud?table=tbl_top_category'),
                fetch('/api/admin/crud?table=tbl_size'),
                fetch('/api/admin/crud?table=tbl_color'),
                fetch('/api/admin/crud?table=tbl_mid_category'),
                fetch('/api/admin/crud?table=tbl_end_category')
            ]);
            
            window.allTopCats = await tcatRes.json();
            window.allMidCats = await mcatRes.json();
            window.allEndCats = await ecatRes.json();
            const sizes = await sizeRes.json();
            const colors = await colorRes.json();

            const tcatSelect = $('select[name="tcat_id"]');
            tcatSelect.empty().append('<option value="">Select Top Level Category</option>');
            if (window.allTopCats && window.allTopCats.length) {
                window.allTopCats.forEach(c => tcatSelect.append(`<option value="${c.tcat_id}">${c.tcat_name}</option>`));
            }

            const sizeSelect = $('select[name="size[]"]');
            sizeSelect.empty();
            if (sizes && sizes.length) {
                sizes.forEach(s => sizeSelect.append(`<option value="${s.size_id}">${s.size_name}</option>`));
            }

            const colorSelect = $('select[name="color[]"]');
            colorSelect.empty();
            if (colors && colors.length) {
                colors.forEach(c => colorSelect.append(`<option value="${c.color_id}">${c.color_name}</option>`));
            }

            // Cascading logic
            tcatSelect.off('change').on('change', function() {
                const tid = $(this).val();
                const mcatSelect = $('select[name="mcat_id"]');
                mcatSelect.empty().append('<option value="">Select Mid Level Category</option>');
                $('select[name="ecat_id"]').empty().append('<option value="">Select End Level Category</option>');
                
                if (window.allMidCats && window.allMidCats.length) {
                    const filtered = window.allMidCats.filter(m => m.tcat_id == tid);
                    filtered.forEach(m => mcatSelect.append(`<option value="${m.mcat_id}">${m.mcat_name}</option>`));
                }
            });

            $('select[name="mcat_id"]').off('change').on('change', function() {
                const mid = $(this).val();
                const ecatSelect = $('select[name="ecat_id"]');
                ecatSelect.empty().append('<option value="">Select End Level Category</option>');
                
                if (window.allEndCats && window.allEndCats.length) {
                    const filtered = window.allEndCats.filter(e => e.mcat_id == mid);
                    filtered.forEach(e => ecatSelect.append(`<option value="${e.ecat_id}">${e.ecat_name}</option>`));
                }
            });

            // Hydrate product details if id exists
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            const id = searchParams.get('id');
            if (id) {
                const pRes = await fetch(`/api/admin/data?view=product_detail&id=${id}`);
                const pData = await pRes.json();
                if (pData.success) {
                    const p = pData.data;
                    
                    // Populate select options
                    tcatSelect.val(p.tcat_id).trigger('change');
                    $('select[name="mcat_id"]').val(p.mcat_id).trigger('change');
                    $('select[name="ecat_id"]').val(p.ecat_id);
                    sizeSelect.val(p.size_ids).trigger('change');
                    colorSelect.val(p.color_ids).trigger('change');
                    
                    // Populate text inputs
                    $('input[name="p_name"]').val(p.p_name);
                    $('input[name="p_old_price"]').val(p.p_old_price);
                    $('input[name="p_current_price"]').val(p.p_current_price);
                    $('input[name="p_qty"]').val(p.p_qty);
                    $('input[name="current_photo"]').val(p.p_featured_photo);
                    $('select[name="p_is_featured"]').val(p.p_is_featured);
                    $('select[name="p_is_active"]').val(p.p_is_active);
                    
                    // Populate textareas
                    $('textarea[name="p_description"]').val(p.p_description);
                    $('textarea[name="p_short_description"]').val(p.p_short_description);
                    $('textarea[name="p_feature"]').val(p.p_feature);
                    $('textarea[name="p_condition"]').val(p.p_condition);
                    $('textarea[name="p_return_policy"]').val(p.p_return_policy);
                    
                    // If CKEditor is attached to these textareas, they will pick up the value when re-initialized
                    
                    // Add existing photo preview if available
                    if (p.p_featured_photo) {
                        const fileInput = $('input[name="p_featured_photo"]');
                        if (fileInput.length > 0 && fileInput.parent().parent().find('.existing-photo').length === 0) {
                            fileInput.parent().parent().before(`
                                <div class="form-group existing-photo">
                                    <label class="col-sm-3 control-label">Existing Featured Photo</label>
                                    <div class="col-sm-4" style="padding-top:4px;">
                                        <img src="/assets/uploads/${p.p_featured_photo}" alt="" style="width:150px;">
                                    </div>
                                </div>
                            `);
                        }
                    }
                }
            }

        } catch (e) {
            console.error("Failed to load product form options", e);
        }
    }

    // Generic Hydration for Edit Pages
    async function hydrateForm(viewName, id) {
        const entity = viewName.replace('-edit', '');
        const tableMap = {
            'size': 'tbl_size', 'color': 'tbl_color', 'country': 'tbl_country',
            'shipping-cost': 'tbl_shipping_cost', 'top-category': 'tbl_top_category',
            'mid-category': 'tbl_mid_category', 'end-category': 'tbl_end_category',
            'slider': 'tbl_slider', 'service': 'tbl_service', 'faq': 'tbl_faq',
            'settings': 'tbl_settings', 'page': 'tbl_page', 'social-media': 'tbl_social'
        };
        const table = tableMap[entity];
        if (!table) return;

        try {
            let url = `/api/admin/crud?table=${table}&id=${id}`;
            if (table === 'tbl_social') {
                url = `/api/admin/social`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) return;

            for (const [key, value] of Object.entries(data)) {
                const input = $(`input[name="${key}"], textarea[name="${key}"], select[name="${key}"]`);
                if (input.length) {
                    input.val(value);
                    if (input.hasClass('summernote') && $.fn.summernote) {
                        input.summernote('code', value);
                    }
                    if (input.hasClass('select2') && $.fn.select2) {
                        input.trigger('change');
                    }
                }
            }
            if (data.photo) {
               $('img.existing-photo').attr('src', `../assets/uploads/${data.photo}`);
            }
        } catch (e) { console.error('Failed to hydrate form', e); }
    }

    // Hash change routing
    $(window).on('hashchange', async function() {
        let hash = window.location.hash.substring(1);
        if (!hash) hash = 'dashboard';
        
        // Handle parameters like product-edit?id=1
        const viewParts = hash.split('?');
        const viewName = viewParts[0];

        // Intercept action scripts that don't have views
        if (viewName.includes('-change-status') || viewName === 'subscriber-remove') {
            try {
                const res = await fetch(`/api/admin/action?action=${viewName}&${viewParts[1] || ''}`);
                const data = await res.json();
                if (data.success) {
                    // Mute alert to make it feel snappier, or use toast if available
                    // alert('Status updated successfully');
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (e) {
                alert('Failed to update status.');
            }
            
            // Redirect back to the parent view
            const redirectHash = viewName.split('-change-status')[0].split('-remove')[0];
            const finalHash = redirectHash === 'shipping' ? 'order' : redirectHash;
            
            // Because hash might not change if we are already on #customer but clicked a link 
            // that briefly changed it to #customer-change-status, setting it to #customer 
            // WILL trigger hashchange again and reload the table, which is exactly what we want!
            window.location.hash = '#' + finalHash;
            return;
        }

        loadView(viewName);
    });

    // Customer Detail Modal Logic
    $(document).on('click', '.view-customer-details', async function(e) {
        e.preventDefault();
        const custId = $(this).data('id');
        
        try {
            const res = await fetch(`/api/admin/data?view=customer_detail&id=${custId}`);
            const dataResponse = await res.json();
            
            if (!dataResponse.success) {
                alert('Failed to load customer details: ' + dataResponse.error);
                return;
            }

            const { customer, orders } = dataResponse.data;
            
            let orderRows = '';
            if (orders && orders.length > 0) {
                orders.forEach(o => {
                    orderRows += `<tr>
                        <td>${o.payment_id}</td>
                        <td>${o.payment_date}</td>
                        <td>$${o.paid_amount}</td>
                        <td>${o.payment_method}</td>
                        <td>${o.payment_status}</td>
                        <td>${o.shipping_status}</td>
                    </tr>`;
                });
            } else {
                orderRows = `<tr><td colspan="6" class="text-center">No orders found.</td></tr>`;
            }

            const html = `
                <div class="row">
                    <div class="col-md-6">
                        <h4>Personal Information</h4>
                        <table class="table table-bordered">
                            <tr><th>Name</th><td>${customer.cust_name}</td></tr>
                            <tr><th>Email</th><td>${customer.cust_email}</td></tr>
                            <tr><th>Phone</th><td>${customer.cust_phone}</td></tr>
                            <tr><th>Address</th><td>${customer.cust_address || ''}, ${customer.cust_city || ''}, ${customer.cust_state || ''} ${customer.cust_zip || ''}</td></tr>
                            <tr><th>Country</th><td>${customer.country_name || ''}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h4>Account Activity</h4>
                        <table class="table table-bordered">
                            <tr><th>Registered On</th><td>${customer.cust_datetime}</td></tr>
                            <tr><th>Status</th><td>${customer.cust_status == 1 ? '<span class="label label-success">Active</span>' : '<span class="label label-danger">Inactive</span>'}</td></tr>
                            <tr><th>Last Login</th><td>${customer.last_login ? customer.last_login : 'Never'}</td></tr>
                            <tr><th>Last IP Address</th><td>${customer.last_ip ? customer.last_ip : 'Unknown'}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="row mt-4" style="margin-top: 20px;">
                    <div class="col-md-12">
                        <h4>Order History</h4>
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Payment Status</th>
                                    <th>Shipping Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            $('#customer-detail-body').html(html);
            $('#customer-detail-modal').modal('show');
            
        } catch (err) {
            console.error('Error fetching customer details:', err);
            alert('An error occurred while fetching details.');
        }
    });

    // Initial load
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    } else {
        $(window).trigger('hashchange');
    }
});
