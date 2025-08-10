module.exports = async function (context, req) {
  // Minimal non-streaming placeholder for Azure Functions
  const text = 'Hello from MaatSaab API. Replace this with provider streaming.';
  context.res = {
    headers: { 'Content-Type': 'text/plain' },
    body: text,
  };
};
