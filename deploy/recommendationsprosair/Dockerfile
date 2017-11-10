FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN pip install -U flask-cors
# Run the image as a non-root user
RUN adduser -disabled-password myuser
USER myuser

CMD gunicorn --bind 0.0.0.0:$PORT wsgi 
