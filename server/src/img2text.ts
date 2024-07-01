import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
// import fetch from "node-fetch";

dotenv.config({ path: "../.env" });

const ACCESS_TOKEN: string | undefined = process.env.ACCESS_TOKEN;
console.log(ACCESS_TOKEN);

const hf = new HfInference(ACCESS_TOKEN);

const model: string = "Salesforce/blip-image-captioning-large";
// const model: string = "nlpconnect/vit-gpt2-image-captioning";

const imageURL: string = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSjtuMumQSNfewX0O_SPc2Hjp89OIJWS5Njw&s";

async function fetchImageCaption() {
    const response = await fetch(imageURL);
    const imageBlob = await response.blob();

    const result = await hf.imageToText({
        data: imageBlob,
        model: model,
    });
    console.log(result);
}

fetchImageCaption().catch(console.error);