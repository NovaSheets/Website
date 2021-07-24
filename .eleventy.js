module.exports = function (eleventyConfig) {

	eleventyConfig.addPassthroughCopy("assets/");
	eleventyConfig.addPassthroughCopy("src/");

	eleventyConfig.addPassthroughCopy("CNAME");
	eleventyConfig.addPassthroughCopy("_redirects");
	eleventyConfig.addPassthroughCopy({ "pages/demo/": "demo/" });

	eleventyConfig.addWatchTarget("assets");
	eleventyConfig.addWatchTarget("pages");

	const { execSync } = require('child_process');
	eleventyConfig.on('beforeBuild', () => {
		['main', 'home', 'docs'].forEach(file => execSync(`npx novasheets -c assets/css/${file}.nvss`));
	});

	return {
		passthroughFileCopy: true,
		dir: {
			includes: "assets/includes",
			layouts: "assets/includes/layouts",
			data: "assets/data"
		}
	};

}
