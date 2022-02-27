const Apify = require('apify');
const { v4: uuidv4 } = require('uuid');
const { utils: 
    {log},
} = Apify;


Apify.main(async () => {
    const sources = [
        'https://www.edeka24.de/'
    ];

    const requestList = await Apify.openRequestList('sources', sources);
    const requestQueue = await Apify.openRequestQueue();

    log.info('Setting up crawler.');
    const crawler = new Apify.CheerioCrawler({
        maxConcurrency: 5, // only allow max of 5 concurrent requests
        useSessionPool: true, // shared IP Address emulation
        persistCookiesPerSession: false,
        requestList,
        requestQueue,
        handlePageFunction: async ({ $, request }) => {
            log.info(`Processing ${request.url}`);

            if (request.userData.detailPage) {
                $('.product-item').each(async function(){
                    const price = ($(this).find('.price').text()).trim()
                    if (price.includes('\n')) {
                        var parsed_price = price.split(/\r?\n/)[0]
                    } else {
                        var parsed_price = price
                    };
                    const results = {
                        url: ($(this).find('.product-details > a').attr('href')),
                        category: (request.url.split("/").splice(3, 3)).toString(),
                        title: ($(this).find('h2').text()).trim(),
                        price: parsed_price,
                        price_note: ($(this).find('.price-note').text()).trim()
                    };
                    const file_name = uuidv4();
                    const store = await Apify.openKeyValueStore('product-pages');
                    await store.setValue(file_name, results);
                });
            };
            
            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    $,
                    requestQueue,
                    selector: 'li.is-level-2 a',
                    baseUrl: request.loadedUrl,
                    transformRequestFunction: req => {
                        req.userData.detailPage = true;
                        return req;
                    },
                });
            }
        },
    });
    
    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Actor finished.');
});

// cand actually do xhr requests with cheerio