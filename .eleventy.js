module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets/");
    eleventyConfig.addPassthroughCopy("src/");

    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy("_redirects");
    eleventyConfig.addPassthroughCopy({ "pages/demo/example.nvss": "demo/example.nvss" });

    eleventyConfig.addWatchTarget("assets");
    eleventyConfig.addWatchTarget("pages");

    return {
        passthroughFileCopy: true,
        dir: {
            includes: "assets/includes",
            layouts: "assets/includes/layouts",
            data: "assets/data"
        }
    };
    
}
