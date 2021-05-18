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
    recipients = document.querySelector('#compose-recipients').value
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
      document.querySelector('#compose-view').innerHTML = result
    })

    // return false
    return load_mailbox('sent')
    // going back to inbox after vising sent mailbox? Why?
  }

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const emails_view = document.querySelector('#emails-view')

  const div = document.createElement('div')
  emails_view.appendChild(div)

  const table = document.createElement('table')

  // Get the mails
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(element => {

      // make table
      // <table>
      //     1     2    3   4
      //   <div> <tr> <td>recipients / sender </td> <td>subject</td> <td>timestamp</td> </tr> </div>
      //   <div> <tr> <td>recipients / sender </td> <td>subject</td> <td>timestamp</td> </tr> </div>
      //   <div> <tr> <td>recipients / sender </td> <td>subject</td> <td>timestamp</td> </tr> </div>
      // </table>


      // Make a row

      // 1. make div
      // const item_div = document.createElement('div')
      // item_div.addEventListener('click', function() {
      //   view_email(element.id, mailbox) 
      // })


      // 2. make first tr : row
      const tr = document.createElement('tr')
        tr.addEventListener('click', function() {
        view_email(element.id, mailbox) 
      })
      if (element.read) {
        tr.setAttribute('class', 'border gray-background')
      } else {
        tr.setAttribute('class', 'border white-background')
      }

      // 3. make 1st td : first column (recipient or sender)
      const td1 = document.createElement('td')
      td1.setAttribute('class', 'person')

      // 4. put a data into the td
      let person = document.createTextNode(element.recipients);
      if (mailbox !== 'sent') {
        person = document.createTextNode(element.sender)
      }
      td1.appendChild(person)
      tr.appendChild(td1)

      // make 2nd td : 2nd column (subject)
      const td2 = document.createElement('td')
      const subject = document.createTextNode(element.subject)
      td2.setAttribute('class', 'subject')
      td2.appendChild(subject)
      tr.appendChild(td2)

      // 3rd column (timestamp)
      const td3 = document.createElement('td')
      const timestamp = document.createTextNode(element.timestamp)
      td3.setAttribute('class', 'timestamp')
      td3.append(timestamp)
      tr.appendChild(td3)

      // item_div.appendChild(tr)

      // table.appendChild(item_div)
      table.appendChild(tr)

    });

  });

  div.appendChild(table)
  return false
}

function view_email(mail_id, mailbox) {

  document.querySelector('#emails-view').style.display = 'block'
  document.querySelector('#compose-view').style.display = 'none'

  // Clear out fields
  document.querySelector('#emails-view').innerHTML = ''

  const email_view = document.querySelector('#emails-view')
  const main_div = document.createElement('div')
  email_view.appendChild(main_div)

  // Retrive the email
  fetch('/emails/'+mail_id)
  .then(response => response.json())
  .then(email => {
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

    // Show Reply button in Inbox
    if (mailbox === 'inbox') {
      const reply_btn = document.createElement('button')
      reply_btn.innerHTML = 'Reply'
      reply_btn.setAttribute('class', 'btn btn-sm btn-outline-primary')
      reply_btn.setAttribute('id', 'reply')
      ul.appendChild(reply_btn)

      // document.querySelector('#reply').addEventListener('click', reply_email, mail_id)
      document.querySelector('#reply').addEventListener('click', () => reply_email(mail_id))
      // document.querySelector('#reply').addEventListener('click', reply_email, mail_id)

    }

    // Show Archive button if archived
    if (mailbox === 'inbox' || mailbox === 'archive') {

      if (email.archived === false) {
        const archive_btn = document.createElement('button')
        archive_btn.innerHTML = 'Archive'
        archive_btn.setAttribute('class', 'btn btn-sm btn-outline-primary')
        archive_btn.setAttribute('id', 'archive')
        ul.appendChild(archive_btn)

        document.querySelector('#archive').addEventListener('click', () => {
          fetch('/emails/'+mail_id, {
            method: 'PUT',
            body: JSON.stringify({ archived: true })
          }) 
        })

      // Show UnArchive button if unarchived
      } else {
        const archive_btn = document.createElement('button')
        archive_btn.innerHTML = 'UnArchive'
        archive_btn.setAttribute('class', 'btn btn-sm btn-outline-primary')
        archive_btn.setAttribute('id', 'archive')
        ul.appendChild(archive_btn)
        document.querySelector('#archive').addEventListener('click', () => {
          fetch('/emails/'+mail_id, {
            method: 'PUT',
            body: JSON.stringify({ archived: false })
          })
        }) 
      }

    }

    const hr = document.createElement('hr')
    ul.appendChild(hr)

    const body = document.createElement('li')
    body.innerHTML = email.id + ' ' + email.body
    ul.appendChild(body)

    // Mark it as read
    return fetch('/emails/'+mail_id, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  })
}

function reply_email(mail_id) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Retrieve the email
  fetch('/emails/'+mail_id)
  .then(response => response.json())
  .then(email => {
    // prefill the composition fields
    document.querySelector('#compose-recipients').value = email.sender
    if (email.subject.includes('Re:')) {
      document.querySelector('#compose-subject').value = email.subject
    } else {
      document.querySelector('#compose-subject').value = 'Re: ' + email.subject
    }
    document.querySelector('#compose-body').value = `"On ${email.timestamp} ${email.sender} wrote:" \n ${email.body}`
  })

  // Check the user submit the email
  document.querySelector('form').onsubmit = function() {

    recipients = document.querySelector('#compose-recipients').value
    subject = document.querySelector('#compose-subject').value
    body = document.querySelector('#compose-body').value

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
        read: true
      })   
    })
    .then(response => response.json())
    .then(result => {
      document.querySelector('#compose-view').innerHTML = result
      // how can I see the result if I run load_mailbox() rightaway?
    })
    
    return load_mailbox('sent')
  } 
  
}
