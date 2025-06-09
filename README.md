# PLX-HotSpot

Using Docker
Install Docker on your machine.
Build your container: docker build -t nextjs-docker ..
Run your container: docker run -p 3000:3000 nextjs-docker.
You can view your images created with docker images.

In existing projects
To add support for Docker to an existing project, just copy the Dockerfile into the root of the project and add the following to the next.config.js file:

// next.config.js
module.exports = {
  // ... rest of the configuration.
  output: "standalone",
};
This will build the project as a standalone app inside the Docker image.