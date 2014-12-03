### Install Dependencies

    $ bower install
    
Copy the restheart.jar binary in the blog application directory (this is to avoid editing the paths in the configuration file, since these must be relative to the restheart jar file) 

### Run the Application

Start MongoDB and RESTHeart (refer to [RESTHEART documentation](http://restheart.org/docs/get-up-and-running.html) for more help)

    $ mongod --fork --syslog
    $ java -server -jar restheart.jar restheart.yml

The application is available at [http://127.0.0.1:8080/blog](http://127.0.0.1:8080/blog)

### Initialized the db

If not already done, you'll be asked to initialize the database.
This is achieved executing the following commands:

    $ curl -u admin:changeit -i -X PUT http://127.0.0.1:8080/data/blog -H "Content-Type: application/json"
    $ curl -u admin:changeit -i -X PUT http://127.0.0.1:8080/data/blog/posts -H "Content-Type: application/json"