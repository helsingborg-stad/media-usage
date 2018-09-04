'use strict';

const BulkScan = require('./BulkScan.js');
const SingleScan = require('./SingleScan.js');


class MediaUsage
{
    constructor()
    {
        new BulkScan();
        new SingleScan();
    }
}

new MediaUsage();
