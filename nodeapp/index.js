var http = require('http');
var jws = require('jws')
var fs = require('fs');
 
var options = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt')
};
 
function base64urlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function base64urlEncode(str) {
  return new Buffer(str).toString('base64');
}
 
var sharepointhostname = process.argv[2]
var clientid = "927e7578-6a96-4120-be36-495a5bbb989b"
var realm = "5df7ebc5-9401-43fe-93e2-86a07f62c2b2" // equals to SharePoint Farm ID
var issuerid = '2a80398d-800e-44b1-ac67-e34b1207114f' + "@" + realm
var audience = '00000003-0000-0ff1-ce00-000000000000/' + sharepointhostname + '@' + realm
var x5t = "+NgPPAV6+Nm+sqGz/WHYxq1Mp8E" // ohne "=" am Ende
var nameid = "s-1-5-21-1482654976-146172710-446466059-3816" // SID des Anfragenden Benutzers
var nii = "urn:office:idp:activedirectory"
 
var dateref = parseInt((new Date()).getTime() / 1000)
var rs256 = '{"typ":"JWT","alg":"RS256","x5t":"' + x5t + '"}'
 
var actortoken = {
    aud: audience,
    iss: issuerid,
    nameid : clientid + '@' + realm,
    nbf:    (dateref - 21600).toString(),
    exp:    (dateref + 21600).toString(),
    trustedfordelegation: true
  }
 
var payload = {
  aud: audience,
  iss: clientid + '@' + realm,
  nbf: (dateref - 21600).toString(),
  exp: (dateref + 21600).toString(),
  nameid: nameid,
  nii: nii,
  actortoken: jws.sign(
    {
        header: JSON.parse(rs256),
        payload: JSON.stringify(actortoken),
        privateKey : options.key
    })
}
 
var authtoken = base64urlEncode(JSON.stringify({"typ":"JWT", "alg":"none"})) + '.' + base64urlEncode(JSON.stringify(payload)) + '.';
authtoken = authtoken.replace(/=/g, '') // my SharePoint does not accept base64 padding
 
var headers = {
  'Accept'        : 'application/json;odata=verbose',
  'Authorization' : 'Bearer ' + authtoken
};
var options = {
  host          : sharepointhostname,
  port          : 80,
  path          : "/sites/hightrustdemo/" + '_api/web/lists',
  method        : 'GET',
  headers       : headers,
  agent         : false,
  ciphers       : 'RC4',
  secureOptions : require ('constants').SSL_OP_NO_TLSv1_2
};
var listreq = http.get(options, function(listres) {
  listres.setEncoding('utf8');
  var listdata = "";
  listres.on('data', function(data) {
    listdata += data;
  });
  listres.on('end', function() {
/*    console.log("Response headers");
    console.log(JSON.stringify(listres.headers));
    console.log("Request headers");
    console.log(JSON.stringify(headers));
    console.log("Req fin\n\n");*/
    console.log(listdata);
    listdata = JSON.parse(listdata);
    var lists = [];
    if (listdata.d && listdata.d.results) {
      for (var ri in listdata.d.results) {
        var list = listdata.d.results[ri];
        console.log(list.Title);
      }
    }
  });
}).on('error', function(e) {
  console.log("Error " + e.message);
  console.log(JSON.stringify(e));
});
