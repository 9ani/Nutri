import axios from "axios";
import fs from "fs/promises";
import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const twoGisApiKey = process.env.TWOGIS_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const uploadImage = async (imageUrl: string) => {
  return {
    file: {
      mimeType: "image/jpeg",
      uri: imageUrl,
    },
  };
};

class MenuService {
  private genAI: GoogleGenerativeAI;
  private newMenuItems: any[] = [];

  constructor() {
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not defined in environment variables."
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async recommendFood(
    latitude: number,
    longitude: number,
    nutritionScale: any
  ): Promise<any> {
    try {
      console.log(
        "recommendFood called with latitude:",
        latitude,
        "longitude:",
        longitude,
        "nutritionScale:",
        nutritionScale
      );

      const cityName = await this.getCityName(latitude, longitude);

      if (!cityName) {
        throw new Error("Unable to determine city name from coordinates");
      }
      const places = await this.searchPlacesInRadius(latitude, longitude);
      console.log("Found places:", places.length, places);
      
      const menuData = cityName && ['Алматы', 'Астана', 'Шымкент', 'Уральск'].includes(cityName) && places.length > 0
      ? await this.getMenuData(places, cityName)
      : await this.parseNewCafes(places.slice(0, 10));
      
      console.log("Processed menu data:", menuData);
      console.log("Processed menu data length:", menuData.length);
      const recommendations = await this.analyzeAndRecommend(
        menuData,
        nutritionScale
      );

      // Ensure recommendations is an array
      if (!Array.isArray(recommendations)) {
        throw new Error("Received invalid recommendations data structure");
      }

      // Get coordinates for each recommended cafe
      const recommendationsWithCoordinates = await Promise.all(
        recommendations.map(async (rec: any) => {
          console.log(rec);
          const place = places.find((p) =>
            p.name.toLowerCase().includes(rec.restaurant.toLowerCase())
          );
          console.log("PLACE", place);
          if (place && place.address_name) {
            const coordinates = await this.getCoordinates(
              cityName,
              place.address_name
            );
            console.log("COORDINATES", coordinates);
            return {
              ...rec,
              coordinates,
            };
          } else {
            console.warn(
              `Place not found or missing address for restaurant: ${rec.restaurant}`
            );
            return { ...rec, coordinates: null };
          }
        })
      );

      // Save new menu items after processing
      await this.saveNewMenuItems(cityName);


      return { recommendations: recommendationsWithCoordinates };
    } catch (error) {
      console.error("Error in recommendFood:", error);
      return {
        recommendations: [],
        error: "An error occurred while processing your request.",
      };
    }
  }

  private async parseNewCafes(places: any[]): Promise<any[]> {
    const menuData: any[] = [];
    for (const place of places) {
      console.log(`Parsing menu for ${place.name} (ID: ${place.id})`);
      const parsedMenu = await this.parseMenu(place.id);
      const newMenuItem = {
        id: place.id,
        name: place.name,
        parsedImages: parsedMenu.images,
        parsedMenu: parsedMenu.dishes,
      };
      menuData.push(newMenuItem);
      this.newMenuItems.push(newMenuItem);
    }
    return menuData;
  }

  private async getCityName(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const response = await axios.get(
        "https://catalog.api.2gis.com/3.0/items/geocode",
        {
          params: {
            lat: latitude,
            lon: longitude,
            fields: "items.subtype,items.full_name",
            key: twoGisApiKey,
          },
        }
      );

      if (response.data.result.items && response.data.result.items.length > 0) {
        // Find the item with subtype 'city'
        const cityItem = response.data.result.items.find(
          (item: any) => item.subtype === "city"
        );

        if (cityItem && cityItem.full_name) {
          const cityName = cityItem.full_name.trim();
          console.log(`City name found: ${cityName}`);
          return cityName;
        }
      }

      console.warn("No city item found in geocoding response");
      return null;
    } catch (error) {
      console.error("Error fetching city name:", error);
      return null;
    }
  }

  private async getCoordinates(
    cityName: string,
    address: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await axios.get(
        "https://catalog.api.2gis.com/3.0/items/geocode",
        {
          params: {
            q: `${cityName}, ${address}`,
            fields: "items.point",
            key: twoGisApiKey,
          },
        }
      );

      if (response.data.result.items && response.data.result.items.length > 0) {
        const point = response.data.result.items[0].point;
        if (point) {
          return {
            latitude: point.lat,
            longitude: point.lon,
          };
        }
      }
      console.warn(`No coordinates found for address: ${cityName}, ${address}`);
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  }

  private async saveNewMenuItems(cityName: string) {
    if (this.newMenuItems.length > 0) {
      try {
        const menuFileName = this.getMenuFileName(cityName);
        if (!menuFileName) {
          console.warn(`No menu file found for city: ${cityName}. New items will not be saved.`);
          return;
        }
  
        const filePath = `menuList/${menuFileName}`;
        let menuList: any[] = [];
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          menuList = JSON.parse(fileContent);
        } catch (readError) {
          console.warn(`Error reading ${filePath}. Creating new file.`);
        }
  
        menuList.push(...this.newMenuItems);
        await fs.writeFile(filePath, JSON.stringify(menuList, null, 2));
        console.log(`Added ${this.newMenuItems.length} new items to ${filePath}`);
        this.newMenuItems = []; // Clear the new items after saving
      } catch (error) {
        console.error("Error saving new menu items:", error);
      }
    }
  }
  private async searchPlacesInRadius(
    latitude: number,
    longitude: number
  ): Promise<any[]> {
    try {
      console.log("Searching for places within radius...");
      const response = await axios.get(
        "https://catalog.api.2gis.com/3.0/items",
        {
          params: {
            q: "кафе и рестораны",
            point: `${longitude},${latitude}`,
            radius: 1000,
            sort_point: `${longitude},${latitude}`,
            sort: "distance",
            key: twoGisApiKey,
          },
        }
      );
      console.log("2GIS API response:", response.data);
      console.log("Found", response.data.result.items[0]);
      return response.data.result.items;
    } catch (error) {
      console.error("Error fetching data from 2GIS API:", error);
      return [];
    }
  }

  private async getMenuData(places: any[], cityName: string): Promise<any[]> {
    try {
      const menuFileName = this.getMenuFileName(cityName);
      let menuList: any[] = [];
  
      if (menuFileName) {
        try {
          const fileContent = await fs.readFile(`menuList/${menuFileName}`, 'utf-8');
          menuList = JSON.parse(fileContent);
        } catch (readError) {
          console.warn(`Error reading ${menuFileName}. Starting with empty menu list.`);
        }
      }
  
      const menuData: any[] = [];
  
      for (const place of places) {
        console.log(`Processing place: ${place.name} (ID: ${place.id})`);
        const menuItem = menuList.find((item: any) => item.id === place.id);
        if (menuItem) {
          console.log(`Found existing menu data for ${place.name}`);
          menuData.push(menuItem);
        } else {
          console.log(`Cafe "${place.name}" not found in ${menuFileName || 'any menu file'}. Parsing menu...`);
          const parsedMenu = await this.parseMenu(place.id);
          const newMenuItem = {
            id: place.id,
            name: place.name,
            parsedImages: parsedMenu.images,
            parsedMenu: parsedMenu.dishes,
          };
          menuData.push(newMenuItem);
  
          // Store new menu item in memory instead of writing to file immediately
          this.newMenuItems.push(newMenuItem);
          console.log(`Added "${place.name}" to memory`);
        }
      }
  
      console.log(`Processed ${menuData.length} menus`);
      return menuData;
    } catch (error) {
      console.error("Error in getMenuData:", error);
      return [];
    }
  }
  
  private getMenuFileName(cityName: string): string | null {
    switch (cityName) {
      case 'Алматы':
        return 'menuAlmaty.json';
      case 'Астана':
        return 'menuAstana.json';
      case 'Шымкент':
        return 'menuShymkent.json';
      case 'Уральск':
        return 'menuUralsk.json';
      default:
        return null;
    }
  }

  private async parseMenu(
    placeId: string
  ): Promise<{ images: string[]; dishes: string[] }> {
    try {
      console.log(`Parsing menu for placeId ${placeId}`);
      const images = await scrapeMenuImages(placeId);
      let parsedMenu: string[] = [];

      if (images.length > 0) {
        console.log(
          `Found images for placeId ${placeId}. Sending images to Gemini.`
        );
        parsedMenu = await sendImagesToGemini(images);
      } else {
        console.log(
          `No images found for placeId ${placeId}. Falling back to text menu.`
        );
        const textMenu = await scrapeTextMenu(placeId);
        parsedMenu = textMenu.map((dish) => `${dish.name} - ${dish.price}`);
      }

      return {
        images,
        dishes: parsedMenu,
      };
    } catch (error) {
      console.error(`Error parsing menu for placeId ${placeId}:`, error);
      return { images: [], dishes: [] };
    }
  }

  private async analyzeAndRecommend(
    menuData: any[],
    nutritionScale: any
  ): Promise<any[]> {
    try {
      if (menuData.length === 0) {
        console.log("No menu data available for analysis");
        return [];
      }

      console.log("Analyzing and recommending dishes...");
      const model = await this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const prompt = `Analyze the following menu data and the user's current nutritional needs (represented by the nutrition scale). Recommend the 3 most suitable dishes that best meet these nutritional requirements. Pay close attention to calorie content and other nutritional factors.

      Menu Data: ${JSON.stringify(menuData)}
      User's Nutritional Needs: ${JSON.stringify(nutritionScale)}
      
      For each recommended dish, provide:
      1. The name of the dish
      2. Its price
      3. The restaurant name
      4. A detailed reason for the recommendation, explaining how it aligns with the user's current nutritional needs strongly in russian language.
      
      Prioritize dishes that closely match the required nutritional values. For example, if the user needs 500 calories, recommend dishes that provide close to this amount without significantly exceeding it.
      
      Please provide your recommendations in the following JSON format, enclosed in \`\`\`json tags:
      
      \`\`\`json
      {
        "recommendations": [
          {
            "dish": "Dish Name",
            "price": "Dish Price",
            "restaurant": "Restaurant Name",
            "reason": "Detailed explanation of how this dish meets the user's current nutritional needs in russian language, including specific nutritional values if available."
          }
        ]
      }
      \`\`\`
      
      Ensure that each recommendation is tailored to the user's specific nutritional requirements as indicated in the nutrition scale.`;

      console.log("Generated prompt:", prompt);
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log("Response from Gemini:", response);

      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[1]);
          console.log("Parsed recommendations:", parsedResponse);
          return parsedResponse.recommendations || [];
        } catch (jsonError) {
          console.error("Error parsing extracted JSON:", jsonError);
          return [];
        }
      } else {
        console.error("No valid JSON found in the response");
        return [];
      }
    } catch (error) {
      console.error("Error analyzing and recommending:", error);
      return [];
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
    await page.goto(url, { waitUntil: "networkidle2" });

    console.log("Scrolling to bottom of page to ensure all content is loaded");
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === previousHeight) break;
    }

    console.log("Extracting image URLs from _1qzp1bx elements");
    const images = await page.evaluate(() => {
      const imageUrls: string[] = [];
      const elements = document.querySelectorAll("div._1qzp1bx");
      elements.forEach((el) => {
        const imgElements = el.querySelectorAll("img");
        imgElements.forEach((imgElement) => {
          let src = imgElement.src;
          const srcset = imgElement.srcset;
          if (srcset) {
            const srcsetParts = srcset.split(",");
            const highResSrc = srcsetParts.find((part) => part.includes("2x"));
            if (highResSrc) {
              src = highResSrc.trim().split(" ")[0];
            }
          }
          if (src && src.includes("photo.2gis.com")) {
            imageUrls.push(src);
          }
        });
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

const scrapeTextMenuFromRhwe01 = async (placeId: string) => {
  const url = `https://2gis.kz/almaty/firm/${placeId}/tab/prices`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const dishes = await page.evaluate(() => {
      const dishElements = document.querySelectorAll("article");

      const dishesFromRhwe01 = Array.from(dishElements)
        .map((article) => {
          const name =
            article.querySelector("div._rhwe01")?.textContent?.trim() ||
            "Unnamed dish";
          const price =
            article.querySelector("span._f9pg1j5")?.textContent?.trim() ||
            "Unknown price";

          return { name, price };
        })
        .filter((dish) => dish.name && dish.price);

      return dishesFromRhwe01;
    });

    if (dishes.length > 0) {
      console.log(`Found ${dishes.length} dishes from _rhwe01 class.`);
      return dishes;
    }

    return [];
  } catch (error) {
    console.error(
      `Error scraping text menu from Rhwe01 for placeId ${placeId}:`,
      error
    );
    return [];
  } finally {
    await browser.close();
  }
};

const scrapeTextMenuFrom8mqv20 = async (placeId: string) => {
  const url = `https://2gis.kz/almaty/firm/${placeId}/tab/prices`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const dishes = await page.evaluate(() => {
      const dishElements = document.querySelectorAll("div._8mqv20");

      const dishesFrom8mqv20 = Array.from(dishElements)
        .map((dishElement) => {
          const name =
            dishElement.querySelector("div")?.textContent?.trim() ||
            "Unnamed dish";
          const price =
            dishElement.querySelector("div._5486l5")?.textContent?.trim() ||
            "Unknown price";

          return { name, price };
        })
        .filter((dish) => dish.name && dish.price);

      return dishesFrom8mqv20;
    });

    console.log(`Found ${dishes.length} dishes from _8mqv20 class.`);
    return dishes;
  } catch (error) {
    console.error(
      `Error scraping text menu from 8mqv20 for placeId ${placeId}:`,
      error
    );
    return [];
  } finally {
    await browser.close();
  }
};

const scrapeTextMenu = async (placeId: string) => {
  try {
    let dishes = await scrapeTextMenuFromRhwe01(placeId);

    if (dishes.length === 0) {
      console.log("No dishes found from Rhwe01 class. Trying 8mqv20 class.");
      dishes = await scrapeTextMenuFrom8mqv20(placeId);
    }

    return dishes;
  } catch (error) {
    console.error(`Error scraping text menu for placeId ${placeId}:`, error);
    return [];
  }
};

const fileToGenerativePart = (buffer: Buffer, mimeType: string) => {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
    type: "INLINE",
  };
};

const sendImagesToGemini = async (imageUrls: string[]): Promise<string[]> => {
  try {
    console.log("Sending images to Gemini for analysis...");

    const results = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data, "binary");

        const base64Image = imageBuffer.toString("base64");

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
          },
          {
            text: "Analyze this image of menu and identify the dish and ingredients.",
          },
        ]);

        console.log("Gemini API response:", result.response.text());

        return result.response.text();
      })
    );

    return results;
  } catch (error) {
    console.error("Error sending images to Gemini:", error);
    return [];
  }
};

export default MenuService;
