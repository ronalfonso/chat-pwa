const fs = require('fs');
const webpush = require('web-push');
const URLSafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');

webpush.setVapidDetails(
    'mailto:raalfonsoparra@gmail.com',
    vapid.publicKey,
    vapid.privateKey
);

let subscriptions = require('./subs-db.json');

module.exports.getKey = () => {
    return URLSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (suscripcion) => {
    subscriptions.push(suscripcion);
    console.log(subscriptions);
    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
};

module.exports.sendPush = (post) => {
    const notificacionesEnviadas = [];
    subscriptions.forEach((subscription, i) => {
        const pushProm = webpush.sendNotification(subscription, JSON.stringify(post))
            .then(console.log('Notificacion enviada'))
            .catch(err => {
                console.log('Notificacion fallo');
                if (err.statusCode === 410) {
                    subscriptions[i].borrar = true;
                }
            });
        notificacionesEnviadas.push(pushProm);
    });
    Promise.all([notificacionesEnviadas]).then( () => {
        subscriptions = subscriptions.filter(subs => !subs.borrar);
        fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
    });
};
