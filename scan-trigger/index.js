module.exports = async function (context, req) {
    try {
        const clientId = process.env.AZURE_CLIENT_ID;
        const tokenUrl = `${process.env.IDENTITY_ENDPOINT}?resource=https://management.azure.com/&api-version=2019-08-01&client_id=${clientId}`;
        
        const tokenResp = await fetch(tokenUrl, {
            headers: { "X-IDENTITY-HEADER": process.env.IDENTITY_HEADER }
        });
        
        if (!tokenResp.ok) {
            context.res = { status: 500, body: `Token Error: ${await tokenResp.text()}` };
            return;
        }
        
        const tokenData = await tokenResp.json();
        
        const sub = process.env.AZURE_SUBSCRIPTION_ID;
        const rg = process.env.AZURE_RESOURCE_GROUP;
        const job = process.env.AZURE_JOB_NAME;
        const url = `https://management.azure.com/subscriptions/${sub}/resourceGroups/${rg}/providers/Microsoft.App/jobs/${job}/start?api-version=2023-05-01`;
        
        const jobResp = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!jobResp.ok) {
            context.res = { status: jobResp.status, body: `Job Error: ${await jobResp.text()}` };
            return;
        }
        
        context.res = { status: 202, body: 'Success: Scanner Job Started' };
    } catch (err) {
        context.res = { status: 500, body: err.message };
    }
};
