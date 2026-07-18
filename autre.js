
  const livraison = document.getElementById('livraisonbtn');

  livraison.addEventListener('click', () => {
    const newText = prompt('Entrez votre adresse de livraison :', livraison.textContent);
    if (newText !== null && newText.trim() !== '') {
      livraison.textContent = newText.trim();
      showToast(`Adresse de livraison mise à jour : ${livraison.textContent}`, 'fa-solid fa-location-dot');
    }
  });