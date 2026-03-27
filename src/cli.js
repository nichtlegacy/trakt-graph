#!/usr/bin/env node

/**
 * Trakt Contribution Graph Generator - CLI Entry Point
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { fetchProfileData, fetchTraktHistory, processTraktHistory, imageToBase64, fetchUserStats } from './fetcher.js';
import { generateSvg, generateMultiYearSvg } from './generator.js';
import { svgToPng } from './exporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trakt logo URL
const TRAKT_LOGO_URL = 'https://trakt.tv/assets/logos/logomark.square.gradient-b644b16c38ff775861b4b1f58c1230f6a097a2466ab33ae00445a505c33fcb91.svg';

function getVariantConfigs(outputBasePath, contentType, generateAllVariants) {
  if (!generateAllVariants) {
    return [{ contentType, outputBasePath }];
  }

  const outputDir = path.dirname(outputBasePath);
  return [
    { contentType: 'all', outputBasePath },
    { contentType: 'movies', outputBasePath: path.join(outputDir, 'trakt-movies') },
    { contentType: 'shows', outputBasePath: path.join(outputDir, 'trakt-shows') }
  ];
}

function collectEntriesForYears(rawHistory, years) {
  let allEntries = [];

  for (const year of years) {
    const { entries } = processTraktHistory(rawHistory, year);
    allEntries = allEntries.concat(entries);
  }

  return allEntries;
}

function filterEntriesByContentType(entries, contentType) {
  if (contentType === 'movies') {
    return entries.filter(entry => entry.type === 'movie');
  }

  if (contentType === 'shows') {
    return entries.filter(entry => entry.type === 'episode');
  }

  return entries;
}

async function writeGraphFiles(entries, graphConfig, sharedOptions) {
  const { contentType, outputBasePath } = graphConfig;
  const outputPathDark = `${outputBasePath}-dark.svg`;
  const outputPathLight = `${outputBasePath}-light.svg`;

  const dir = path.dirname(outputPathDark);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const totalMovies = entries.filter(entry => entry.type === 'movie').length;
  const totalEpisodes = entries.filter(entry => entry.type === 'episode').length;
  const svgOptions = {
    ...sharedOptions,
    contentType,
    moviesCount: totalMovies,
    episodesCount: totalEpisodes
  };

  let svgDark;
  let svgLight;

  if (sharedOptions.years.length > 1) {
    svgDark = generateMultiYearSvg(entries, { ...svgOptions, theme: 'dark' });
    svgLight = generateMultiYearSvg(entries, { ...svgOptions, theme: 'light' });
  } else {
    svgDark = generateSvg(entries, { ...svgOptions, year: sharedOptions.years[0], theme: 'dark' });
    svgLight = generateSvg(entries, { ...svgOptions, year: sharedOptions.years[0], theme: 'light' });
  }

  fs.writeFileSync(outputPathDark, svgDark);
  fs.writeFileSync(outputPathLight, svgLight);
  console.log(`   ✓ ${outputPathDark}`);
  console.log(`   ✓ ${outputPathLight}`);

  if (sharedOptions.exportPng) {
    const pngPathDark = outputPathDark.replace('.svg', '.png');
    const pngPathLight = outputPathLight.replace('.svg', '.png');

    await svgToPng(svgDark, pngPathDark);
    await svgToPng(svgLight, pngPathLight);
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);

    let username = null;
    let years = [new Date().getFullYear()]; // Default to current year
    let weekStart = "sunday";
    let outputBasePath = path.join("images", "github-trakt");
    let usernameGradient = true;
    let exportPng = false;
    let contentType = "all"; // 'movies', 'shows', or 'all'
    let generateAllVariants = false;
    let yearsSpecified = false;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('-')) {
        const flag = arg.replace(/^-+/, '').toLowerCase();
        const value = args[i + 1];
        
        switch (flag) {
          case 'y':
          case 'year':
          case 'years':
            if (value && !value.startsWith('-')) {
              if (value.includes(',')) {
                years = value.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));
                yearsSpecified = true;
              } else {
                const parsed = Number.parseInt(value);
                if (!isNaN(parsed)) {
                  years = [parsed];
                  yearsSpecified = true;
                }
              }
              i++;
            }
            break;
          case 'w':
          case 'weekstart':
            if (value && !value.startsWith('-')) {
              weekStart = ['sunday', 'monday'].includes(value.toLowerCase()) ? value.toLowerCase() : 'sunday';
              i++;
            }
            break;
          case 'o':
          case 'output':
            if (value && !value.startsWith('-')) {
              outputBasePath = path.join(path.dirname(value), path.basename(value));
              i++;
            }
            break;
          case 'g':
          case 'gradient':
            if (value && !value.startsWith('-')) {
              usernameGradient = value.toLowerCase() !== 'false';
              i++;
            }
            break;
          case 'p':
          case 'png':
            exportPng = true;
            break;
          case 't':
          case 'type':
            if (value && !value.startsWith('-')) {
              contentType = ['movies', 'shows', 'all'].includes(value.toLowerCase()) ? value.toLowerCase() : 'all';
              i++;
            }
            break;
          case 'all-variants':
            generateAllVariants = true;
            break;
          default:
            console.warn(`Unknown flag "${flag}", ignoring`);
        }
      } else {
        // Floating argument
        if (!username) {
          username = arg;
        } else if (arg.includes(',') || (!isNaN(Number.parseInt(arg)) && arg.length === 4)) {
          // If it looks like a year (or list) and we already have a username, assume it's a year
          let yearList = [];
          if (arg.includes(',')) {
            yearList = arg.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));
          } else {
            const parsed = Number.parseInt(arg);
            if (!isNaN(parsed)) yearList = [parsed];
          }

          if (yearList.length > 0) {
            if (!yearsSpecified) {
              years = yearList;
              yearsSpecified = true;
            } else {
              yearList.forEach(y => {
                if (!years.includes(y)) years.push(y);
              });
            }
          }
        }
      }
    }

    // Sort years descending
    years.sort((a, b) => b - a);


    if (!username) {
      console.error("Error: No username provided.");
      console.log("Usage: node src/cli.js <username> [options]");
      console.log("Options:");
      console.log("  -y <years>    Specify year(s), comma-separated (e.g. 2024,2023)");
      console.log("  -w <day>      Week start: sunday or monday (default: sunday)");
      console.log("  -o <path>     Output path (default: images/github-trakt)");
      console.log("  -g <bool>     Username gradient: true or false (default: true)");
      console.log("  -p            Also export PNG files");
      console.log("  -m <mode>     Graph mode: count or rating (default: count)");
      console.log("  -t <type>     Content type: movies, shows, or all (default: all)");
      console.log("  --all-variants Generate combined, movies, and shows graphs in one run");
      process.exit(1);
    }

    // Check for API key
    if (!process.env.TRAKT_API_KEY) {
      console.error("Error: TRAKT_API_KEY environment variable is not set.");
      console.log("Get your API key from https://trakt.tv/oauth/applications");
      process.exit(1);
    }

    const graphConfigs = getVariantConfigs(outputBasePath, contentType, generateAllVariants);

    console.log(`\n📺 Trakt Contribution Graph Generator\n`);
    console.log(`Username: ${username}`);
    console.log(`Years: ${years.join(', ')}`);
    console.log(`Content: ${generateAllVariants ? 'all variants' : contentType}`);
    console.log(`Week starts on: ${weekStart}`);
    console.log(`Gradient: ${usernameGradient ? '✓' : '✗'}`);
    console.log(`PNG Export: ${exportPng ? '✓' : '✗'}`);
    console.log(`Outputs: ${graphConfigs.map(config => config.outputBasePath).join(', ')}\n`);

    // Fetch profile and stats
    console.log("📋 Fetching profile and stats...");
    const profile = await fetchProfileData(username);
    const stats = await fetchUserStats(username);
    
    const { profileImage, displayName } = profile;
    const profileImageBase64 = profileImage ? await imageToBase64(profileImage) : null;
    
    console.log(`   Display Name: ${displayName}`);
    console.log(`   All Time: ${stats.moviesAllTime} movies, ${stats.episodesAllTime} episodes`);
    console.log(`   Profile Image: ${profileImageBase64 ? '✓' : '✗'}\n`);

    // Fetch Trakt logo
    console.log("📺 Fetching Trakt logo...");
    const logoBase64 = await imageToBase64(TRAKT_LOGO_URL);
    console.log(`   Logo: ${logoBase64 ? '✓' : '✗'}\n`);

    // Fetch watch history
    console.log("📖 Fetching watch history...");
    const minYear = Math.min(...years);
    const fetchType = generateAllVariants ? 'all' : contentType;
    const rawHistory = await fetchTraktHistory(username, fetchType, minYear);
    const allEntries = collectEntriesForYears(rawHistory, years);
    
    console.log(`\n📊 Found ${allEntries.length} entries\n`);

    // Generate SVGs
    console.log("🎨 Generating SVG graphs...");

    const sharedOptions = {
      years,
      weekStart, 
      username, 
      profileImage: profileImageBase64, 
      displayName,
      logoBase64,
      usernameGradient,
      followers: stats.followers,
      exportPng
    };

    if (exportPng) {
      console.log("\n📸 Exporting PNG files...");
    }

    for (const graphConfig of graphConfigs) {
      const variantEntries = filterEntriesByContentType(allEntries, graphConfig.contentType);
      console.log(`\n   ${graphConfig.contentType}: ${variantEntries.length} entries`);
      await writeGraphFiles(variantEntries, graphConfig, sharedOptions);
    }
    
    console.log(`\n✅ Done!\n`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
