# concession-kiosk-backend

This is the backend component for the concession kiosk application. The backend is written using Node.js and Express and will serve as the intermediary between the frontend and the database.

# How to Deploy on OpenShift

```
oc new-project concession-kiosk
oc new-app https://github.com/jankleinert/concession-kiosk-backend --name backend
```

To link the frontend and backend components, you'll provide the backend service name (backend) and port (8080) to the frontend as environment variables.


