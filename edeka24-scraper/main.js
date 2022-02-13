const Apify = require('apify');

Apify.main(async () => {
    const sources = [
        'https://www.edeka24.de/Lebensmittel/Kaffee-und-Tee/',
        'https://www.edeka24.de/Lebensmittel/Getraenke/',
        'https://www.edeka24.de/Lebensmittel/Backzutaten/'
    ];

    const requestList = await Apify.openRequestList('categories', sources);
    const requestQueue = await Apify.openRequestQueue(); // <----------------

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 50, // <----------------------------------------
        requestList,
        requestQueue, // <---------------------------------------------------
        handlePageFunction: async ({ $, request }) => {
            console.log(`Processing ${request.url}`);
            var milliseconds = (new Date().getTime()).toString();
            // This is our new scraping logic.
            if (request.userData.detailPage) {
                const results = {
                    url: request.url,
                    title: ($('h1').text()).trim(),
                    price: ($('div.price').text()).trim()
                };
                const store = await Apify.openKeyValueStore('product-pages');
                await store.setValue(milliseconds, results);
            }
            // Only enqueue new links from the category pages.
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
    await crawler.run();
});