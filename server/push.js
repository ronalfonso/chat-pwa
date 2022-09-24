const fs = require('fs');
const webpush = require('web-push');
const URLSafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');

webpush.setVapidDetails(
    'mailto:raalfonsoparra@gmail.com',
    vapid.publicKey,
    vapid.privateKey
);

const subscriptions = require('./subs-db.json');

module.exports.getKey = () => {
    return URLSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (suscripcion) => {
    subscriptions.push(suscripcion);
    console.log(subscriptions);
    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
};

module.exports.sendPush = (post) => {
    subscriptions.forEach((subscription, i) => {
        webpush.sendNotification(subscription, JSON.stringify(post));
    });
};
