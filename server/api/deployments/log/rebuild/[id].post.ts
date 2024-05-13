export default eventHandler(async (event) => {
    // log body
    let body = await readRawBody(event);
    console.log(body);
});