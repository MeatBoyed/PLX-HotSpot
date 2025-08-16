```
npm install
npm run dev
```

```
open http://localhost:3000
```


So I've whitelisted 127.0.0.1 & hotspot.pluxnet.co.za on Nginx
I've also proxied all requests to hotspot.pluxnet.co.za/api to Honojs Backend

I've made the Mariadb run on 0.0.0.0 not 127.0.0.1 - so its accessable remotely
I've created a plx-captiveportal@<ip of hotspot.pluxnet.co.za> db user in maria and allowed access to rd

## still need to do
1. Close all ports (expect for necessary) on Radiusdesk vm & whitelist hotspot.pluxnet.co.za (ip) to access
DB Port only.
2. Disable/remove the radiusdesk.pluxnet.co.za/api/users/usage endpoint


# Frontend...
1. Dashboard page must GET the Usage data from Hotspot.pluxnet.co.za/api/usage
2. Login page must 