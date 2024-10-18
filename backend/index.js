const express = require('express');
const { program } = require('commander');
const cors = require('cors');
const { query, body, matchedData, validationResult } = require('express-validator');


/**
 * Prepare command line arguments
 */
program
    .option('-p, --port <PORT>', 'Select port on which the server will be run', 3014);
program.parse();
let port = program.opts().port;

/** Setup Express server */
const app = express();
app.use(cors());


app.use(express.json());

function resetChat() {
    return [{author: "admin", message: "Welcome to the chat!"}]; 
}

/**
 * Message format : 
 * { 
 *      author: "name",
 *      message: "content"
 * }
 */
let chat = resetChat();

app.get('/chat', (req, res) => {
    res.json(chat);
})

/**
 * Expected JSON body : 
 * {
 *      "author": "name",
 *      "message": "content"
 * }
 */
app.post(
    '/message', 
    body('author').exists().trim().isString().notEmpty(),
    body('message').exists().trim().isString().notEmpty(),
    (req, res) => {
        const validationRes = validationResult(req);
        if (validationRes.isEmpty()) {
            chat.push(matchedData(req));
            res.json(chat);
        } else {
            res.status(400).json({errors: validationRes.array()})
        }
    }
)

/**
 * Expected querystring parameter "message".
 * 
 * List of censored words : Lyon, Paris, England, English
 * 
 * Response : JSON object.
 * 
 * {
 *    "originalMessage": "The English are a great people",
 *    "censoredMessage": "The *** are a great people"
 * }
 */
app.get('/censorMessage', query('message').exists(), (req, res) => {
    const validationRes = validationResult(req);
    if (validationRes.isEmpty()) {
        let originalMessage = matchedData(req).message;
        let censoredMessage = originalMessage.replaceAll(/lyon|paris|england|english|psg/gi, '***');
        res.json({originalMessage, censoredMessage});
    } else {
        res.status(400).json({errors: validationRes.array()})
    }
});


/**
 * Clears the chat. Returns the new cleared chat
 */
app.delete('/chat', (req, res) => {
    chat = resetChat();
    res.json(chat);
})

let server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})




module.exports = {app, server};