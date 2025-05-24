import { PrismaClient } from "@prisma/client";

// Create the PrismaClient with more robust error handling
let prisma: PrismaClient;
try {
    prisma = new PrismaClient({});
} catch (error) {
    console.error("Failed to initialize Prisma Client:", error);
    console.error("\nPlease run 'npx prisma generate' or 'bunx prisma generate' before using this script.");
    process.exit(1);
}

async function generateAds() {
    // Show help if requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        displayHelp();
        return;
    }

    if (process.argv.length < 7) {
        console.error("Usage: bun ad_generate.ts <lang> <name> <description> <image> <url>");
        console.error("Try 'bun ad_generate.ts --help' for more information.");
        return;
    }
    const input = process.argv[2];
    if (!input) {
        console.error("Please provide a language code (en or th).");
        return;
    }
    const lang = input.toLowerCase();
    if (lang !== "en" && lang !== "th") {
        console.error("Invalid language code. Please use 'en' or 'th'.");
        return;
    }
    const name = process.argv[3];
    const description = process.argv[4];
    const image = process.argv[5];
    const url = process.argv[6];
    if (!name || !description || !image || !url) {
        console.error("Please provide all required fields: name, description, image, url.");
        return;
    }
    // Validate URL format
    if (!isValidUrl(url)) {
        console.error("Error: Invalid URL format. Please provide a valid URL (e.g., https://example.com)");
        return;
    }

    // Validate image URL format (simple check)
    if (!isValidImageUrl(image)) {
        console.error("Warning: Image URL might not be valid. Please ensure it points to an image file.");
        // Just a warning, continue execution
    }

    // Add confirmation step
    console.log("\nAd details to be created:");
    console.log("-------------------------");
    console.log(`Language: ${lang}`);
    console.log(`Name: ${name}`);
    console.log(`Description: ${description}`);
    console.log(`Image URL: ${image}`);
    console.log(`URL: ${url}`);
    console.log("-------------------------");

    // Check for --force flag to skip confirmation
    if (!process.argv.includes('--force') && !process.argv.includes('-f')) {
        const confirmation = await askForConfirmation("Do you want to create this ad? (y/n): ");
        if (!confirmation) {
            console.log("Operation cancelled by user.");
            await prisma.$disconnect();
            return;
        }
    }

    try {
        // Generate a UUID for the ID field
        const id = generateUUID();

        const ad = await prisma.ads.create({
            data: {
                id: id,
                lang: lang,
                name: name,
                description: description,
                image: image,
                url: url,
            },
        });
        console.log("\n✅ Ad created successfully!");
        console.log(`ID: ${ad.id}`);
        console.log(`Language: ${ad.lang}`);
        console.log(`Name: ${ad.name}`);
    } catch (error) {
        console.error("Error creating ad:", error);
    } finally {
        // Always disconnect from Prisma client to avoid hanging connections
        await prisma.$disconnect();
    }
}

// Helper functions
function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

function isValidImageUrl(string: string): boolean {
    try {
        const url = new URL(string);
        const path = url.pathname.toLowerCase();
        return (
            (url.protocol === "http:" || url.protocol === "https:") &&
            (path.endsWith('.jpg') || path.endsWith('.jpeg') ||
                path.endsWith('.png') || path.endsWith('.gif') ||
                path.endsWith('.webp') || path.endsWith('.svg'))
        );
    } catch (_) {
        return false;
    }
}

async function askForConfirmation(question: string): Promise<boolean> {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer: string) => {
            readline.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

function displayHelp(): void {
    console.log("\nAd Generator Help");
    console.log("================");
    console.log("\nUsage:");
    console.log("  bun ad_generate.ts <lang> <name> <description> <image> <url> [options]");
    console.log("\nArguments:");
    console.log("  lang          Language code (en or th)");
    console.log("  name          Name of the advertisement");
    console.log("  description   Description text for the advertisement");
    console.log("  image         URL to the image for the advertisement");
    console.log("  url           Destination URL for the advertisement");
    console.log("\nOptions:");
    console.log("  --help, -h    Display this help text");
    console.log("  --force, -f   Skip confirmation prompt");
    console.log("\nExample:");
    console.log('  bun ad_generate.ts en "Product Name" "Amazing product description" "https://example.com/image.jpg" "https://example.com/product"');
    console.log("");
}

// Helper function to generate a UUID
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Display a clear message to the user
console.log("Ads Generator Script - Starting...");
console.log("Make sure Prisma is properly generated using 'bunx prisma generate' if you encounter errors");

// Execute the function
generateAds()
    .catch(e => {
        console.error("Script execution failed:", e);
        prisma.$disconnect();
        process.exit(1);
    });