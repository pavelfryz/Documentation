import { readFileSync, writeFileSync } from "fs";
import { sep, join, resolve } from "path";
import { getAllFiles } from "./tools";

const tmpPath = join(process.cwd(), `.${sep}.temp`);
const basePath = join(process.cwd(), `.${sep}public`);
const tmpFile = resolve(tmpPath, `${process.pid}.xml`);
const sitemapFile = resolve(basePath, `sitemap.xml`);

const cache = [];
let timeout: NodeJS.Timeout;
console.log("imported", process.pid);

export const addToSitemap = (name: string, url: string, lastModified?: string) => {
    if (process.env.NODE_ENV !== "production") {
        return;
    }
    cache.push({
        name,
        url,
        lastModified,
    });

    console.log("cache", cache.length, process.pid);

    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const endOfFile = [];
        cache.forEach((c) => {
            endOfFile.unshift(`<url><loc>${c.url}</loc>${c.lastModified !== undefined ? `<lastmod>${c.lastModified}</lastmod>` : ""}</url>`);
        });
        console.log("write", process.pid, endOfFile.length);
        writeFileSync(tmpFile, endOfFile.join("\n"), { encoding: "utf-8" });
        writeAllToSitemap();
    }, 300);
};

export const writeAllToSitemap = () => {
    const filenames = getAllFiles(tmpPath, [], ".xml");
    const results = filenames.map((fn) => readFileSync(fn).toString());
    console.log("xml", filenames.length, process.pid);
    const start = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>/</loc></url>
    <url><loc>/search</loc></url>
    <url><loc>/typedoc</loc></url>`;
    writeFileSync(sitemapFile, [start, ...results, `</urlset>`].join("\n"), { encoding: "utf-8" });
};
