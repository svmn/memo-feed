'use strict';

const fetch = require('node-fetch');
const bluebird = require('bluebird');
const { flattenDeep } = require('lodash');
const fs = require('fs');
const config = require('./config');
class Fetcher {
  constructor(pool) {
    this.pool = pool;
    this.sources = [];
  }

  update() {
    console.log('Running update');
    this.fetchCommunities()
      .then(data => this.pool.add(data))
      .catch(console.log);
  }

  fetchCommunities() {
    return bluebird.mapSeries(this.sources, source => this.fetchWall(source))
      .then(data => {
        console.log('Fetch done');
        return flattenDeep(data);
      });
  }

  fetchWall(domain) {
    console.log('Fetching ' + domain);
    return fetch(`https://api.vk.com/method/wall.get?v=5.59&count=${config.fetcherPostCount}&domain=${domain}`)
      .then(res => res.json())
      .then(data => {
        return data.response.items
          .filter(item => item.attachments)
          .map(post => {
            return post.attachments
              .filter(item => item.type === 'photo')
              .map(item => item.photo.photo_604);
          });
      });
  }

  loadSources() {
    this.sources = JSON.parse(fs.readFileSync('sources.json', 'utf-8'));
  }

  start() {
    this.loadSources();
    this.update();
    setInterval(this.update.bind(this), config.fetcherInterval);
  }

}

module.exports = Fetcher;
