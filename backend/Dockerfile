FROM node:12.14.1
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . /app
CMD ["npm", "start"]