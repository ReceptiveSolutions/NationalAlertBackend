// rss/rssFetcher.js
import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/db.js'; // Adjust path as needed
import extractImage from '../utils/extractImage.js'; // Optional

const parser = new Parser();

const rssFeeds = [
  {
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    source_name: 'BBC',
    category: 'business',
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms',
    source_name: 'TOI',
    category: 'entertainment',
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
    source_name: 'TOI',
    category: 'general', //! india news  ✅ Use 'general' or 'india' or anything you define in your app
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    source_name: 'TOI',
    category: 'top-stories', // or use 'general' or 'headline'
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/54829575.cms',
    source_name: 'TOI',
    category: 'cricket', // Cricket RSS Feeds 
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128838597.cms',
     source_name: 'TOI',
    category: 'mumbai',
    country: ['IN'],
  },
  {
    url: 'https://timesofindia.indiatimes.com/rssfeeds/3942660.cms',
    source_name: 'TOI',
    category: 'surat',
    country: ['IN'],
  },
];


export async function fetchAndStoreRSSNews() {
  for (const feedInfo of rssFeeds) {
    try {
      const feed = await parser.parseURL(feedInfo.url);

      for (const item of feed.items) {
        const article = {
          id: uuidv4(),
          title: item.title,
          summary: item.contentSnippet || item.summary || '',
          link: item.link,
          image_url: extractImage(item), // Optional helper
          pub_date: item.pubDate ? new Date(item.pubDate) : new Date(),
          source_type: 'rss',
          source_name: feedInfo.source_name,
          country: feedInfo.country,
          category: feedInfo.category,
          created_at: new Date(),
          is_archived: false,
        };

        await query(
          `INSERT INTO news_articles (
            id, title, summary, link, image_url, pub_date,
            source_type, source_name, country, category, created_at, is_archived
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12
          ) ON CONFLICT (link) DO NOTHING`,
          [
            article.id,
            article.title,
            article.summary,
            article.link,
            article.image_url,
            article.pub_date,
            article.source_type,
            article.source_name,
            article.country,
            [article.category],
            article.created_at,
            article.is_archived
          ]
        );
      }

      console.log(`✔ RSS feed fetched and stored: ${feedInfo.source_name}`);
    } catch (err) {
      console.error(`❌ Error fetching ${feedInfo.url}:`, err.message);
    }
  }
}
