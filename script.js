// Variables
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = null;
let sortOrder = 'asc';
let categories = [];

// Fetch categories
async function fetchCategories() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/categories');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        categories = await response.json();
        populateCategorySelects();
    } catch (error) {
        console.error('Error fetching categories:', error);
        categories = [{ id: 1, name: 'Sample Category' }];
        populateCategorySelects();
    }
}

// Populate category selects
function populateCategorySelects() {
    const createSelect = document.getElementById('createCategoryId');
    const editSelect = document.getElementById('editCategoryId');
    createSelect.innerHTML = '<option value="">Select Category</option>';
    editSelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        const option1 = document.createElement('option');
        option1.value = cat.id;
        option1.textContent = cat.name;
        createSelect.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = cat.id;
        option2.textContent = cat.name;
        editSelect.appendChild(option2);
    });
}

// Fetch products
async function fetchProducts() {
    try {
        console.log('Fetching products...');
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        allProducts = await response.json();
        console.log('Fetched', allProducts.length, 'products');
        if (allProducts.length === 0) {
            throw new Error('No products');
        }
        filteredProducts = [...allProducts];
        renderTable();
        renderPagination();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback sample data
        allProducts = [{
            id: 1,
            title: 'Sample',
            price: 100,
            description: 'Sample desc',
            category: { name: 'Sample' },
            images: ['https://via.placeholder.com/50']
        }];
        filteredProducts = [...allProducts];
        renderTable();
        renderPagination();
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const products = filteredProducts.slice(start, end);
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.price}</td>
            <td>${product.category?.name || 'N/A'}</td>
            <td><img src="${product.images?.[0] || 'https://via.placeholder.com/50'}" width="50"></td>
        `;
        row.title = product.description; // Tooltip
        row.onclick = () => showDetail(product);
        tbody.appendChild(row);
    });
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Prev
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Prev</a>`;
    pagination.appendChild(prevLi);

    // Pages
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }

    // Next
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

// Change page
function changePage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

// Sort
function sortBy(column) {
    if (sortColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortOrder = 'asc';
    }
    filteredProducts.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        if (column === 'price') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }
        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    renderTable();
}

// Export CSV
function exportToCSV() {
    const csv = 'ID,Title,Price,Category,Description\n' +
        filteredProducts.map(p => `${p.id},"${p.title}",${p.price},"${p.category?.name}","${p.description}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
}

// Show detail modal
function showDetail(product) {
    document.getElementById('detailModalLabel').textContent = product.title;
    document.getElementById('detailModalBody').innerHTML = `
        <p>ID: ${product.id}</p>
        <p>Title: ${product.title}</p>
        <p>Price: ${product.price}</p>
        <p>Category: ${product.category?.name}</p>
        <p>Description: ${product.description}</p>
        <p>Images: ${product.images?.map(img => `<img src="${img}" width="100">`).join('')}</p>
    `;
    document.getElementById('detailModalBody').dataset.productId = product.id;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}

// Edit product
function editProduct() {
    const productId = document.getElementById('detailModalBody').dataset.productId;
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    document.getElementById('editTitle').value = product.title || '';
    document.getElementById('editPrice').value = product.price || '';
    document.getElementById('editDescription').value = product.description || '';
    document.getElementById('editCategoryId').value = product.category?.id || '';
    document.getElementById('editImages').value = product.images?.join(', ') || '';
    bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    new bootstrap.Modal(document.getElementById('editModal')).show();
}

// Init
function init() {
    try {
        console.log('Init start');
        // Check elements
        const elements = ['searchInput', 'itemsPerPage', 'productTableBody', 'pagination', 'createForm', 'editForm'];
        for (const id of elements) {
            if (!document.getElementById(id)) {
                throw new Error('Element not found: ' + id);
            }
        }
        console.log('Elements ok');

        // Event listeners
        document.getElementById('searchInput').addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(query));
            currentPage = 1;
            renderTable();
            renderPagination();
        });

        document.getElementById('itemsPerPage').addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderTable();
            renderPagination();
        });

        document.getElementById('createForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('createTitle').value.trim();
            const price = parseFloat(document.getElementById('createPrice').value);
            const description = document.getElementById('createDescription').value.trim();
            const categoryId = parseInt(document.getElementById('createCategoryId').value);
            const imagesStr = document.getElementById('createImages').value.trim();
            if (!title || isNaN(price) || !description || isNaN(categoryId) || !imagesStr) {
                alert('Please fill all fields');
                return;
            }
            const images = imagesStr.split(',').map(img => img.trim()).filter(img => img);
            if (images.length === 0) {
                alert('At least one image URL required');
                return;
            }
            const data = { title, price, description, categoryId, images };
            try {
                const response = await fetch('https://api.escuelajs.co/api/v1/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    alert('Created successfully');
                    fetchProducts();
                    bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();
                    this.reset();
                } else {
                    const errorText = await response.text();
                    alert('Error: ' + response.status + ' ' + response.statusText + '\n' + errorText);
                }
            } catch (error) {
                alert('Network error: ' + error);
            }
        });

        document.getElementById('editForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('editTitle').value.trim();
            const price = parseFloat(document.getElementById('editPrice').value);
            const description = document.getElementById('editDescription').value.trim();
            const categoryId = parseInt(document.getElementById('editCategoryId').value);
            const imagesStr = document.getElementById('editImages').value.trim();
            if (!title || isNaN(price) || !description || isNaN(categoryId) || !imagesStr) {
                alert('Please fill all fields');
                return;
            }
            const images = imagesStr.split(',').map(img => img.trim()).filter(img => img);
            if (images.length === 0) {
                alert('At least one image URL required');
                return;
            }
            const productId = document.getElementById('detailModalBody').dataset.productId;
            const data = { title, price, description, categoryId, images };
            try {
                const response = await fetch(`https://api.escuelajs.co/api/v1/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    alert('Updated successfully');
                    fetchProducts();
                    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                } else {
                    const errorText = await response.text();
                    alert('Error: ' + response.status + ' ' + response.statusText + '\n' + errorText);
                }
            } catch (error) {
                alert('Network error: ' + error);
            }
        });

        fetchCategories();
        fetchProducts();
        console.log('Init end');
    } catch (error) {
        alert('Init error: ' + error.message);
        console.error(error);
    }
}

window.addEventListener('load', init);