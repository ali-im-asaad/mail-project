document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('#compose-form').onsubmit = schicken;

    load_mailbox('inbox');
});

function compose_email(event, recipient = '', subject = '', body = '') {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#add-view').style.display = 'none';

    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
}

function schicken() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

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
            load_mailbox('sent');
        });
    return false;
}

function load_mailbox(mailbox) {

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
          emails.forEach(email => {
              const element = document.createElement("div");
              element.classList.add('posta');
                element.innerHTML = `
                <div>Subject: ${email.subject}</div>
                <div>Sender: ${email.sender}</div>
                <div>Date: ${email.timestamp}</div>`

              if (email.read) {
                  element.classList.add('gelesen');
              }


              element.addEventListener('click', () => view_email(email, mailbox));

              document.querySelector("#emails-view").append(element);
          })
      });

    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#add-view').style.display = 'none';
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}


function view_email(email, mailbox) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#add-view').style.display = 'block';

    fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(email => {
            if (!email.read) {
                fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({read: true})
                })
            }
        });

          document.querySelector('#add-view').innerHTML = "";

          const betreff = document.createElement("div");
          betreff.innerHTML = email.subject;

          document.querySelector('#add-view').append(betreff)

          const inhalt = document.createElement("div");
          inhalt.innerHTML = `
                <div>From: ${email.sender}</div>
                <div>To: ${email.recipients}</div>
                <div>Subject: ${email.subject}</div>
                <div>Timestamp: ${email.timestamp}</div>
                <hr>
                <div>${email.body}</div>`

          document.querySelector('#add-view').append(inhalt)


    if (mailbox === "inbox") {
        const archive = document.createElement("button");
        archive.innerHTML = "Archive"
        archive.className = "email-btns btn btn-sm btn-outline-secondary"
        archive.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({archived: true})
            })
                .then(response => {
                    load_mailbox("inbox")
                })
        })
        document.querySelector('#add-view').append(archive)

    } else if (mailbox === "archive") {
        const unarchive = document.createElement("button");
        unarchive.innerHTML = "Unarchive"
        unarchive.className = "email-btns btn btn-sm btn-outline-secondary"
        unarchive.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({archived: false})
            })
                .then(response => {
                    load_mailbox("inbox")
                })
        })
        document.querySelector('#add-view').append(unarchive)
    }



        const antwort = document.createElement("button");
        antwort.innerHTML = "Reply";
        antwort.className = "email-btns btn btn-sm btn-outline-secondary";
        antwort.addEventListener('click', function(event) {

          let subject = email.subject
          if (!email.subject.startsWith("Re: ")) {
            subject = `Re: ${subject}`
          }
          let body = `On ${email.timestamp} ${email.sender} wrote: \n${email.body}\n.......\n`
          let recipient = email.sender;
          compose_email(event, recipient, subject, body)
        });

          document.querySelector('#add-view').append(antwort)


}
