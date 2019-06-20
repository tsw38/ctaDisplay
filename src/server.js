
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const graphqlHTTP = require("express-graphql");
const dotenv = require("dotenv");
const expressPlayground = require("graphql-playground-middleware-express").default;
const schema = require("./schemas/RootQuery");
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

dotenv.config();

const app = express();

const createHtml = require('./utils/createHtml');
console.warn(path.resolve(__dirname, `../../dist/${process.env.VERSION_NUMBER}/client`))
app
    .use(cors({
        credentials: true,
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE', 'OPTIONS'],
        allowedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept']
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended:true}))
    .use(cookieParser())
    .use(compression())
    .use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))
    .use('/playground', expressPlayground({ endpoint: "/graphql" }))
    .use("/graphql",
        bodyParser.json(),
        bodyParser.urlencoded({extended:true}),
        cookieParser(),
        graphqlHTTP((req, res) => {
            return {
                schema,
                context: {req, res}
            }
        }
    ))
    .use('*/js', express.static(path.resolve(__dirname, `../../dist/${process.env.VERSION_NUMBER}/client`)))
	.use(createHtml)
    .listen(process.env.HTTP_PORT, () =>
        console.log(`Now browse to localhost:${process.env.HTTP_PORT}`)
    );
