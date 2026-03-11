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

// Clean up turndown output
turndownService.remove(['script', 'style', 'noscript', 'iframe', 'svg', 'form']);

const BATCH_SIZE = 30;

async function scrapeArticle(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Remove junk elements that might exist inside content wrappers
        $('.sharedaddy, .jp-relatedposts, .social-share, .post-navigation, .entry-meta, .post-meta, .wp-block-group.has-background').remove();
        
        let contentHtml = '';
        
        // Try precise WP selectors first
        const selectors = [
            'div.elementor-widget-theme-post-content', // Elementor specific
            'div[data-widget_type="theme-post-content.default"]',
            'div.entry-content', 
            'article .post-content',
            'main article .content',
            'div.post-content'
        ];
        
        for (const selector of selectors) {
            const el = $(selector);
            if (el.length > 0) {
                contentHtml = el.html();
                break;
            }
        }
        
        // Fallback if none of the standard wrappers worked, grab paragraphs from article
        if (!contentHtml) {
            const paragraphs = $('article p');
            if (paragraphs.length > 0) {
                contentHtml = paragraphs.parent().html();
            }
        }
        
        if (!contentHtml || contentHtml.trim().length < 50) {
             console.warn(`[!] Skipping ${url}: content found was empty or too short. Layout might be unusual.`);
             return null;
        }

        return turndownService.turndown(contentHtml);

    } catch (error) {
        console.error(`[X] Failed to fetch ${url}: ${error.message}`);
        return null;
    }
}

async function runBatch() {
    console.log("Analyzing files to find those with missing content...");
    
    if (!fs.existsSync(contentBlogDir)) {
        console.error(`Directory not found: ${contentBlogDir}`);
        return;
    }

    const files = fs.readdirSync(contentBlogDir).filter(f => f.endsWith('.md'));
    const filesToScrape = [];
    
    for (const file of files) {
        const filepath = path.join(contentBlogDir, file);
        const content = fs.readFileSync(filepath, 'utf8');
        
        if (content.includes('*Nessun contenuto testuale trovato nel database.*')) {
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
    
    console.log(`\nFound ${filesToScrape.length} total files needing scraping.`);
    if (filesToScrape.length === 0) {
        console.log("No further scraping needed!");
        return;
    }

    const batch = filesToScrape.slice(0, BATCH_SIZE);
    console.log(`Processing batch of ${batch.length} files...\n`);
    
    let successCount = 0;
    
    for (const item of batch) {
        console.log(`Scraping: ${item.url}`);
        
        const markdownBody = await scrapeArticle(item.url);
        
        if (markdownBody) {
             const newContent = item.fullContent.replace(
                 '*Nessun contenuto testuale trovato nel database.*', 
                 markdownBody
             );
             fs.writeFileSync(item.filepath, newContent, 'utf8');
             console.log(`✅ Success: ${path.basename(item.filepath)}`);
             successCount++;
        } else {
             console.log(`❌ Failed: ${path.basename(item.filepath)}`);
        }
        
        // Polite delay
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    console.log(`\n========================================`);
    console.log(`Batch complete! Saved ${successCount} out of ${batch.length} articles.`);
    console.log(`Remaining files: ${filesToScrape.length - successCount}`);
    console.log(`========================================\n`);
}

runBatch();
