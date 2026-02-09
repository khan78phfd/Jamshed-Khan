document.addEventListener("click", async (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const handle = card.dataset.handle;
  const res = await fetch(`/products/${handle}.js`);
  const product = await res.json();

  openPopup(product);
});

function openPopup(product) {
  const popup = document.getElementById("product-popup");
  popup.hidden = false;

  document.getElementById("popup-title").textContent = product.title;
  document.getElementById("popup-price").textContent =
    `$${(product.variants[0].price / 100).toFixed(2)}`;

  document.getElementById("popup-desc").innerHTML = product.description;

  const variantsDiv = document.getElementById("popup-variants");
  variantsDiv.innerHTML = "";

  product.options.forEach((opt, index) => {
    const select = document.createElement("select");
    select.dataset.index = index;

    [...new Set(product.variants.map(v => v.options[index]))].forEach(v => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      select.appendChild(o);
    });

    variantsDiv.appendChild(select);
  });

  document.getElementById("add-to-cart").onclick = async () => {
    const selected = [...variantsDiv.querySelectorAll("select")]
      .map(s => s.value);

    const variant = product.variants.find(v =>
      selected.every((val, i) => v.options[i] === val)
    );

    await addToCart(variant.id);

    if (selected.includes("Black") && selected.includes("Medium")) {
      const jacketHandle =
        document.querySelector(".product-grid")?.dataset.autoJacket;

      if (jacketHandle) {
        const jacket = await fetch(`/products/${jacketHandle}.js`).then(r => r.json());
        await addToCart(jacket.variants[0].id);
      }
    }

    window.location.href = "/cart";
  };
}

async function addToCart(id) {
  await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, quantity: 1 })
  });
}

document.getElementById("popup-close").onclick =
document.querySelector(".overlay").onclick = () => {
  document.getElementById("product-popup").hidden = true;
};
