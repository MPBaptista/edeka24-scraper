const Apify = require('apify');
const {
    utils: { enqueueLinks },
} = Apify;

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://www.edeka24.de' });

    const handlePageFunction = async ({ request, $ }) => {
        const title = $('title').text();
        console.log(`The title of "${request.url}" is: ${title}.`);

        // Enqueue links
        const enqueued = await enqueueLinks({
            $,
            requestQueue,
            pseudoUrls: ['http[s?]://www.edeka24.de[.*]'],
            baseUrl: request.loadedUrl,
        });
        console.log(`Enqueued ${enqueued.length} URLs.`);
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 20,
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});