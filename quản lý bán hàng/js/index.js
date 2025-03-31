document.addEventListener("DOMContentLoaded", function () {
  const productTableBody = document.querySelector("#list .table tbody");
  const purchasedProductsTableBody =
    document.querySelector("#info table tbody");
  const totalField = document.querySelector(
    "#info input[placeholder='Tổng tiền']"
  );

  productTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-primary")) {
      const row = event.target.closest("tr");
      const productName = row.children[1].textContent.trim();
      const productQuantity = parseInt(row.children[2].textContent.trim());
      const productPrice = parseFloat(
        row.children[4].textContent.trim().replace(" VND", "")
      );
      const existingRow = purchasedProductsTableBody.querySelector(
        `[data-product="${productName}"]`
      );

      if (!existingRow) {
        const newRow = document.createElement("tr");
        newRow.setAttribute("data-product", productName);
        newRow.innerHTML = `
                <td>${productName}</td>
                <td><input type="number" class="form-control quantity" value="1" min="1" max="${productQuantity}" /></td>
                <td>${productPrice.toFixed(2)} VND</td>
                <td class="total-price">${productPrice.toFixed(2)} VND</td>
                <td><button class="btn btn-danger btn-sm remove-product">Xóa</button></td>
              `;
        purchasedProductsTableBody.appendChild(newRow);

        newRow
          .querySelector(".quantity")
          .addEventListener("input", updateRowTotal);
        newRow
          .querySelector(".remove-product")
          .addEventListener("click", function () {
            newRow.remove();
            updateTotalAmount();
          });
      }
    }
  });

  function updateRowTotal() {
    const row = this.closest("tr");
    const quantity = parseInt(this.value) || 0;
    const price = parseFloat(
      row.children[2].textContent.trim().replace(" VND", "")
    );
    const total = quantity * price;
    row.querySelector(".total-price").textContent = `${total.toFixed(2)} VND`;
    updateTotalAmount();
  }

  function updateTotalAmount() {
    let totalAmount = 0;
    purchasedProductsTableBody.querySelectorAll("tr").forEach((row) => {
      const rowTotal =
        parseFloat(
          row.querySelector(".total-price").textContent.replace(" VND", "")
        ) || 0;
      totalAmount += rowTotal;
    });
    totalField.value = `${totalAmount.toFixed(2)} VND`;
  }
});
