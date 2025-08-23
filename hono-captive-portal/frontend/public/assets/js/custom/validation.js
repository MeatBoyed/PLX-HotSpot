function validateVoucher() {
    const input = document.getElementById("voucherCode").value.trim();
    const errorMsg = document.getElementById("error-msg");

    // Example: Assume only "DISCOUNT2025" is a valid code
    const validCodes = ["DISCOUNT2025"];

    if (validCodes.includes(input)) {
      errorMsg.style.display = "none";
      alert("Voucher applied!");
      // You can proceed to apply the voucher logic here
    } else {
      errorMsg.style.display = "block";
    }
  }