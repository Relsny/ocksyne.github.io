
// OCKSYNE_DCAS_OFFRES_V1
(() => {
  "use strict";

  const buttons = document.querySelectorAll("[data-offer-open]");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-offer-open");
      const dialog = document.getElementById("dcas-dialog-" + id);

      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll(".dcas-offer-dialog").forEach(dialog => {
    dialog.querySelectorAll("[data-offer-close]").forEach(button => {
      button.addEventListener("click", () => dialog.close());
    });

    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
  });
})();
