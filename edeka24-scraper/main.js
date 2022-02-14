const Apify = require('apify');
const {
    utils: { log },
} = Apify;

Apify.main(async () => {
    const input = await Apify.getInput();
    const sources = input.map(category => ({
        url: `https://www.edeka24.de/${category}`,
        userData: {
            label: 'CATEGORY',
        },
    }));

    const requestList = await Apify.openRequestList('categories', sources);
    const requestQueue = await Apify.openRequestQueue();

    log.info('Setting up crawler.');
    const crawler = new Apify.CheerioCrawler({
        useSessionPool: true,
        persistCookiesPerSession: true,
        requestList,
        requestQueue,
        handlePageFunction: async ({ $, request }) => {
            log.info(`Processing ${request.url}`);
            
            if (request.userData.detailPage) {
                const results = {
                    url: request.url,
                    title: ($('h1').text()).trim(),
                    price: ($('div.price').text()).trim()
                };
                var milliseconds = (new Date().getTime()).toString();
                const store = await Apify.openKeyValueStore('product-pages');
                await store.setValue(milliseconds, results);
            }
            
            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    $,
                    requestQueue,
                    selector: 'div.product-details > a',
                    baseUrl: request.loadedUrl,
                    transformRequestFunction: req => {
                        req.userData.detailPage = true;
                        return req;
                    }
                });
            }
        },
    });
    
    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Actor finished.');
});