document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Check the user submit the email
  document.querySelector('form').onsubmit = function() {
    console.log('inside form')
    recipients = document.querySelector('#compose-recipients').value
    console.log(recipients)
    subject = document.querySelector('#compose-subject').value
    body = document.querySelector('#compose-body').value

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })   
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
    })

    return false
  }

  // load_mailbox('sent')
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const containerDiv = document.querySelector('#emails-view')

  const div = document.createElement('div')
  containerDiv.appendChild(div)

  const ul = document.createElement('ul')
  ul.setAttribute('class', 'mail-item')
  containerDiv.appendChild(ul)

  // Get the mails
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    console.log(emails)

    emails.forEach(element => {
      // make innerDiv
      const item_div = document.createElement('div')
      item_div.addEventListener('click', function() {
        console.log(`clicked. ${element.id}`)
        mail_view(element.id) 
      })

      if (element.read) {
        item_div.setAttribute('class', 'border gray-background ')
      } else {
        item_div.setAttribute('class', 'border white-background')
      }
      ul.appendChild(item_div)

      // make li
      const item_recip = document.createElement('li')
      item_recip.innerHTML = element.recipients
      item_recip.setAttribute('class', 'item')
      item_div.appendChild(item_recip)

      const item_sub = document.createElement('li')
      item_sub.innerHTML = element.subject
      item_sub.setAttribute('class', 'item')
      item_div.appendChild(item_sub)

      const item_time = document.createElement('li')
      item_time.innerHTML = element.timestamp
      item_time.setAttribute('class', 'timestamp')
      item_div.appendChild(item_time)

    });

  });
}

function mail_view(mail_id) {
  document.querySelector('#emails-view').style.display = 'block'
  document.querySelector('#compose-view').style.display = 'none'

  const email_view = document.querySelector('#emails-view')
  const main_div = document.createElement('div')
  email_view.appendChild(main_div)


  fetch('/emails/'+mail_id)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    const ul = document.createElement('ul')
    main_div.appendChild(ul)

    const from = document.createElement('li')
    from.innerHTML = 'From: ' + email.sender
    ul.appendChild(from)

    const to = document.createElement('li')
    to.innerHTML = 'To: ' + email.recipients
    ul.appendChild(to)

    const subject = document.createElement('li')
    subject.innerHTML = 'Subject: ' + email.subject
    ul.appendChild(subject)

    const timestamp = document.createElement('li')
    timestamp.innerHTML = 'Timestamp: ' + email.timestamp
    ul.appendChild(timestamp)

    const hr = document.createElement('hr')
    ul.appendChild(hr)

    const body = document.createElement('li')
    body.innerHTML = email.body
    ul.appendChild(body)


  })


}