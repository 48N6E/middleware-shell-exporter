#!/bin/sh
# User/Password

SC_ACCESSKEY=${accesskeyid}
SC_ACCESSKEYSECRET=${accesskeysecret}
SC_REGION=${region}
SC_ENDPOINT=${endpoint}
SC_NEEDREQ=${needreq}


SC_ACCESSKEY=${SC_ACCESSKEY} SC_ACCESSKEYSECRET=${SC_ACCESSKEYSECRET} SC_REGION=${SC_REGION} SC_ENDPOINT=${SC_ENDPOINT} SC_NEEDREQ=${SC_NEEDREQ} node  ./start.js

