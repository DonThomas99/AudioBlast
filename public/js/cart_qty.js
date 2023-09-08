$(document).ready(function () {
  $(".qty-inc").on("click", function () {

    console.log("jfgshudvbs");
    let productId = $(this).data("product-id");
    updateQty(productId, "increase");
  });

  $(".qty-dec").on("click", function () {
    let productId = $(this).data("product-id");
    console.log("jfgshudvbs");

    updateQty(productId, "decrease");
  });
});

function updateQty(productId, action) {
  $.ajax({
    url: "/cart_qty",
    method: "PATCH",
    data: {
      productId: productId,
      action: action,
    },
    success: (response) => {
      $(".qty[data-product-id='" + productId + "']").val(response.quantity);
      $(".priceForQty[data-product-id='" + productId + "']").text(
        "₹" + response.total_price
      );
    },
    error: function (error) {
      console.error("Error updating quantity:", error);
    },
  });
}
