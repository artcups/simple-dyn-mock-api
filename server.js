

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

var fs = require('fs');

app.get('*', function (req, res) {
    var regEx = new RegExp('\\/([a-zA-Z0-9]+)(?:\\/([a-zA-Z0-9]+))?', 'i');
    const path = req.path;
    const params = path.match(regEx);

    if(req.path === "/"){
        res.status(200);
        res.send('Mock on');
        return;
    }

    let endpoint = "";
    if(params[1] !== undefined)
        endpoint = `${params[1]}.json`;

    if(endpoint === ""){
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    let param = "";
    if(params[2] !== undefined)
        param = params[2];
    

    fs.readFile(`endpoints/${endpoint}`, 'utf8', (err, data) => {  
        if (err) {
            res.status(404);
            res.send({ error: 'Not found' });
            return;
        }
        
        let returnData  = data;
        if(param !== ""){
            const jsonData = JSON.parse(data);
            const returnObject = jsonData.filter((entry)=>{
                return entry.id == param;
            })
            
            if(returnObject.length > 0)
                returnData = JSON.stringify(returnObject[0]);
            else{
                res.status(404);
                res.send({ error: 'Not found' });
                return;
            }
        }

        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(returnData);
        return;
    });
});

app.post('*', function (req, res) {
    var regEx = new RegExp('\\/([a-zA-Z0-9]+)(?:\\/([a-zA-Z0-9]+))?', 'i');
    const path = req.path;
    const params = path.match(regEx);

    if(req.path === "/"){
        res.status(200);
        res.send('Mock on');
        return;
    }

    let endpoint = "";
    if(params[1] !== undefined){
        endpoint = `${params[1]}.json`;
    }

    let param = "";
    if(params[2] !== undefined)
        param = params[2];

    if(endpoint === ""){
        res.status(404);
        res.send({ error: 'Not found' });
        return;
    }

    fs.readFile(`endpoints/${endpoint}`, 'utf8', (err, data) => {  
        if (err) {
            res.status(404);
            res.send({ error: 'Not found' });
            return;
        } 

        const jsonData = JSON.parse(data);
        let postObj = req.body;
        let returnData  = data;
        
        if(param !== ""){
            const returnObject = jsonData.filter((entry)=>{
                return entry.id == param;
            })
            
            postObj["id"] = returnObject[0].id;
            jsonData.splice(jsonData.indexOf(returnObject[0]), 1);
            jsonData.push(postObj);

            fs.writeFile(`endpoints/${endpoint}`, JSON.stringify(jsonData), (err) => {
                if (err) {
                    res.status(404);
                    res.send({ error: 'Not found' });
                    return;
                } else {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(postObj);
                    return;
                }
            })
        }else {

            let id = 0;
            for(entry of jsonData){
                if(entry.id > id)
                    id = entry.id
            }
            postObj["id"] = id + 1;
            jsonData.push(postObj);

            fs.writeFile(`endpoints/${endpoint}`, JSON.stringify(jsonData), (err) => {
                if (err) {
                    res.status(404);
                    res.send({ error: 'Not found' });
                    return;
                } else {
                    res.status(200);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(postObj);
                    return;
                }
            })

        }
    });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))