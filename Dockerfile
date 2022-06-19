FROM node:16.1-alpine As base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base As development
RUN npm install
COPY . .
RUN npm run build

FROM base AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm install --only=production
COPY . .

COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
