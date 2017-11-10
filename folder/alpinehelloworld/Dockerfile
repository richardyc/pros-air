FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
RUN pip install -U flask-cors
#ENTRYPOINT ["python"]
# Run the image as a non-root user
RUN adduser -disabled-password myuser
USER myuser

# Run the app.  CMD is required to run on Heroku
# $PORT is set by Heroku		 	
CMD gunicorn --bind 0.0.0.0:$PORT wsgi 

#CMD python app.py --bind 0.0.0.0:$PORT
