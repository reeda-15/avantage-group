document.getElementById('year').textContent = new Date().getFullYear();

const inquiryForm = document.getElementById('inquiry-form');
inquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(inquiryForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();
  if (!name || !email || !message) return;
  const subject = encodeURIComponent(`Project inquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nWhat I would like to improve:\n${message}`);
  window.location.href = `mailto:contact@avantageai.com?subject=${subject}&body=${body}`;
});
