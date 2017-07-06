
//require("jquery-ui/ui/widgets/accordion");

import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import io from 'socket.io-client';
import hooks from 'feathers-hooks';
import auth from 'feathers-authentication-client';
var $  = require('jquery');
import {Percept} from '../public/percept/index';

$(function(){
    const app = feathers();
    const socket = io("http://localhost:3030");
    app.configure(socketio(socket));

    app.configure(hooks());
    
    app.configure(auth());

    var percept = new Percept({app:app});

    percept.doExperiment({label:'testexp'});

});