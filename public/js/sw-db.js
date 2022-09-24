//Utilidades para guardar con PouchDB
const db = new PouchDB('messages');

function guardarMensaje(message) {
    message._id = new Date().toISOString();
    return db.put(message).then(() => {
        self.registration.sync.register('nuevo-post');
        const newResp = {
            ok: true,
            offline: true
        };
        return new Response(JSON.stringify(newResp));
    });
};

//POstear mensajes de forma asyncrona
function postearMensajes() {
    const posts = [];
    return db.allDocs({include_docs: true}).then(docs => {
        docs.rows.forEach(row => {
            const doc = row.doc;
            const fetchProm = fetch('api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(doc)
            }).then(res => {
                return db.remove(doc);
            });
            posts.push(fetchProm);
        });//Fin del foreach
        return Promise.all(posts);
    });


}
