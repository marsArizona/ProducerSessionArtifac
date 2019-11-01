'use strict';
const serverless = require('serverless-http');
const express    = require('express');
const bodyParser = require('body-parser');
const redis      = require('redis');

const app = express();

const client = redis.createClient(6379,'dev.h9yiuk.ng.0001.use2.cache.amazonaws.com');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/create',async (req, res, next)=>{
    try {

        client.on("error",  (err) => {

            console.log("Error : ", err);
        });
        client.on("connect",()=>{
            console.log('Esta cosa si conecto');

        });


        const {key , value} = req.body;

        const store = await client.set(key, value );

        client.get(key, function (error, result) {

            if(error){
                console.log(error);
                throw error;
            }
            console.log('results: '+ result);
            res.status(200).json(JSON.stringify(result));
        });
    }catch (e) {
        next(e);
    }
});


app.post('/read', async (req, res, next) => {
    try{

        const {key} = req.body;

        client.get(key, function (error, result) {

            if(error){
                console.log(error);
                throw error;
            }
            console.log('results: '+ result);
            res.status(200).json(JSON.stringify({type: 'success',res: result}));
        });

    }catch (e){
        next(e);
    }
});

app.post('/delete', async (req, res, next) => {
    try{

        console.log(req.body);
        const {key} = req.body;
        console.log("key", key);

        client.del(key, function(err, response){

            console.log('del in proccess');

            if(err){
                console.log('error');
                console.log(err);
                res.status(200).json(JSON.stringify({type: 'error', message: err.message}));

            }else {
                console.log('bien');
                console.log(response.message);
                res.status(200).json(JSON.stringify({type: 'success', message: response.message}));
            }


        });
    }catch(e){
        next(e);
    }
});

module.exports.node = serverless(app);