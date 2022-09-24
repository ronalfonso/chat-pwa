
let url = window.location.href;
let swLocation = '/twittor/sw.js';

let swReg;


if ( navigator.serviceWorker ) {

    if ( url.includes('localhost') ) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register( swLocation ).then( function (req) {
            swReg = req;
            swReg.pushManager.getSubscription().then( verificaSubscrioption );
        });
    });

}





// Referencias de jQuery

let titulo      = $('#titulo');
let nuevoBtn    = $('#nuevo-btn');
let salirBtn    = $('#salir-btn');
let cancelarBtn = $('#cancel-btn');
let postBtn     = $('#post-btn');
let avatarSel   = $('#seleccion');
let timeline    = $('#timeline');

let modal       = $('#modal');
let modalAvatar = $('#modal-avatar');
let avatarBtns  = $('.seleccion-avatar');
let txtMensaje  = $('#txtMensaje');

let btnActivadas    = $('.btn-noti-activadas');
let btnDesactivadas = $('.btn-noti-desactivadas');

// El usuario, contiene el ID del hÃ©roe seleccionado
let usuario;




// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {

    let content =`
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${ personaje }.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${ personaje }</h3>
                <br/>
                ${ mensaje }
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn( ingreso ) {

    if ( ingreso ) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');
    
    }

}


// Seleccion de personaje
avatarBtns.on('click', function() {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function() {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function() {

    modal.removeClass('oculto');
    modal.animate({ 
        marginTop: '-=1000px',
        opacity: 1
    }, 200 );

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function() {
    if ( !modal.hasClass('oculto') ) {
        modal.animate({ 
            marginTop: '+=1000px',
            opacity: 0
         }, 200, function() {
             modal.addClass('oculto');
             txtMensaje.val('');
         });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function() {

    let mensaje = txtMensaje.val();
    if ( mensaje.length === 0 ) {
        cancelarBtn.click();
        return;
    }

    let data = {
        message: mensaje,
        user: usuario
    };

    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => console.log('app.js ', res))
        .catch(err => console.log('app.js err ', err));

    crearMensajeHTML( mensaje, usuario );

});

//Obtener mensajes del servidor
function getMessages() {
    fetch('api').then(res => res.json())
        .then(posts => {
            console.log(posts);
            posts.forEach(post => {
                crearMensajeHTML(post.message, post.user);
            });
        });
}

getMessages();

// Detectar cambios de conexion
function isOnline() {
    if (navigator.onLine) {
       let isonline = mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'Ok!'
        });
       isonline.show();
    } else {
        let isoffline = mdtoast('Offline', {
            interaction: true,
            actionText: 'Ok!',
            type: 'warning'
        });
        isoffline.show();
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

isOnline();


// Notificaciones

function verificaSubscrioption(activadas) {
    if (activadas) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}

function enviarNotificacion() {
    const notificationOpts = {
        body: 'Este es el cuerpo de la notificacion',
        icon: 'img/icons/icon-72x72.png'
    };
    const n = new Notification('Hola mundo!', notificationOpts);
    n.onclick = () => {
        console.log('Click');
    };
}

function notificame() {
    if (!window.Notification) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }

    if (Notification.permission === 'granted') {
        enviarNotificacion();
    } else if (Notification.permission !== 'denied'|| Notification.permission === 'default') {
        Notification.requestPermission( function (permission) {
            console.log(permission);
            if (permission === 'granted') {
                enviarNotificacion();
            } else {

            }
        });
    }
}

// notificame();
// verificaSubscrioption(undefined);


//Get key
function getPublicKey() {
    return fetch('api/key')
        .then(res => res.arrayBuffer())
        .then(key => new Uint8Array(key));
}

// getPublicKey().then(console.log);
btnDesactivadas.on('click', function () {
    if (!swReg) return console.log('No hay servicio de SW');

    getPublicKey().then( function (key) {
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        }).then(res => res.toJSON())
            .then(suscripcion => {
                // console.log(suscripcion);
                fetch('api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(suscripcion)
                })
                    .then(verificaSubscrioption(suscripcion))
                    .catch(cancelarSuscripcion);
            });
    });
});

function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then(subs => {
        subs.unsubscribe().then(() => verificaSubscrioption(false));
    });
};

btnActivadas.on('click', function () {
    cancelarSuscripcion();
});
