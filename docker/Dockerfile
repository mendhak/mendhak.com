FROM node:latest

RUN apt-get update -qq
RUN apt-get install -y memcached

RUN mkdir /src
WORKDIR /src

VOLUME /src

COPY run.sh /run.sh
RUN chmod 755 /run.sh

EXPOSE 3000
EXPOSE 11211

CMD ["/run.sh"]