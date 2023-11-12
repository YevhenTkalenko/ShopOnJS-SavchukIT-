const CART_PRODUCTS_LABEL = 'cart-products';

const getProducts = async () => {
    const responce = await fetch('https://fakestoreapi.com/products?limit=9');
    const products = await responce.json();
    return products;
}
/*renderProducts() рендерит все полученные элементы из Promise, который мы получили в функции getProducts().
После чего содаются элементы и динамически вставляються на страницу.
Классы таже необходимо добавить, чтобы нормально выглядела вёрстка.
Важно, в этой функции добавляется обработчик событий на кнопку покупки и передаётся параметром именно тот итерируемый элемент, на который кликнули. 
Это необходимо, чтобы JS понимал, какой именно элемент мы хотим закинуть в "корзину".*/
const renderProducts = async () => {
    const products = await getProducts()
    let container = document.querySelector('.store_main_section')
    products.forEach((product) => {
        //creating elements
        const productWrapper = document.createElement('div');
        const productImg = document.createElement('img');
        const productTitle = document.createElement('h4');
        const productDescription = document.createElement('p');
        const productPriceSection = document.createElement('div');
        const productPrice = document.createElement('span');
        const productBuyBtn = document.createElement('button');
        //add classes
        productWrapper.classList.add('store_card');
        productTitle.classList.add('product_title');
        productPriceSection.classList.add('product_footer');
        productPrice.classList.add('product_price');
        //insert data about product
        productTitle.innerText = product.title;
        productDescription.innerText = product.description;
        productImg.src = product.image;
        productPrice.innerText = `${product.price}$`;
        productBuyBtn.innerText = 'Add to Cart'
        productBuyBtn.addEventListener('click', () => addToCart(product));
        //appending elements inside wrapper  
        productPriceSection.append(productPrice, productBuyBtn);
        productWrapper.append(productImg, productTitle, productDescription, productPriceSection);
        container.appendChild(productWrapper)
    });

    renderInitialCart();
}

const renderCartItem = (product, inputNumber) => {

    const cart = document.querySelector('.cart-list');
    const emptyCartTitle = document.querySelector('.cart-empty-title');
    const cartListWrapper = document.querySelector('.cart-list-wrapper');
    const removeBtnAll = document.querySelector('.remove_all');
    removeBtnAll.addEventListener('click', () => {
        for (let child of cart.children) {
            child.remove()
        }
        if (!cart.children.length) {
            const cartListWrapper = document.querySelector('.cart-list-wrapper');
            const emptyCartTitle = document.querySelector('.cart-empty-title');
            cartListWrapper.style.display = 'none';
            emptyCartTitle.style.display = 'block';
        }
        updateCartTotal()
    })
    //creating elements
    const cartListItem = document.createElement('li');
    const cartListImgSection = document.createElement('section');
    const cartListPriceSection = document.createElement('section');
    const cartListQuantitySection = document.createElement('section');
    const img = document.createElement('img');
    const title = document.createElement('h4');
    const price = document.createElement('span');
    const quantity = document.createElement('input');
    const removeBtb = document.createElement('button');
    quantity.addEventListener('change', updateCartTotal);
    removeBtb.addEventListener('click', removeProductFromCart);

    //setting values
    cartListItem.classList.add('cart-list-item');
    cartListImgSection.classList.add('cart-list-item-section', 'cart-list-img-section');
    cartListPriceSection.classList.add('cart-list-item-section', 'cart-list-price-section');
    cartListQuantitySection.classList.add('cart-list-item-section', 'cart-list-quantity-section');
    img.src = product.image;
    title.innerText = product.title;
    price.innerText = `${product.price}$`;
    quantity.type = 'number';
    quantity.value = inputNumber || 1;
    quantity.min = 1;
    removeBtb.innerHTML = 'REMOVE';
    emptyCartTitle.style.display = 'none';
    cartListWrapper.style.display = 'block';

    //appending values

    cartListImgSection.append(img, title);
    cartListPriceSection.appendChild(price);
    cartListQuantitySection.append(quantity, removeBtb);
    cartListItem.setAttribute('id', product.id);
    cartListItem.append(cartListImgSection, cartListPriceSection, cartListQuantitySection);
    cart.appendChild(cartListItem);

    updateCartTotal()
}

const renderInitialCart = () => {
    const currentCartProducts = getCurrentCartItems();
    if (!currentCartProducts) {
        return;
    }
    currentCartProducts.forEach((item) => renderCartItem(item, item.amount));
    getCartTotal();
}


/*Эта функция просто возвращает нам количество товара, которое присуствует в локальном хранилище. 
Важно 1-е - эта функция вернёт не просто массив, а именно JSON, потому его необходимо превратить в массив (или у другое иное значение)
Важно 2-е - условие возвращения обязательно нужно указать пустой массив, так как если в localStorage ещё ничего не будет, то в таком случае
вернётся null, что может в дальнешнем привести к ошибкам.
Используем эту функцию для того, чтобы вернут действующее на данный момент количество элементов в localStorage. 
*/
const getCurrentCartItems = () => {
    JSON.parse(localStorage.getItem(CART_PRODUCTS_LABEL)) || []
}

/*addToCart принимает параметр конкретного product, который мы передаём через addEventListener событие "клик"  в renderProducts().
Если вывести через console.log(), то увидим, что принимается только один конкретный элемент, на который кликнули. 
Суть этой функции заключается в том, чтобы создать новые элементы, которые должны вывести тот товар, на который мы кликнули.
Важно понимать, какие именно необходимо создать элементы динамически. 
В данном случае, мы создаём li, input, section, img, title, price, button, span.
Если мы создали такой элемент, его обязательно необходимо будет вставить на страницу. Обязательно добавить классы, чтобы нормально выглядела вёрстка. 
!Цикл в начале проверяет, есть ли у итерируемого элемента id, которое уже присусвует в списке. Если такой id существует в цикле, то 
добавляется +1 к значению инпута и вывзывается функция с пересчётом общего значения. И выходится из цикла и не рендерится новый элемент, 
так как он уже существует. 
!! Переменная quantity - это инпут, из которого мы будем брать количество товара для умножения для общей суммы. Именно на эту переменную 
необходимо вешать 'change', чтобы отслеживать изменение value у инпута. 

*/
const addToCart = (product) => {
    const cartItem = document.getElementsByClassName('cart-list-item');
    for (let item of cartItem) {
        if (product.id === +item.getAttribute('id')) {
            const quantityInput = item.querySelector('.cart-list-quantity-section > input');
            quantityInput.value++;
            getCartTotal(product);
            return
        }
    }
    renderCartItem(product);
    // getCartTotal(product)
}

const removeProductFromCart = (event) => {
    event.target.parentElement.parentElement.remove();
    const cartItem = document.getElementsByClassName('cart-list-item');
    updateCartTotal();
    if (!cartItem.length) {
        const cartListWrapper = document.querySelector('.cart-list-wrapper');
        const emptyCartTitle = document.querySelector('.cart-empty-title');
        cartListWrapper.style.display = 'none';
        emptyCartTitle.style.display = 'block';
    }
}

/*Эта функция должна вызыватся каждый раз, когда происходят изменения основнога перечня товаром.
То есть, при:
        1)добавлении нового товара (результат работы функции addToCart).
        2)при проверке id.
        3)При изменении значения инпут, который отвечает за количество товара.
updateCartTotal должна каждый раз пробегаться по всех элементах списках (li), цеплятся за все цены и колисчество товара и добавлять 
к общей сумме. 
currentAmount - это сумма одного отдельного элемента, а чтобы получить сумму многих элементов, нужно при каждом пробеге по циклу добавлять
currentAmount каждного элемента к общей сумму. Потому тут используется переменная total. 
*/
const updateCartTotal = () => {
    const totalAmount = document.querySelector('.total-amount > span');
    const cartItem = document.getElementsByClassName('cart-list-item');
    let total = 0;

    for (let item of cartItem) {
        const price = item.querySelector('.cart-list-price-section > span');
        const quantity = item.querySelector('.cart-list-quantity-section > input');
        const currentAmount = parseFloat(price.innerText) * quantity.value;
        total += currentAmount;
    }
    totalAmount.innerHTML = `${total.toFixed(2)}`
}

renderProducts();



