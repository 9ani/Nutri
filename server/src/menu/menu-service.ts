import axios from 'axios';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const twoGisApiKey = process.env.TWOGIS_API_KEY;

class MenuService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async recommendFood(latitude: number, longitude: number, nutritionScale: any): Promise<any> {
    try {
      console.log('recommendFood called with latitude:', latitude, 'longitude:', longitude, 'nutritionScale:', nutritionScale);
      const places = await this.searchPlacesInRadius(latitude, longitude);
      console.log('Found places:', places.length, places);
      const menuData = await this.getMenuData(places);
      console.log('Processed menu data:', menuData);
      console.log('Processed menu data length:', menuData.length);
      return await this.analyzeAndRecommend(menuData, nutritionScale);
    } catch (error) {
      console.error('Error in recommendFood:', error);
      return { recommendations: [], error: 'An error occurred while processing your request.' };
    }
  }

  private async searchPlacesInRadius(latitude: number, longitude: number): Promise<any[]> {
    try {
      console.log('Searching for places within radius...');
      const response = await axios.get('https://catalog.api.2gis.com/3.0/items', {
        params: {
          q: 'кафе',
          point: `${longitude},${latitude}`,
          radius: 1000,
          sort_point: `${longitude},${latitude}`,
          sort: 'distance',
          key: twoGisApiKey
        }
      });
      console.log('2GIS API response:', response.data);
      return response.data.result.items;
    } catch (error) {
      console.error('Error fetching data from 2GIS API:', error);
      return [];
    }
  }

  private async getMenuData(places: any[]): Promise<any[]> {
    try {
      const menuList = JSON.parse(await fs.readFile('menuList.json', 'utf-8'));
      console.log('Loaded menuList.json:', menuList);

      const menuData: any[] = [];

      for (const place of places) {
        console.log(`Processing place: ${place.name} (ID: ${place.id})`);
        const menuItem = menuList.find((item: any) => item.id === place.id);
        if (menuItem) {
          console.log(`Found existing menu data for ${place.name}`);
          menuData.push(menuItem);
        } else {
          console.log(`Parsing menu for ${place.name}`);
          const parsedMenu = await this.parseMenu(place.id);
          menuData.push({
            id: place.id,
            name: place.name,
            parsedImages: parsedMenu.images,
            parsedMenu: parsedMenu.dishes
          });
        }
      }

      console.log(`Processed ${menuData.length} menus`);
      return menuData;
    } catch (error) {
      console.error('Error in getMenuData:', error);
      return [];
    }
  }

  private async parseMenu(placeId: string): Promise<{ images: string[], dishes: string[] }> {
    try {
      console.log(`Parsing menu for placeId ${placeId}`);
      const images = await scrapeMenuImages(placeId);
      let parsedMenu: string[] = [];

      if (images.length > 0) {
        console.log(`Found images for placeId ${placeId}. Sending images to Gemini.`);
        parsedMenu = await sendImagesToGemini(images);
      } else {
        console.log(`No images found for placeId ${placeId}. Falling back to text menu.`);
        const textMenu = await scrapeTextMenu(placeId);
        parsedMenu = textMenu.map(dish => dish.name);
      }

      return {
        images,
        dishes: parsedMenu
      };
    } catch (error) {
      console.error(`Error parsing menu for placeId ${placeId}:`, error);
      return { images: [], dishes: [] };
    }
  }

  private async analyzeAndRecommend(menuData: any[], nutritionScale: any): Promise<any> {
    try {
      if (menuData.length === 0) {
        console.log('No menu data available for analysis');
        return { recommendations: [], message: 'No menu data available for analysis' };
      }

      console.log('Analyzing and recommending dishes...');
      const model = await this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze the following menu data and nutrition scale, and recommend the 3 most suitable dishes:
        Menu Data: ${JSON.stringify(menuData)}
        Nutrition Scale: ${JSON.stringify(nutritionScale)}

        Please provide recommendations in the following JSON format, enclosed in \`\`\`json tags:
        \`\`\`json
        {
          "recommendations": [
            {
              "dish": "Dish Name",
              "restaurant": "Restaurant Name",
              "reason": "Reason for recommendation"
            }
          ]
        }
        \`\`\``;

      console.log('Generated prompt:', prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log('Response from Gemini:', response);

      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[1]);
          console.log('Parsed recommendations:', parsedResponse);
          return parsedResponse;
        } catch (jsonError) {
          console.error('Error parsing extracted JSON:', jsonError);
          return { recommendations: [] };
        }
      } else {
        console.error('No valid JSON found in the response');
        return { recommendations: [] };
      }
    } catch (error) {
      console.error('Error analyzing and recommending:', error);
      return { recommendations: [] };
    }
  }
}

// Define the scraping functions
const scrapeMenuImages = async (placeId: string): Promise<string[]> => {
  const url = `https://2gis.kz/almaty/firm/${placeId}/tab/menu`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log('Scrolling to bottom of page to ensure all content is loaded');
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds after scrolling

      const newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === previousHeight) break; // Exit loop if no new content
    }

    console.log('Extracting image URLs from _1qzp1bx elements');
    const images = await page.evaluate(() => {
      const imageUrls: string[] = [];
      const elements = document.querySelectorAll('div._1qzp1bx');
      elements.forEach(el => {
        const imgElement = el.querySelector('img');
        if (imgElement) {
          let src = imgElement.src;
          const srcset = imgElement.srcset;
          if (srcset) {
            const srcsetParts = srcset.split(',');
            const highResSrc = srcsetParts.find(part => part.includes('2x'));
            if (highResSrc) {
              src = highResSrc.trim().split(' ')[0];
            }
          }
          if (src && src.includes('photo.2gis.com')) {
            imageUrls.push(src);
          }
        }
      });
      return imageUrls;
    });

    console.log(`Found ${images.length} images.`);
    return Array.from(new Set(images)); // Remove any potential duplicates
  } catch (error) {
    console.error(`Error scraping menu images for placeId ${placeId}:`, error);
    return [];
  } finally {
    await browser.close();
  }
};

const scrapeTextMenu = async (placeId: string): Promise<{ name: string }[]> => {
  const url = `https://2gis.kz/almaty/firm/${placeId}/tab/prices`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const dishes = await page.evaluate(() => {
      const dishElements = document.querySelectorAll('div._8mqv20');
      return Array.from(dishElements).map(div => {
        const name = div.querySelector('div')?.textContent?.trim();
        return { name: name || '' };
      });
    });

    console.log(`Found ${dishes.length} dishes.`);
    return dishes;
  } catch (error) {
    console.error(`Error scraping text menu for placeId ${placeId}:`, error);
    return [];
  } finally {
    await browser.close();
  }
};

const fileToGenerativePart = (buffer: Buffer, mimeType: string) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
    type: 'INLINE',
  };
};

const sendImagesToGemini = async (imageUrls: string[]) => {
  try {
    console.log('Sending images to Gemini for analysis...');
    
    const results = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageData = fileToGenerativePart(Buffer.from(response.data), 'image/jpeg');
        
        // Send imageData to Gemini and get the response
        // Adjust this API call based on actual Gemini API endpoint and parameters
        const geminiResponse = await axios.post('https://gemini-api-endpoint', {
          image: imageData,
          prompt: 'Analyze this image and identify the dish and ingredients.',
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        console.log('Gemini API response:', geminiResponse.data);

        // Adjust the following based on the actual response format
        return geminiResponse.data;
      })
    );

    // Process and return the results
    // Adjust the following based on the actual response format
    return results.map(result => {
      // Example: return result.text if the response contains a 'text' field
      // Modify this based on actual response format
      return result;
    });
    
  } catch (error) {
    console.error('Error sending images to Gemini:', error);
    return [];
  }
};


export default MenuService ;
