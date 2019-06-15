FROM node:8
RUN npm install request --save
RUN npm install node-jq --save
RUN npm install http --save
RUN npm install crypto --save
RUN npm install mongodb --save
RUN npm install fs --save
ADD Curb.js /Curb.js
ADD external.json /external.json
ADD prices.js /prices.js
ENV METHOD GET
ENV BODY POST
ENV PORT 9999
ENV CLIENTSECRET 123
ENV CLIENTID 123
ENV GATEWAY http
ENV AUTH_TOKEN 123 
USER 999
ENTRYPOINT ["node", "Curb.js"]