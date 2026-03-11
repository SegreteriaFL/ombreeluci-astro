import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const srcDir = path.resolve('./src');
const contentBlogDir = path.join(srcDir, 'content', 'blog');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Configure turndown to keep certain elements or ignore them if needed
turndownService.remove(['script', 'style', 'noscript', 'iframe']);

const BATCH_SIZE = 30;

async function scrapeArticle(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Find the main article content. Common selectors in WP/OEL:
        let contentHtml = '';
        
        const possibleSelectors = [
            '.entry-content', 
            '.post-content', 
            'article .content', 
            'main article'
        ];
        
        for (const selector of possibleSelectors) {
            const el = $(selector);
            if (el.length > 0) {
                // Remove social sharing, related posts, etc. if they are inside the content
                el.find('.sharedaddy, .jp-relatedposts, .social-share, .post-navigation').remove();
                contentHtml = el.html();
                break;
            }
        }
        
        if (!contentHtml) {
             console.warn(`Could not find content for ${url} using known selectors.`);
             return null;
        }

        return turndownService.turndown(contentHtml);

    } catch (error) {
        console.error(`Failed to scrape ${url}: ${error.message}`);
        return null;
    }
}

async function runBatch() {
    console.log("Analyzing files to find those with missing content...");
    
    // Read all markdown files in blog directory
    const files = fs.readdirSync(contentBlogDir).filter(f => f.endsWith('.md'));
    
    const filesToScrape = [];
    
    for (const file of files) {
        const filepath = path.join(contentBlogDir, file);
        const content = fs.readFileSync(filepath, 'utf8');
        
        if (content.includes('*Nessun contenuto testuale trovato nel database.*')) {
            // Extract the original URL
            const urlMatch = content.match(/original_url:\s*"([^"]+)"/);
            if (urlMatch && urlMatch[1]) {
                filesToScrape.push({
                    filepath,
                    url: urlMatch[1],
                    fullContent: content
                });
            }
        }
    }
    
    console.log(`Found ${filesToScrape.length} total files needing scraping.`);
    const batch = filesToScrape.slice(0, BATCH_SIZE);
    console.log(`Processing batch of ${batch.length} files...`);
    
    let successCount = 0;
    
    for (const item of batch) {
        console.log(`\nScraping: ${item.url}`);
        
        // Add a small delay to be polite to the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const markdownBody = await scrapeArticle(item.url);
        
        if (markdownBody) {
             // Replace the placeholder text with the actual content
             const newContent = item.fullContent.replace(
                 '*Nessun contenuto testuale trovato nel database.*', 
                 markdownBody
             );
             
             fs.writeFileSync(item.filepath, newContent, 'utf8');
             console.log(`✅ Saved content for ${path.basename(item.filepath)}`);
             successCount++;
        } else {
             console.log(`❌ Failed extracting body for ${path.basename(item.filepath)}`);
        }
    }
    
    console.log(`\nBatch complete! Successfully scraped and saved ${successCount}/${batch.length} articles.`);
    if (filesToScrape.length > BATCH_SIZE) {
        console.log(`There are still ${filesToScrape.length - successCount} files left to scrape. Run the script again for the next batch.`);
    }
}

runBatch();
