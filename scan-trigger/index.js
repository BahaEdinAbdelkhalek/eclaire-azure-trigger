module.exports = async function (context, req) {
    try {
        // 1. Get token securely from Azure Managed Identity (Zero dependencies!)
        const tokenResp = await fetch(process.env.IDENTITY_ENDPOINT + "?resource=https://management.azure.com/&api-version=2019-08-01", {
            headers: { "X-IDENTITY-HEADER": process.env.IDENTITY_HEADER }
        });
        const tokenData = await tokenResp.json();
        
        // 2. Setup the request to start the scanner job
        const sub = process.env.AZURE_SUBSCRIPTION_ID;
        const rg = process.env.AZURE_RESOURCE_GROUP;
        const job = process.env.AZURE_JOB_NAME;
        const url = `https://management.azure.com/subscriptions/${sub}/resourceGroups/${rg}/providers/Microsoft.App/jobs/${job}/start?api-version=2023-05-01`;
        
        // 3. Trigger it
        const jobResp = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        context.res = { status: jobResp.ok ? 202 : jobResp.status, body: 'Scanner Triggered' };
    } catch (err) {
        context.res = { status: 500, body: err.message };
    }
};
