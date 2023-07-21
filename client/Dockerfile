# base image
FROM node:lts-alpine

# set working directory
WORKDIR /app

# install and cache app dependencies
COPY package*.json ./
RUN npm install

# copy project files
COPY . .

# expose port
EXPOSE 8080

# start app
CMD ["npm", "run", "serve"]

