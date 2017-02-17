const express = require('express');
const request = require('request');
const unfluff = require('unfluff');
const exphbs  = require('express-handlebars');

let app = express();
let unfluff_cache = {};

const urlCheckMiddleware = (req, res, next) => {
    let url = req.query.url;

    if(!url) {
        res.status(422).json({
            'error': 'missing url parameter'
        });
        return;
    } else {
        next();
    }
}

app.engine('handlebars', exphbs());
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use((req, res, next) => {
    res.removeHeader('X-Powered-By')
    next();
});

app.use((req, res, next) => {
    console.log(`URL: ${req.path} Parsing ${req.query.url}`);
    next();
});

app.get('/story', urlCheckMiddleware, (req, res) => {

    let url = req.query.url;
    let theme = req.query.theme
    let showImage = req.query.img

    if(theme !== 'light' && theme !== 'dark') {
        res.status(422).json({
            'error': 'Invalid Theme'
        });
        return;
    } 

    if(unfluff_cache[url]) {
        let result = unfluff_cache[url];
        result.showImage = !!showImage;

        res.render(theme, result)
    } else {
        request.get(url, (err, response, body) => {

            if(err) {
                res.status(400).json({
                    'error': 'Invalid URL'
                });
            } else {

                let result = unfluff(body);
                unfluff_cache[url] = result;
                result.showImage = !!showImage;

                res.render(theme, result)
            }
        });
    }
});

app.listen(9000);
