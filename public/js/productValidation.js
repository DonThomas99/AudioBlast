function validateProductForm() {
    var productName = document.getElementById('exampleInputEmail1').value;
    var brand = document.getElementById('exampleInputEmail1').value;
    var connectivity = document.getElementById('exampleInputEmail1').value;
    var actualPrice = document.getElementById('exampleInputEmail1').value;
    var price = document.getElementById('exampleInputEmail1').value;
    var discountPrice = document.getElementById('exampleInputEmail1').value;
    var stock = document.getElementById('exampleInputEmail1').value;
    var category = document.getElementById('exampleInputEmail1').value;
    var description = document.getElementById('floatingTextarea').value;

    // Trim spaces and check for empty values
    if (productName.trim() === '' || brand.trim() === '' || connectivity.trim() === '' || actualPrice.trim() === '' ||
        price.trim() === '' || discountPrice.trim() === '' || stock.trim() === '' || category.trim() === '' || description.trim() === '') {
            document.getElementById('error-message').innerText = 'All fields are required';
        return false;
    }

    // Check if price, actual price, discount price, and stock are numeric and not less than 0
    if (isNaN(actualPrice) || actualPrice < 0 || isNaN(price) || price < 0 ||
        isNaN(discountPrice) || discountPrice < 0 || isNaN(stock) || stock < 0) {
            document.getElementById('error-message').innerText = 'Price, Actual Price, Discount Price, and Stock should be numeric values greater than or equal to 0';
        return false;
    }

    // Additional validation logic can be added here if needed

    return true;
}
