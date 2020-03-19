# A simple example of a full website built with React.js stack
## React development source and testing

Major libraries used:
- react
- webpack
- babel
- react-router
- ampersand
- sass
- jest

---

##For demonstration purposes only.

---
---

### Getting Started

Install all the packages

~~~bash
npm install
~~~

BW - 20200319:
    If there are errors, consider deleting node_modules, checking version issues in dependancies, and rerunning. ie. update node-sass

To start the development web server use the following command and turn your browser to [http://localhost:3000](http://localhost:3000) or [http://0.0.0.0:3000](http://0.0.0.0:3000) 

~~~bash
npm start
~~~

BW - 20200319:
    Upon player connecting, this error is given backend
    Error: getaddrinfo ENOTFOUND z2
        at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:64:26)
    
    Frontside error:
    polling-xhr.js?bd56:261 POST http://localhost:3000/socket.io/?EIO=3&transport=polling&t=N3mJ8c6 404 (Not Found)

To run code lint

~~~bash
npm run lint
~~~

To run code tests

~~~bash
npm run test
~~~

To build the site 

~~~bash
npm run build
~~~
