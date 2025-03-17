### STAGE 1: Build ###
FROM node:16-alpine3.15 AS build
ARG ENV
ARG SSH_KEY

RUN apk update && apk add openssh
RUN mkdir /root/.ssh/
RUN echo "$SSH_KEY" > /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan -T 60 bitbucket.org >> /root/.ssh/known_hosts

RUN apk --update --no-cache add git

WORKDIR /app
COPY . /app
RUN npm ci
RUN npm run $ENV
### STAGE 2: Run ###
FROM nginx:1.22-alpine

WORKDIR /usr/src/app
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/ ./
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
