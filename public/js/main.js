let hbtnPressed = false;
const message = document.getElementById('message');
const message__btn = document.getElementById('message__btn');
const hbtn = document.querySelector('.hbtn');
const hRow1 = document.getElementById('hrow1');
const hRow2 = document.getElementById('hrow2');
const hRow3 = document.getElementById('hrow3');
const mainHeaderNav = document.querySelector('.main-header__nav');
const mainHeaderNavItem = document.querySelector('.main_header__nav--item');

hbtn.addEventListener('click', event => {
    if (hbtnPressed === false) {
        showMobileMenu();
    } else {
        hideMobileMenu();
    }

    hbtnPressed = !hbtnPressed ? true : false;
});

mainHeaderNavItem.addEventListener('click', event => {
    hideMobileMenu()
});

function showMobileMenu() {
    hRow1.classList.add('hbtn__row--up');
    hRow2.classList.add('hbtn__row--center');
    hRow3.classList.add('hbtn__row--down');
    mainHeaderNav.classList.add('main-header__nav--show');
    mainHeaderNav.classList.remove('main-header__nav--hide');
}

function hideMobileMenu() {
    hRow1.classList.remove('hbtn__row--up');
    hRow2.classList.remove('hbtn__row--center');
    hRow3.classList.remove('hbtn__row--down');
    mainHeaderNav.classList.add('main-header__nav--hide');
    mainHeaderNav.classList.remove('main-header__nav--show');
}


if (message) {
    message__btn.addEventListener('click', function () {
        message.style.display = 'none';
    });
}


[...document.querySelectorAll('button[data_productid]')].map(element => {
    element.addEventListener('click', () => addToCardProduct(element));
});

[...document.querySelectorAll('button[data_orderid]')].map(element => {
    element.addEventListener('click', () => deleteOrder(element));
});

[...document.querySelectorAll('button[data_deleteproductid]')].map(element => {
    element.addEventListener('click', () => deleteProduct(element));
});


function deleteProduct(element) {
    let productId = element.getAttribute('data_deleteproductid');
    let productCard = document.getElementById(`productCardId${productId}`);
    productCard.remove();
    request({ endpoint: `/admin/delete-product/${productId}`, type: 'DELETE' });
}

async function addToCardProduct(element) {
    let pathName = window.location.pathname;
    let productId = element.getAttribute('data_productid');
    let { redirectTo } = await request({ endpoint: `/cart`, data: { productId: productId } });

    if (/^\/products\/\d+/.test(pathName)) window.location.replace(redirectTo);
}

async function deleteOrder(element) {
    let orders = document.querySelectorAll('.orders.mt20')[0];
    let orderId = element.getAttribute('data_orderid');
    let orderElement = document.getElementById(`orderId${orderId}`);
    await request({ endpoint: `deleteorder/${orderId}`, type: 'DELETE' });

    orderElement.remove();
    if (orders.childElementCount === 0) {
        orders.classList.add('textCenter');
        orders.innerHTML = '<h1>No orders</h1>';
    }
}

