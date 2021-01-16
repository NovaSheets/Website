module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets/");
    eleventyConfig.addPassthroughCopy("src/");
    eleventyConfig.addPassthroughCopy("pages/demo/");

    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy("_redirects");

    eleventyConfig.addWatchTarget("assets");
    eleventyConfig.addWatchTarget("pages");

    return {
        passthroughFileCopy: true,
        dir: {
            includes: "assets/includes",
            data: "assets/data"
        }
    };
    
}