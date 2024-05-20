export default eventHandler(async (event) => {
    // log body
    let body = await readRawBody(event);
    let bodyJSON = JSON.parse(body);
    console.log(bodyJSON[0]);
});