const Gun = require('gun');
const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    Gun.serve(req, res);
});

const gun = Gun({ web: server });



const port = 8765;
server.listen(port, () => {
    console.log(`Gun server running on http://localhost:${port}/gun`);
});
