# Setup

### Requirements

RESTHeart version required: 0.10.1 at least.

### Clone this project locally

    $ git clone git@github.com:SoftInstigate/restheart-blog-example.git

### Install Dependencies

    $ cd restheart-blog-example
    $ bower install

Donwload the latest [restheart binary distribution](https://github.com/SoftInstigate/restheart/releases/latest) archive, either the `tar.gz` or the `.zip` file.

Uncompress the downloaded archive, enter the folder and copy the `restheart.jar` binary file in the blog's main directory `restheart-blog-example` (this is to avoid editing the paths in the configuration file, since these must be relative to the restheart jar file)

### Run the Application

Start MongoDB and RESTHeart (refer to [RESTHEART documentation](http://restheart.org/docs/get-up-and-running.html) for more help)

    $ mongod --fork --syslog
    $ java -server -jar restheart.jar restheart.yml

The application is available at [http://127.0.0.1:8080/blog](http://127.0.0.1:8080/blog)

### Initialize the db

If not already done, you'll be asked to initialize the database.
This is achieved executing the following curl commands from command line:

    $ curl -u admin:changeit -i -X PUT http://127.0.0.1:8080/data/blog -H "Content-Type: application/json"
    $ curl -u admin:changeit -i -X PUT http://127.0.0.1:8080/data/blog/posts -H "Content-Type: application/json"
